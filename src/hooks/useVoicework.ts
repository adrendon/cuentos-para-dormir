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
  const [isNarrationPaused, setIsNarrationPaused] = useState(false);
  const [narrationVolume, setNarrationVolumeState] = useState(1);
  const narrationVolumeRef = useRef(1);
  const [currentNarrationPage, setCurrentNarrationPage] = useState(-1);
  const playerRef = useRef<AudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const playbackGenerationRef = useRef(0);
  const onNarrationEndRef = useRef(onNarrationEnd);
  onNarrationEndRef.current = onNarrationEnd;

  const releaseCurrentPlayer = useCallback(() => {
    statusSubscriptionRef.current?.remove();
    statusSubscriptionRef.current = null;
    const currentPlayer = playerRef.current;
    playerRef.current = null;
    if (!currentPlayer) return;
    // remove() alone is not guaranteed to silence the native decoder before
    // the next JS tick. Mute and pause it first so rapid page changes cannot
    // leave overlapping narration instances behind.
    try {
      currentPlayer.volume = 0;
    } catch {}
    try {
      currentPlayer.pause();
    } catch {}
    try {
      currentPlayer.remove();
    } catch {}
  }, []);

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
  const playNarration = useCallback(
    async (pageNumber: number) => {
      if (!folderName) return false;

      try {
        // Invalidate and release synchronously before the asynchronous file
        // lookup. This makes repeated next/previous taps race-safe.
        playbackGenerationRef.current++;
        releaseCurrentPlayer();
        const playbackGeneration = ++playbackGenerationRef.current;

        const voiceFile = `${BOOKS_LOCAL_DIR}${folderName}/voicework_es/voice${pageNumber}.mp3`;
        const fileInfo = await FileSystem.getInfoAsync(voiceFile);

        if (!fileInfo.exists || playbackGeneration !== playbackGenerationRef.current) return false;

        const narrationPlayer = createAudioPlayer({ uri: voiceFile });
        narrationPlayer.volume = narrationVolumeRef.current;
        playerRef.current = narrationPlayer;
        statusSubscriptionRef.current = narrationPlayer.addListener(
          'playbackStatusUpdate',
          (status) => {
            if (status.didJustFinish && playbackGeneration === playbackGenerationRef.current) {
              statusSubscriptionRef.current?.remove();
              statusSubscriptionRef.current = null;
              narrationPlayer.remove();
              if (playerRef.current === narrationPlayer) playerRef.current = null;
              setIsNarrating(false);
              setIsNarrationPaused(false);
              setCurrentNarrationPage(-1);
              onNarrationEndRef.current?.();
            }
          }
        );
        narrationPlayer.play();
        setIsNarrating(true);
        setIsNarrationPaused(false);
        setCurrentNarrationPage(pageNumber);
        return true;
      } catch (error) {
        console.error('Error playing narration:', error);
        setIsNarrating(false);
        return false;
      }
    },
    [folderName, releaseCurrentPlayer]
  );

  /**
   * Stop current narration.
   */
  const stopNarration = useCallback(async () => {
    playbackGenerationRef.current++;
    releaseCurrentPlayer();
    setIsNarrating(false);
    setIsNarrationPaused(false);
    setCurrentNarrationPage(-1);
  }, [releaseCurrentPlayer]);

  /**
   * Toggle narration for a page.
   */
  const toggleNarration = useCallback(
    async (pageNumber: number) => {
      if (isNarrating && currentNarrationPage === pageNumber) {
        await stopNarration();
        return false;
      } else {
        return playNarration(pageNumber);
      }
    },
    [isNarrating, currentNarrationPage, playNarration, stopNarration]
  );

  const pauseNarration = useCallback(() => {
    playerRef.current?.pause();
    setIsNarrationPaused(true);
  }, []);

  const resumeNarration = useCallback(() => {
    playerRef.current?.play();
    setIsNarrationPaused(false);
  }, []);

  const setNarrationVolume = useCallback((volume: number) => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    narrationVolumeRef.current = normalizedVolume;
    if (playerRef.current) playerRef.current.volume = normalizedVolume;
    setNarrationVolumeState(normalizedVolume);
  }, []);

  // Expo Router can remove or blur the reader while an async file lookup is in
  // flight. Invalidate that lookup and release the native player on unmount.
  useEffect(
    () => () => {
      playbackGenerationRef.current++;
      releaseCurrentPlayer();
    },
    [releaseCurrentPlayer]
  );

  return {
    isNarrating,
    isNarrationPaused,
    narrationVolume,
    currentNarrationPage,
    playNarration,
    stopNarration,
    toggleNarration,
    pauseNarration,
    resumeNarration,
    setNarrationVolume,
    hasVoicework,
  };
}
