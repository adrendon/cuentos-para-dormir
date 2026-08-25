import { useCallback, useEffect, useRef, useState } from 'react';
import { Book } from '../types/book';
import { getBookAudioUri } from './useBookPages';
import {
  pauseMusic,
  playBookMusic,
  resumeMusic,
  setVolume,
  stopMusic,
} from '../services/audioService';

export function useBookMusic(
  book: Book | undefined,
  enabled: boolean,
  savedVolume: number,
  persistVolume: (volume: number) => Promise<void>
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(savedVolume);
  const volumeBeforeMute = useRef(savedVolume);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingVolume = useRef<number | null>(null);
  const persistVolumeRef = useRef(persistVolume);
  persistVolumeRef.current = persistVolume;

  useEffect(() => {
    setMusicVolume(savedVolume);
    volumeBeforeMute.current = savedVolume;
    void setVolume(savedVolume);
  }, [savedVolume]);

  useEffect(() => {
    let cancelled = false;
    if (book && enabled) {
      void setVolume(savedVolume)
        .then(() => playBookMusic(book.title, getBookAudioUri(book)))
        .then((started) => { if (!cancelled) setIsPlaying(started); });
    } else {
      setIsPlaying(false);
      void stopMusic();
    }

    return () => {
      cancelled = true;
      void stopMusic();
    };
  }, [book?.id, enabled]);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      volumeBeforeMute.current = musicVolume;
      await setVolume(0);
      await pauseMusic();
      setIsPlaying(false);
      return;
    }
    await setVolume(volumeBeforeMute.current);
    await resumeMusic();
    setMusicVolume(volumeBeforeMute.current);
    setIsPlaying(true);
  }, [isPlaying, musicVolume]);

  const changeVolume = useCallback(async (volume: number) => {
    setMusicVolume(volume);
    volumeBeforeMute.current = volume;
    await setVolume(volume);
    pendingVolume.current = volume;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      pendingVolume.current = null;
      void persistVolumeRef.current(volume);
    }, 300);
  }, []);

  useEffect(() => () => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    if (pendingVolume.current !== null) void persistVolumeRef.current(pendingVolume.current);
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    void stopMusic();
  }, []);

  return { isPlaying, musicVolume, toggle, changeVolume, stop };
}
