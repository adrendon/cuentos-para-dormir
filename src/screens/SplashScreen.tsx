import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useProfile } from '../hooks/useProfile';
import LumioSplash from '../components/LumioSplash';

export default function SplashScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hasNavigated = useRef(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  const goNext = useCallback(() => {
    if (hasNavigated.current || isLoading || !animationFinished) return;
    hasNavigated.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(async () => {
      if (profile.hasCompletedOnboarding) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        router.replace('/library');
      } else {
        router.replace('/onboarding');
      }
    });
  }, [animationFinished, fadeAnim, isLoading, profile.hasCompletedOnboarding, router]);

  useEffect(() => {
    goNext();
  }, [goNext]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LumioSplash onComplete={() => setAnimationFinished(true)} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004B82',
  },
});
