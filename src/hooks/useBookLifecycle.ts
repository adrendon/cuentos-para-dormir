import { useCallback, useEffect } from 'react';
import { AppState, BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';

interface BookLifecycleOptions {
  isLocked: boolean;
  onBack: () => void;
  onDeactivate: () => void;
}

/** Owns the native lifecycle rules shared by every reader stage. */
export function useBookLifecycle({ isLocked, onBack, onDeactivate }: BookLifecycleOptions): void {
  useFocusEffect(useCallback(() => onDeactivate, [onDeactivate]));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') onDeactivate();
    });
    return () => subscription.remove();
  }, [onDeactivate]);

  useEffect(() => {
    void activateKeepAwakeAsync();
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      void deactivateKeepAwake();
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isLocked) onBack();
      return true;
    });
    return () => subscription.remove();
  }, [isLocked, onBack]);
}
