import * as FileSystem from 'expo-file-system/legacy';
import { getUncompressedSize, subscribe, unzip } from 'react-native-zip-archive';

/**
 * Download service for fetching book ZIP files from GitHub,
 * tracking progress, and extracting them to local storage.
 *
 * Books are stored as ZIP files at:
 * https://github.com/adrendon/cuentos-para-dormir/raw/main/books-zip/{FolderName}.zip
 *
 * Downloaded books are extracted to:
 * {documentDirectory}/books/{FolderName}/
 */

const GITHUB_BOOKS_BASE_URL = 'https://github.com/adrendon/cuentos-para-dormir/raw/main/books-zip';

export const BOOKS_LOCAL_DIR = `${FileSystem.documentDirectory}books/`;

export type DownloadStatus =
  | 'idle'
  | 'downloading'
  | 'extracting'
  | 'validating'
  | 'installing'
  | 'done'
  | 'error';

export interface DownloadProgress {
  status: DownloadStatus;
  progress: number; // 0.0 to 1.0
  bytesDownloaded: number;
  totalBytes: number;
  error?: string;
}

type ProgressCallback = (progress: DownloadProgress) => void;
let extractionQueue: Promise<void> = Promise.resolve();

/**
 * Check if a book is already downloaded locally.
 */
export async function isBookDownloaded(folderName: string): Promise<boolean> {
  try {
    const bookDir = `${BOOKS_LOCAL_DIR}${folderName}`;
    await recoverInterruptedInstall(`${bookDir}/`);
    const info = await FileSystem.getInfoAsync(bookDir);
    if (!info.exists) return false;

    // Verify it has essential files
    const textsFile = await FileSystem.getInfoAsync(`${bookDir}/Texts.csv`);
    return textsFile.exists;
  } catch {
    return false;
  }
}

/**
 * Get list of all downloaded book folder names.
 */
export async function getDownloadedBooks(): Promise<string[]> {
  try {
    const info = await FileSystem.getInfoAsync(BOOKS_LOCAL_DIR);
    if (!info.exists) return [];

    const contents = await FileSystem.readDirectoryAsync(BOOKS_LOCAL_DIR);
    const downloaded: string[] = [];

    for (const name of contents) {
      const dirInfo = await FileSystem.getInfoAsync(`${BOOKS_LOCAL_DIR}${name}`);
      if (dirInfo.isDirectory) {
        const hasTexts = await FileSystem.getInfoAsync(`${BOOKS_LOCAL_DIR}${name}/Texts.csv`);
        if (hasTexts.exists) {
          downloaded.push(name);
        }
      }
    }
    return downloaded;
  } catch {
    return [];
  }
}

/**
 * Download a book ZIP from GitHub and extract it locally.
 */
export async function downloadBook(
  folderName: string,
  onProgress: ProgressCallback,
  bundledZipUri?: string
): Promise<boolean> {
  const zipUrl = `${GITHUB_BOOKS_BASE_URL}/${folderName}.zip`;
  const zipLocalPath = `${FileSystem.cacheDirectory}${folderName}.zip`;
  const bookDestDir = `${BOOKS_LOCAL_DIR}${folderName}/`;
  const installTempDir = `${BOOKS_LOCAL_DIR}.installing-${folderName}/`;

  try {
    // Ensure books directory exists
    const booksDir = await FileSystem.getInfoAsync(BOOKS_LOCAL_DIR);
    if (!booksDir.exists) {
      await FileSystem.makeDirectoryAsync(BOOKS_LOCAL_DIR, { intermediates: true });
    }
    await recoverInterruptedInstall(bookDestDir);
    await FileSystem.deleteAsync(installTempDir, { idempotent: true });

    // Report start
    onProgress({
      status: 'downloading',
      progress: 0,
      bytesDownloaded: 0,
      totalBytes: 0,
    });

    if (bundledZipUri) {
      await FileSystem.copyAsync({ from: bundledZipUri, to: zipLocalPath });
    } else {
      // Download with progress
      const downloadResumable = FileSystem.createDownloadResumable(
        zipUrl,
        zipLocalPath,
        {},
        (dp) => {
          const prog =
            dp.totalBytesExpectedToWrite > 0
              ? dp.totalBytesWritten / dp.totalBytesExpectedToWrite
              : 0;
          onProgress({
            status: 'downloading',
            progress: prog * 0.7,
            bytesDownloaded: dp.totalBytesWritten,
            totalBytes: dp.totalBytesExpectedToWrite,
          });
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result || result.status !== 200) {
        throw new Error(`Descarga falló (status ${result?.status})`);
      }
    }

    const nativeZipPath = toNativePath(zipLocalPath);
    const nativeTempPath = toNativePath(installTempDir);
    const [uncompressedBytes, freeDiskBytes] = await Promise.all([
      getUncompressedSize(nativeZipPath),
      FileSystem.getFreeDiskStorageAsync(),
    ]);
    const requiredFreeBytes = uncompressedBytes + Math.ceil(uncompressedBytes * 0.15);
    if (freeDiskBytes < requiredFreeBytes) {
      throw new Error('No hay suficiente espacio libre para instalar este cuento');
    }

    await FileSystem.makeDirectoryAsync(installTempDir, { intermediates: true });

    // Native file-to-file extraction keeps compressed and expanded data out of
    // the JavaScript heap. Extract into a temporary directory so an interrupted
    // operation can never leave a book marked as installed.
    onProgress({
      status: 'extracting',
      progress: 0.7,
      bytesDownloaded: 0,
      totalBytes: 0,
    });
    await runExtractionExclusive(async () => {
      const progressSubscription = subscribe(({ progress }) => {
        onProgress({
          status: 'extracting',
          progress: 0.7 + Math.min(progress, 1) * 0.2,
          bytesDownloaded: 0,
          totalBytes: 0,
        });
      });
      try {
        await unzip(nativeZipPath, nativeTempPath, 'UTF-8');
      } finally {
        progressSubscription.remove();
      }
    });

    onProgress({ status: 'validating', progress: 0.92, bytesDownloaded: 0, totalBytes: 0 });
    const extractedBookDir = await findExtractedBookRoot(installTempDir);
    await validateExtractedBook(extractedBookDir);

    onProgress({ status: 'installing', progress: 0.97, bytesDownloaded: 0, totalBytes: 0 });
    await installBookAtomically(extractedBookDir, bookDestDir);

    // Clean up ZIP and any empty wrapper directory left by the archive.
    await FileSystem.deleteAsync(zipLocalPath, { idempotent: true });
    await FileSystem.deleteAsync(installTempDir, { idempotent: true });

    onProgress({
      status: 'done',
      progress: 1.0,
      bytesDownloaded: 0,
      totalBytes: 0,
    });

    return true;
  } catch (error: any) {
    console.error(`Error downloading book ${folderName}:`, error);
    onProgress({
      status: 'error',
      progress: 0,
      bytesDownloaded: 0,
      totalBytes: 0,
      error: error.message || 'Error desconocido',
    });

    // Clean up
    await FileSystem.deleteAsync(zipLocalPath, { idempotent: true });
    await FileSystem.deleteAsync(installTempDir, { idempotent: true });

    return false;
  }
}

/**
 * Delete a downloaded book from local storage.
 */
export async function deleteDownloadedBook(folderName: string): Promise<void> {
  try {
    const bookDir = `${BOOKS_LOCAL_DIR}${folderName}`;
    await FileSystem.deleteAsync(bookDir, { idempotent: true });
  } catch (error) {
    console.error(`Error deleting book ${folderName}:`, error);
  }
}

function toNativePath(uri: string): string {
  return decodeURI(uri.replace(/^file:\/\//, ''));
}

async function findExtractedBookRoot(tempDir: string): Promise<string> {
  const rootTexts = await FileSystem.getInfoAsync(`${tempDir}Texts.csv`);
  if (rootTexts.exists) return tempDir;

  const children = await FileSystem.readDirectoryAsync(tempDir);
  for (const child of children) {
    const candidate = `${tempDir}${child}/`;
    const candidateTexts = await FileSystem.getInfoAsync(`${candidate}Texts.csv`);
    if (candidateTexts.exists) return candidate;
  }
  throw new Error('El ZIP no contiene una estructura de cuento válida');
}

async function validateExtractedBook(bookDir: string): Promise<void> {
  const [textsInfo, additionalInfo] = await Promise.all([
    FileSystem.getInfoAsync(`${bookDir}Texts.csv`),
    FileSystem.getInfoAsync(`${bookDir}AdditionalInfo.json`),
  ]);
  if (!textsInfo.exists || !additionalInfo.exists) {
    throw new Error('El cuento descargado está incompleto');
  }

  const rawAdditionalInfo = await FileSystem.readAsStringAsync(`${bookDir}AdditionalInfo.json`);
  const parsed = JSON.parse(rawAdditionalInfo) as { numberOfPages?: number };
  if (!Number.isInteger(parsed.numberOfPages) || (parsed.numberOfPages ?? 0) <= 0) {
    throw new Error('Los metadatos del cuento no son válidos');
  }
}

async function installBookAtomically(sourceDir: string, destinationDir: string): Promise<void> {
  const backupDir = `${destinationDir.replace(/\/$/, '')}.backup/`;
  const destinationInfo = await FileSystem.getInfoAsync(destinationDir);
  await FileSystem.deleteAsync(backupDir, { idempotent: true });

  if (destinationInfo.exists) {
    await FileSystem.moveAsync({ from: destinationDir, to: backupDir });
  }

  try {
    await FileSystem.moveAsync({ from: sourceDir, to: destinationDir });
    await FileSystem.deleteAsync(backupDir, { idempotent: true });
  } catch (error) {
    const backupInfo = await FileSystem.getInfoAsync(backupDir);
    const failedDestinationInfo = await FileSystem.getInfoAsync(destinationDir);
    if (backupInfo.exists && !failedDestinationInfo.exists) {
      await FileSystem.moveAsync({ from: backupDir, to: destinationDir });
    }
    throw error;
  }
}

async function recoverInterruptedInstall(destinationDir: string): Promise<void> {
  const backupDir = `${destinationDir.replace(/\/$/, '')}.backup/`;
  const [destinationInfo, backupInfo] = await Promise.all([
    FileSystem.getInfoAsync(destinationDir),
    FileSystem.getInfoAsync(backupDir),
  ]);
  if (!destinationInfo.exists && backupInfo.exists) {
    await FileSystem.moveAsync({ from: backupDir, to: destinationDir });
  } else if (destinationInfo.exists && backupInfo.exists) {
    await FileSystem.deleteAsync(backupDir, { idempotent: true });
  }
}

async function runExtractionExclusive<T>(task: () => Promise<T>): Promise<T> {
  const previousExtraction = extractionQueue;
  let releaseQueue!: () => void;
  extractionQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });
  await previousExtraction;
  try {
    return await task();
  } finally {
    releaseQueue();
  }
}
