import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { unzipSync } from 'fflate';
import { BOOKS_LOCAL_DIR } from './downloadService';

const EMBEDDED_SETUP_KEY = '@cuentos_embedded_setup_v1';

/**
 * On first launch, download the default book (ADayInReverse) from GitHub
 * and extract it to documentDirectory so it's available immediately.
 */
export async function setupEmbeddedBooks(): Promise<void> {
  try {
    const alreadySetup = await AsyncStorage.getItem(EMBEDDED_SETUP_KEY);
    if (alreadySetup === 'done') return;

    // Ensure books directory exists
    const booksDir = await FileSystem.getInfoAsync(BOOKS_LOCAL_DIR);
    if (!booksDir.exists) {
      await FileSystem.makeDirectoryAsync(BOOKS_LOCAL_DIR, { intermediates: true });
    }

    // Check if ADayInReverse already exists locally
    const bookPath = `${BOOKS_LOCAL_DIR}ADayInReverse`;
    const bookExists = await FileSystem.getInfoAsync(`${bookPath}/Texts.csv`);

    if (!bookExists.exists) {
      // Download from GitHub
      const zipUrl = 'https://github.com/adrendon/cuentos-para-dormir/raw/main/books-zip/ADayInReverse.zip';
      const zipPath = `${FileSystem.cacheDirectory}ADayInReverse_setup.zip`;

      const result = await FileSystem.downloadAsync(zipUrl, zipPath);

      if (result.status === 200) {
        // Read ZIP as base64
        const zipBase64 = await FileSystem.readAsStringAsync(zipPath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Decode to Uint8Array
        const binaryString = atob(zipBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Unzip
        const unzipped = unzipSync(bytes);

        // Ensure dest dir
        await FileSystem.makeDirectoryAsync(bookPath, { intermediates: true });

        // Write extracted files
        for (const rawName of Object.keys(unzipped)) {
          const fileData = unzipped[rawName];

          // Strip leading folder (e.g. "ADayInReverse/file.txt" -> "file.txt")
          const firstSlash = rawName.indexOf('/');
          const cleanName = firstSlash === -1 ? rawName : rawName.substring(firstSlash + 1);
          if (!cleanName || cleanName === '') continue;

          const filePath = `${bookPath}/${cleanName}`;

          if (rawName.endsWith('/')) {
            await FileSystem.makeDirectoryAsync(filePath, { intermediates: true });
          } else {
            // Ensure parent directory
            const parentDir = filePath.substring(0, filePath.lastIndexOf('/'));
            const parentInfo = await FileSystem.getInfoAsync(parentDir);
            if (!parentInfo.exists) {
              await FileSystem.makeDirectoryAsync(parentDir, { intermediates: true });
            }

            // Convert to base64 and write
            const fileBase64 = uint8ToBase64(fileData);
            await FileSystem.writeAsStringAsync(filePath, fileBase64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          }
        }

        // Clean up zip
        await FileSystem.deleteAsync(zipPath, { idempotent: true });
      }
    }

    await AsyncStorage.setItem(EMBEDDED_SETUP_KEY, 'done');
  } catch (error) {
    console.error('Error setting up embedded books:', error);
    // Don't mark as done — will retry next launch
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
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
