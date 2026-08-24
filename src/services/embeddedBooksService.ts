import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { downloadBook, isBookDownloaded } from './downloadService';

const STARTER_BOOK_ZIP = require('../assets/ADayInReverse.zip');

const EMBEDDED_SETUP_KEY = '@cuentos_embedded_setup_v1';
let setupInProgress: Promise<void> | null = null;

/**
 * Install the default book (ADayInReverse) from the bundled ZIP on first launch.
 * The ZIP is embedded in src/assets/ so it's always available offline.
 */
export function setupEmbeddedBooks(): Promise<void> {
  if (!setupInProgress) {
    setupInProgress = runEmbeddedBooksSetup().finally(() => {
      setupInProgress = null;
    });
  }
  return setupInProgress;
}

async function runEmbeddedBooksSetup(): Promise<void> {
  try {
    const alreadySetup = await AsyncStorage.getItem(EMBEDDED_SETUP_KEY);
    const isDownloaded = await isBookDownloaded('ADayInReverse');
    if (alreadySetup === 'done' && isDownloaded) return;

    if (!isDownloaded) {
      const asset = Asset.fromModule(STARTER_BOOK_ZIP);
      await asset.downloadAsync();
      const bundledZipUri = asset.localUri ?? asset.uri;
      const success = await downloadBook('ADayInReverse', () => {}, bundledZipUri);
      if (!success) return;
    }

    await AsyncStorage.setItem(EMBEDDED_SETUP_KEY, 'done');
  } catch (error) {
    console.error('Error setting up embedded books:', error);
  }
}
