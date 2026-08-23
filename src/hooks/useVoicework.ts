import { useState, useCallback, useEffect, useRef } from 'react';
import { createAudioPlayer } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { BOOKS_LOCAL_DIR } from '../services/downloadService';

/**
 * Hook to play voicework narration per page.
 * voicework_es/ contains: voice1.mp3, voice2.mp3, etc.
 */
export function useVoicework(folderName: string | undefined, onNarrationEnd?: () => void) {
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentNarrationPage, setCurrentNarrationPage] = useState(-1);
  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const playbackGenerationRef = useRef(0);
  const onNarrationEndRef = useRef(onNarrationEnd);
  onNarrationEndRef.current = onNarrationEnd;

  const hasVoicework = useCallback(async (): Promise<boolean> => {
    if (!folderName) return false;
    try {
      const voicePath = `${BOOKS_LOCAL_DIR}${folderName}/voicework_es`;
      const info = await FileSystem.getInfoAsync(voicePath);
      return info.exists;
    } catch {
      return false;
    }
  }, [folderName]);

  /**
   * Play narration for a specific page number.
   */
  const playNarration = useCallback(async (pageNumber: number) => {
    if (!folderName) return;

    try {
      // Stop current narration first
      await stopNarration();
      const playbackGeneration = ++playbackGenerationRef.current;

      const voiceFile = `${BOOKS_LOCAL_DIR}${folderName}/voicework_es/voice${pageNumber}.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(voiceFile);

      if (!fileInfo.exists || playbackGeneration !== playbackGenerationRef.current) return;

      const narrationPlayer = createAudioPlayer({ uri: voiceFile });
      playerRef.current = narrationPlayer;
      statusSubscriptionRef.current = narrationPlayer.addListener('playbackStatusUpdate', (status) => {
        if (
          status.didJustFinish &&
          playbackGeneration === playbackGenerationRef.current
        ) {
          statusSubscriptionRef.current?.remove();
          statusSubscriptionRef.current = null;
          narrationPlayer.remove();
          if (playerRef.current === narrationPlayer) playerRef.current = null;
          setIsNarrating(false);
          setCurrentNarrationPage(-1);
          onNarrationEndRef.current?.();
        }
      });
      narrationPlayer.play();
      setIsNarrating(true);
      setCurrentNarrationPage(pageNumber);
    } catch (error) {
      console.error('Error playing narration:', error);
      setIsNarrating(false);
    }
  }, [folderName]);

  /**
   * Stop current narration.
   */
  const stopNarration = useCallback(async () => {
    playbackGenerationRef.current++;
    try {
      statusSubscriptionRef.current?.remove();
      statusSubscriptionRef.current = null;
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
    } catch {}
    setIsNarrating(false);
    setCurrentNarrationPage(-1);
  }, []);

  /**
   * Toggle narration for a page.
   */
  const toggleNarration = useCallback(async (pageNumber: number) => {
    if (isNarrating && currentNarrationPage === pageNumber) {
      await stopNarration();
    } else {
      await playNarration(pageNumber);
    }
  }, [isNarrating, currentNarrationPage, playNarration, stopNarration]);

  // Expo Router can remove or blur the reader while an async file lookup is in
  // flight. Invalidate that lookup and release the native player on unmount.
  useEffect(() => () => {
    playbackGenerationRef.current++;
    statusSubscriptionRef.current?.remove();
    statusSubscriptionRef.current = null;
    playerRef.current?.remove();
    playerRef.current = null;
  }, []);

  return {
    isNarrating,
    currentNarrationPage,
    playNarration,
    stopNarration,
    toggleNarration,
    hasVoicework,
  };
}
