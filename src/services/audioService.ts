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
let preferredVolume = 0.35;
let isDucked = false;

function getEffectiveVolume(): number {
  return isDucked ? Math.min(preferredVolume, 0.08) : preferredVolume;
}

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
 * Always stops any existing playback first.
 */
export async function playBookMusic(
  bookTitle: string,
  audioUri: string
): Promise<boolean> {
  try {
    // ALWAYS stop existing player first
    await stopMusic();

    const generation = ++musicGeneration;
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists || generation !== musicGeneration) return false;

    const nextPlayer = createAudioPlayer({ uri: audioUri });
    if (generation !== musicGeneration) {
      nextPlayer.remove();
      return false;
    }
    player = nextPlayer;
    player.volume = getEffectiveVolume();
    player.loop = true; // Loop background music
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
 * Stop and release the player. Ensures no audio continues.
 */
export async function stopMusic(): Promise<void> {
  musicGeneration++;
  isDucked = false;
  try {
    if (player) {
      const p = player;
      player = null;
      // Force pause before remove to ensure silence
      try { p.pause(); } catch {}
      try { p.volume = 0; } catch {}
      try { p.remove(); } catch {}
    }
  } catch (error) {
    console.error('Error stopping:', error);
    player = null;
  }
}

/**
 * Set volume (0.0 to 1.0).
 */
export async function setVolume(volume: number): Promise<void> {
  try {
    preferredVolume = Math.max(0, Math.min(1, volume));
    if (player) {
      player.volume = getEffectiveVolume();
    }
  } catch (error) {
    console.error('Error setting volume:', error);
  }
}

/**
 * Get current volume.
 */
export async function getVolume(): Promise<number> {
  return preferredVolume;
}

/**
 * Duck volume for narration overlay.
 */
export async function duckVolume(): Promise<void> {
  isDucked = true;
  if (player) player.volume = getEffectiveVolume();
}

/**
 * Restore volume after ducking.
 */
export async function restoreVolume(): Promise<void> {
  isDucked = false;
  if (player) player.volume = preferredVolume;
}

/**
 * Gradually increase volume from 0 to 1 over the given duration.
 */
export function fadeInVolume(durationMs = 1000): Promise<void> {
  return new Promise((resolve) => {
    if (!player) {
      resolve();
      return;
    }
    const steps = Math.max(1, Math.floor(durationMs / 50));
    const increment = 1 / steps;
    let current = 0;
    player.volume = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= 1) {
        current = 1;
        if (player) player.volume = 1;
        clearInterval(interval);
        resolve();
      } else {
        if (player) player.volume = current;
      }
    }, 50);
  });
}

/**
 * Gradually decrease volume from current level to 0, then stop playback.
 */
export function fadeOutVolume(durationMs = 500): Promise<void> {
  return new Promise((resolve) => {
    if (!player) {
      resolve();
      return;
    }
    const startVolume = player.volume;
    const steps = Math.max(1, Math.floor(durationMs / 50));
    const decrement = startVolume / steps;
    let current = startVolume;
    const interval = setInterval(() => {
      current -= decrement;
      if (current <= 0) {
        current = 0;
        if (player) player.volume = 0;
        clearInterval(interval);
        void stopMusic().then(resolve);
      } else {
        if (player) player.volume = current;
      }
    }, 50);
  });
}

/**
 * PlaybackService placeholder — not needed with expo-audio.
 */
export async function PlaybackService(): Promise<void> {}
