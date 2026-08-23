import { useCallback, useState } from 'react';

/** Owns the complete child-lock state so BookScreen never references a lock
 * variable that can be dropped independently while resolving merge conflicts. */
export function useReaderLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

  const lock = useCallback(() => {
    setShowUnlockPrompt(false);
    setIsLocked(true);
  }, []);

  const requestUnlock = useCallback(() => setShowUnlockPrompt(true), []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    setShowUnlockPrompt(false);
  }, []);

  return { isLocked, showUnlockPrompt, lock, requestUnlock, unlock };
}
