import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

/** Locks the screen orientation while a screen is mounted, restores default on unmount. */
export function useOrientationLock(orientation: ScreenOrientation.OrientationLock) {
  useEffect(() => {
    ScreenOrientation.lockAsync(orientation);
  }, [orientation]);
}
