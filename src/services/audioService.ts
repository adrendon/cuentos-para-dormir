import { useAudioPlayer, AudioModule } from 'expo-audio';

/**
 * Audio service using expo-audio (SDK 57 replacement for expo-av).
 * Supports background audio playback on Android.
 */

let currentPlayer: ReturnType<typeof useAudioPlayer> | null = null;
let playerSource: string | null = null;
let isSetup = false;

// Simple audio player manager (non-hook based for service use)
let audioPlayerInstance: any = null;

/**
 * Initialize audio mode for background playback.
 */
export async function setupPlayer(): Promise<boolean> {
  if (isSetup) return true;

  try {
    // Request audio permissions and configure for background
    await AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
    });
    isSetup = true;
    return true;
  } catch (error) {
    console.error('Error setting up audio:', error);
    // Non-fatal - audio mode might not be available
    isSetup = true;
    return true;
  }
}

/**
 * Play background music for a book using expo-audio createAudioPlayer.
 */
export async function playBookMusic(
  bookTitle: string,
  audioUri: string
): Promise<void> {
  try {
    // Stop any currently playing sound
    await stopMusic();

    // Create player with the audio source
    const { createAudioPlayer } = require('expo-audio');
    audioPlayerInstance = createAudioPlayer({ uri: audioUri });
    
    // Play
    audioPlayerInstance.play();
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
    if (audioPlayerInstance) {
      audioPlayerInstance.pause();
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
    if (audioPlayerInstance) {
      audioPlayerInstance.play();
    }
  } catch (error) {
    console.error('Error resuming music:', error);
  }
}

/**
 * Stop and release the player
 */
export async function stopMusic(): Promise<void> {
  try {
    if (audioPlayerInstance) {
      audioPlayerInstance.remove();
      audioPlayerInstance = null;
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
    if (audioPlayerInstance) {
      audioPlayerInstance.volume = Math.max(0, Math.min(1, volume));
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
    if (audioPlayerInstance) {
      return audioPlayerInstance.volume ?? 1.0;
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
 * PlaybackService placeholder - kept for API compatibility.
 */
export async function PlaybackService(): Promise<void> {
  // No-op with expo-audio
}
