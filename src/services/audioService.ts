import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
} from 'react-native-track-player';

/**
 * Audio service for background music playback using react-native-track-player.
 * Supports foreground service on Android for playback with screen locked.
 */

let isSetup = false;

/**
 * Initialize TrackPlayer with required capabilities.
 * Call this once at app startup.
 */
export async function setupPlayer(): Promise<boolean> {
  if (isSetup) return true;

  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
      ],
    });

    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    isSetup = true;
    return true;
  } catch (error) {
    console.error('Error setting up TrackPlayer:', error);
    return false;
  }
}

/**
 * Play background music for a book.
 * @param bookTitle - Title shown in notification
 * @param audioUri - URI or require() of the audio file
 */
export async function playBookMusic(
  bookTitle: string,
  audioUri: string
): Promise<void> {
  try {
    await TrackPlayer.reset();

    await TrackPlayer.add({
      id: 'book-music',
      url: audioUri,
      title: bookTitle,
      artist: 'Cuentos para Dormir',
    });

    await TrackPlayer.play();
  } catch (error) {
    console.error('Error playing book music:', error);
  }
}

/**
 * Pause the current track
 */
export async function pauseMusic(): Promise<void> {
  try {
    await TrackPlayer.pause();
  } catch (error) {
    console.error('Error pausing music:', error);
  }
}

/**
 * Resume playback
 */
export async function resumeMusic(): Promise<void> {
  try {
    await TrackPlayer.play();
  } catch (error) {
    console.error('Error resuming music:', error);
  }
}

/**
 * Stop and reset the player
 */
export async function stopMusic(): Promise<void> {
  try {
    await TrackPlayer.reset();
  } catch (error) {
    console.error('Error stopping music:', error);
  }
}

/**
 * Set volume (0.0 to 1.0)
 */
export async function setVolume(volume: number): Promise<void> {
  try {
    await TrackPlayer.setVolume(Math.max(0, Math.min(1, volume)));
  } catch (error) {
    console.error('Error setting volume:', error);
  }
}

/**
 * Get current volume
 */
export async function getVolume(): Promise<number> {
  try {
    return await TrackPlayer.getVolume();
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
 * PlaybackService - registered at app entry point.
 * Handles remote events (notification controls, audio focus, queue end).
 */
export async function PlaybackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (event.paused) {
      await TrackPlayer.pause();
    } else if (event.permanent) {
      await TrackPlayer.stop();
    } else {
      // Duck volume temporarily
      await TrackPlayer.setVolume(0.3);
      setTimeout(async () => {
        await TrackPlayer.setVolume(1.0);
      }, 1000);
    }
  });
}
