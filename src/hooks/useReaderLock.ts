import { useCallback, useState } from 'react';

export function useReaderLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

  const lock = useCallback(() => {
    setIsLocked(true);
    setShowUnlockPrompt(false);
  }, []);

  const requestUnlock = useCallback(() => {
    setShowUnlockPrompt(true);
  }, []);

  const hidePrompt = useCallback(() => {
    setShowUnlockPrompt(false);
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    setShowUnlockPrompt(false);
  }, []);

  return {
    isLocked,
    showUnlockPrompt,
    lock,
    requestUnlock,
    hidePrompt,
    unlock,
  };
}
