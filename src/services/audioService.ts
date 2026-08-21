import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

/**
 * Audio service using expo-av for background music playback.
 * expo-av supports background audio on Android with proper audio mode configuration.
 */

let soundInstance: Audio.Sound | null = null;
let isSetup = false;

/**
 * Initialize audio mode for background playback.
 */
export async function setupPlayer(): Promise<boolean> {
  if (isSetup) return true;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    isSetup = true;
    return true;
  } catch (error) {
    console.error('Error setting up audio:', error);
    return false;
  }
}

/**
 * Play background music for a book.
 */
export async function playBookMusic(
  bookTitle: string,
  audioUri: string
): Promise<void> {
  try {
    // Stop any currently playing sound
    await stopMusic();

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true, isLooping: false, volume: 1.0 }
    );
    soundInstance = sound;

    // Set up playback finished callback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        // Audio finished - this can trigger navigation back
        onPlaybackFinished?.();
      }
    });
  } catch (error) {
    console.error('Error playing book music:', error);
  }
}

// Callback for when playback finishes
let onPlaybackFinished: (() => void) | null = null;

/**
 * Register a callback for when the audio finishes playing.
 */
export function setOnPlaybackFinished(callback: () => void): void {
  onPlaybackFinished = callback;
}

/**
 * Pause the current track
 */
export async function pauseMusic(): Promise<void> {
  try {
    if (soundInstance) {
      await soundInstance.pauseAsync();
    }
  } catch (error) {
    console.error('Error pausing music:', error);
  }
}

/**
 * Resume playback
 */
export async function resumeMusic(): Promise<void> {
  try {
    if (soundInstance) {
      await soundInstance.playAsync();
    }
  } catch (error) {
    console.error('Error resuming music:', error);
  }
}

/**
 * Stop and unload the player
 */
export async function stopMusic(): Promise<void> {
  try {
    if (soundInstance) {
      await soundInstance.stopAsync();
      await soundInstance.unloadAsync();
      soundInstance = null;
    }
  } catch (error) {
    console.error('Error stopping music:', error);
  }
}

/**
 * Set volume (0.0 to 1.0)
 */
export async function setVolume(volume: number): Promise<void> {
  try {
    if (soundInstance) {
      await soundInstance.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    }
  } catch (error) {
    console.error('Error setting volume:', error);
  }
}

/**
 * Get current volume
 */
export async function getVolume(): Promise<number> {
  try {
    if (soundInstance) {
      const status = await soundInstance.getStatusAsync();
      if (status.isLoaded) {
        return status.volume;
      }
    }
    return 1.0;
  } catch {
    return 1.0;
  }
}

/**
 * Duck volume (for voicework overlay)
 */
export async function duckVolume(): Promise<void> {
  await setVolume(0.2);
}

/**
 * Restore volume after ducking
 */
export async function restoreVolume(): Promise<void> {
  await setVolume(1.0);
}

/**
 * PlaybackService placeholder - not needed with expo-av
 * Kept for API compatibility with the rest of the app.
 */
export async function PlaybackService(): Promise<void> {
  // No-op: expo-av handles background audio via Audio mode config
}
