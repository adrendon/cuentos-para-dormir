import { useCallback, useState } from 'react';

/** Owns the complete child-lock state so BookScreen never references a lock
 * variable that can be dropped independently while resolving merge conflicts. */
export function useReaderLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

  const hidePrompt = useCallback(() => {
    setShowUnlockPrompt(false);
  }, []);

  const lock = useCallback(() => {
    setShowUnlockPrompt(false);
    setIsLocked(true);
  }, []);

  // While locked, a normal tap only toggles the lock/unlock affordance.
  // It never unlocks the reader.
  const requestUnlock = useCallback(() => {
    setShowUnlockPrompt((visible) => !visible);
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    setShowUnlockPrompt(false);
  }, []);

  return { isLocked, showUnlockPrompt, lock, requestUnlock, hidePrompt, unlock };
}
