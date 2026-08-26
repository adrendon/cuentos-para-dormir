import { useCallback, useEffect, useRef, useState } from 'react';

const PROMPT_AUTO_HIDE_MS = 3000;

/** Owns the complete child-lock state so BookScreen never references a lock
 * variable that can be dropped independently while resolving merge conflicts. */
export function useReaderLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const hidePrompt = useCallback(() => {
    clearHideTimer();
    setShowUnlockPrompt(false);
  }, [clearHideTimer]);

  const lock = useCallback(() => {
    clearHideTimer();
    setShowUnlockPrompt(false);
    setIsLocked(true);
  }, [clearHideTimer]);

  const requestUnlock = useCallback(() => {
    clearHideTimer();
    setShowUnlockPrompt(true);
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setShowUnlockPrompt(false);
    }, PROMPT_AUTO_HIDE_MS);
  }, [clearHideTimer]);

  const unlock = useCallback(() => {
    clearHideTimer();
    setIsLocked(false);
    setShowUnlockPrompt(false);
  }, [clearHideTimer]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  return { isLocked, showUnlockPrompt, lock, requestUnlock, hidePrompt, unlock };
}
