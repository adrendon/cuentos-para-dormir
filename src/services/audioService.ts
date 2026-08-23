import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Audio service using expo-audio SDK 57.
 * Uses createAudioPlayer() for non-hook based playback.
 */

let player: AudioPlayer | null = null;
let isSetup = false;
let musicGeneration = 0;

/**
 * Initialize audio mode.
 */
export async function setupPlayer(): Promise<boolean> {
  if (isSetup) return true;

  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
      allowsRecording: false,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
    });
    isSetup = true;
    return true;
  } catch (error) {
    console.error('Error setting up audio:', error);
    isSetup = true;
    return true;
  }
}

/**
 * Play background music for a book.
 */
export async function playBookMusic(
  bookTitle: string,
  audioUri: string
): Promise<boolean> {
  try {
    const generation = ++musicGeneration;
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists || generation !== musicGeneration) return false;

    const previousPlayer = player;
    player = null;
    previousPlayer?.remove();
    const nextPlayer = createAudioPlayer({ uri: audioUri });
    if (generation !== musicGeneration) {
      nextPlayer.remove();
      return false;
    }
    player = nextPlayer;
    player.volume = 0.35;
    player.play();
    return true;
  } catch (error) {
    console.error('Error playing book music:', error);
    return false;
  }
}

/**
 * Pause music.
 */
export async function pauseMusic(): Promise<void> {
  try {
    if (player) {
      player.pause();
    }
  } catch (error) {
    console.error('Error pausing:', error);
  }
}

/**
 * Resume music.
 */
export async function resumeMusic(): Promise<void> {
  try {
    if (player) {
      player.play();
    }
  } catch (error) {
    console.error('Error resuming:', error);
  }
}

/**
 * Stop and release the player.
 */
export async function stopMusic(): Promise<void> {
  musicGeneration++;
  try {
    if (player) {
      const playerToRemove = player;
      player = null;
      playerToRemove.remove();
    }
  } catch (error) {
    console.error('Error stopping:', error);
  }
}

/**
 * Set volume (0.0 to 1.0).
 */
export async function setVolume(volume: number): Promise<void> {
  try {
    if (player) {
      player.volume = Math.max(0, Math.min(1, volume));
    }
  } catch (error) {
    console.error('Error setting volume:', error);
  }
}

/**
 * Get current volume.
 */
export async function getVolume(): Promise<number> {
  try {
    if (player) {
      return player.volume;
    }
    return 1.0;
  } catch {
    return 1.0;
  }
}

/**
 * Duck volume for narration overlay.
 */
export async function duckVolume(): Promise<void> {
  await setVolume(0.08);
}

/**
 * Restore volume after ducking.
 */
export async function restoreVolume(): Promise<void> {
  await setVolume(0.35);
}

/**
 * PlaybackService placeholder — not needed with expo-audio.
 */
export async function PlaybackService(): Promise<void> {}
