import { useCallback, useEffect, useRef, useState } from 'react';

const PROMPT_TIMEOUT_MS = 3000;

export function useReaderLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setShowUnlockPrompt(false), PROMPT_TIMEOUT_MS);
  }, [clearTimer]);

  const lock = useCallback(() => {
    setIsLocked(true);
    setShowUnlockPrompt(true);
    scheduleHide();
  }, [scheduleHide]);

  const requestUnlock = useCallback(() => {
    setShowUnlockPrompt(current => {
      const next = !current;
      if (next) scheduleHide(); else clearTimer();
      return next;
    });
  }, [clearTimer, scheduleHide]);

  const hidePrompt = useCallback(() => {
    clearTimer();
    setShowUnlockPrompt(false);
  }, [clearTimer]);

  const unlock = useCallback(() => {
    clearTimer();
    setIsLocked(false);
    setShowUnlockPrompt(false);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { isLocked, showUnlockPrompt, lock, requestUnlock, hidePrompt, unlock };
}
