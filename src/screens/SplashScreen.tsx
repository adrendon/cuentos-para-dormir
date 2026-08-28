import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useProfile } from '../hooks/useProfile';

const logoVideo = require('../../assets/lumio-splash.mp4');

export default function SplashScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hasNavigated = useRef(false);
  const hasStartedVideo = useRef(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

  const player = useVideoPlayer(logoVideo, (p) => {
    p.loop = false;
    p.muted = false;
    p.volume = 1;
    p.currentTime = 0;
  });

  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;

    const revealAndPlay = async (status = player.status) => {
      if (status !== 'readyToPlay' || cancelled || hasStartedVideo.current) return;
      hasStartedVideo.current = true;

      // Set orientation while the plain native splash still covers the React
      // surface. This avoids showing the logo sideways during Android's turn.
      const orientation = profile.hasCompletedOnboarding
        ? ScreenOrientation.OrientationLock.LANDSCAPE
        : ScreenOrientation.OrientationLock.PORTRAIT_UP;
      await ScreenOrientation.lockAsync(orientation).catch(() => undefined);
      if (cancelled) return;

      // The native layer is intentionally only a solid color. Reveal the one
      // Lumio logo (the video) at frame zero, so the logo is never duplicated.
      await ExpoSplashScreen.hideAsync().catch(() => undefined);
      if (cancelled) return;
      player.currentTime = 0;
      player.play();
      setVideoStarted(true);
    };

    const statusSubscription = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'error') {
        console.error('Error loading splash video:', error?.message);
        void ExpoSplashScreen.hideAsync().catch(() => undefined);
        setVideoFinished(true);
        return;
      }
      void revealAndPlay(status);
    });

    void revealAndPlay();
    return () => {
      cancelled = true;
      statusSubscription.remove();
    };
  }, [isLoading, player, profile.hasCompletedOnboarding]);

  const goNext = useCallback(() => {
    if (hasNavigated.current || isLoading || !videoFinished) return;
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
  }, [fadeAnim, isLoading, profile.hasCompletedOnboarding, router, videoFinished]);

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      setVideoFinished(true);
    });
    const fallback = videoStarted ? setTimeout(() => setVideoFinished(true), 9500) : undefined;
    return () => {
      subscription.remove();
      if (fallback) clearTimeout(fallback);
    };
  }, [player, videoStarted]);

  useEffect(() => {
    goNext();
  }, [goNext]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        contentFit="contain"
        surfaceType="textureView"
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004B82',
  },
  video: {
    position:'absolute',top:0,right:0,bottom:0,left:0,
  },
});
