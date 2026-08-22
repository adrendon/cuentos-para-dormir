import AsyncStorage from '@react-native-async-storage/async-storage';
import { downloadBook, isBookDownloaded } from './downloadService';

const EMBEDDED_SETUP_KEY = '@cuentos_embedded_setup_v1';
let setupInProgress: Promise<void> | null = null;

/**
 * Download the default book after the library is already interactive.
 * Keeping this work out of application startup prevents a large ZIP from
 * blocking onboarding and triggering Android's ANR dialog.
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
      const downloaded = await downloadBook('ADayInReverse', () => {});
      if (!downloaded) return;
    }

    await AsyncStorage.setItem(EMBEDDED_SETUP_KEY, 'done');
  } catch (error) {
    console.error('Error setting up embedded books:', error);
    // Don't mark as done — will retry next launch
  }
}
