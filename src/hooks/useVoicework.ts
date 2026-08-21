import { useState, useCallback, useRef } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { BOOKS_LOCAL_DIR } from '../services/downloadService';

/**
 * Hook to play voicework narration per page.
 * voicework_es/ contains: voice0-name.mp3, voice1.mp3, voice2.mp3, etc.
 * voice0-name.mp3 = name pronunciation (not used per page)
 * voiceN.mp3 = narration for page N
 */
export function useVoicework(folderName: string | undefined) {
  const [isNarrating, setIsNarrating] = useState(false);
  const [currentNarrationPage, setCurrentNarrationPage] = useState(-1);
  const playerRef = useRef<any>(null);

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
      // Stop current narration
      await stopNarration();

      const voiceFile = `${BOOKS_LOCAL_DIR}${folderName}/voicework_es/voice${pageNumber}.mp3`;
      const fileInfo = await FileSystem.getInfoAsync(voiceFile);

      if (!fileInfo.exists) {
        // No narration for this page
        return;
      }

      // Create and play audio
      const { createAudioPlayer } = require('expo-audio');
      playerRef.current = createAudioPlayer({ uri: voiceFile });
      playerRef.current.play();
      setIsNarrating(true);
      setCurrentNarrationPage(pageNumber);

      // Listen for playback end
      // expo-audio players emit events when done
    } catch (error) {
      console.error('Error playing narration:', error);
      setIsNarrating(false);
    }
  }, [folderName]);

  /**
   * Stop current narration.
   */
  const stopNarration = useCallback(async () => {
    try {
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

  return {
    isNarrating,
    currentNarrationPage,
    playNarration,
    stopNarration,
    toggleNarration,
    hasVoicework,
  };
}
