import * as FileSystem from 'expo-file-system/legacy';
import { unzip } from 'fflate';

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

const GITHUB_BOOKS_BASE_URL =
  'https://github.com/adrendon/cuentos-para-dormir/raw/main/books-zip';

export const BOOKS_LOCAL_DIR = `${FileSystem.documentDirectory}books/`;

export type DownloadStatus = 'idle' | 'downloading' | 'extracting' | 'done' | 'error';

export interface DownloadProgress {
  status: DownloadStatus;
  progress: number; // 0.0 to 1.0
  bytesDownloaded: number;
  totalBytes: number;
  error?: string;
}

type ProgressCallback = (progress: DownloadProgress) => void;

/**
 * Check if a book is already downloaded locally.
 */
export async function isBookDownloaded(folderName: string): Promise<boolean> {
  try {
    const bookDir = `${BOOKS_LOCAL_DIR}${folderName}`;
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
  onProgress: ProgressCallback
): Promise<boolean> {
  const zipUrl = `${GITHUB_BOOKS_BASE_URL}/${folderName}.zip`;
  const zipLocalPath = `${FileSystem.cacheDirectory}${folderName}.zip`;
  const bookDestDir = `${BOOKS_LOCAL_DIR}${folderName}/`;

  try {
    // Ensure books directory exists
    const booksDir = await FileSystem.getInfoAsync(BOOKS_LOCAL_DIR);
    if (!booksDir.exists) {
      await FileSystem.makeDirectoryAsync(BOOKS_LOCAL_DIR, { intermediates: true });
    }

    // Report start
    onProgress({
      status: 'downloading',
      progress: 0,
      bytesDownloaded: 0,
      totalBytes: 0,
    });

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
          progress: prog * 0.7, // Download = 70% of total
          bytesDownloaded: dp.totalBytesWritten,
          totalBytes: dp.totalBytesExpectedToWrite,
        });
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result || result.status !== 200) {
      throw new Error(`Descarga falló (status ${result?.status})`);
    }

    // Extract phase
    onProgress({
      status: 'extracting',
      progress: 0.75,
      bytesDownloaded: 0,
      totalBytes: 0,
    });

    // Read ZIP as base64 and decode
    const zipBase64 = await FileSystem.readAsStringAsync(zipLocalPath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Decode base64 to Uint8Array
    const zipBytes = base64ToUint8Array(zipBase64);

    // Use fflate's asynchronous API so large books do not monopolize the JS
    // thread and trigger Android's "application is not responding" dialog.
    const unzipped = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
      unzip(zipBytes, (error, files) => {
        if (error) reject(error);
        else resolve(files);
      });
    });

    // Ensure dest directory
    const destInfo = await FileSystem.getInfoAsync(bookDestDir);
    if (!destInfo.exists) {
      await FileSystem.makeDirectoryAsync(bookDestDir, { intermediates: true });
    }

    // Write extracted files
    const fileNames = Object.keys(unzipped);
    let filesWritten = 0;

    for (const rawName of fileNames) {
      const fileData = unzipped[rawName];

      // Strip the leading folder (e.g., "ADayInReverse/file.txt" → "file.txt")
      const cleanName = stripLeadingFolder(rawName);
      if (!cleanName || cleanName === '') continue;

      const filePath = `${bookDestDir}${cleanName}`;

      if (rawName.endsWith('/')) {
        // Directory
        await FileSystem.makeDirectoryAsync(filePath, { intermediates: true });
      } else {
        // File - ensure parent dir exists
        const parentDir = filePath.substring(0, filePath.lastIndexOf('/'));
        const parentInfo = await FileSystem.getInfoAsync(parentDir);
        if (!parentInfo.exists) {
          await FileSystem.makeDirectoryAsync(parentDir, { intermediates: true });
        }

        // Write file as base64
        const fileBase64 = uint8ArrayToBase64(fileData);
        await FileSystem.writeAsStringAsync(filePath, fileBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      filesWritten++;
      const extractProgress = 0.75 + (filesWritten / fileNames.length) * 0.25;
      onProgress({
        status: 'extracting',
        progress: Math.min(extractProgress, 0.99),
        bytesDownloaded: 0,
        totalBytes: 0,
      });
    }

    // Clean up zip
    await FileSystem.deleteAsync(zipLocalPath, { idempotent: true });

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
    await FileSystem.deleteAsync(bookDestDir, { idempotent: true });

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

// --- Utilities ---

function stripLeadingFolder(name: string): string {
  const firstSlash = name.indexOf('/');
  if (firstSlash === -1) return name;
  return name.substring(firstSlash + 1);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return btoa(binary);
}
