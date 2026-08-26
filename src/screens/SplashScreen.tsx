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

  const player = useVideoPlayer(logoVideo, (p) => {
    p.loop = false;
    p.muted = true;
    p.currentTime = 0;
  });

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const revealAndPlay = async () => {
      // Never let the native Expo splash cover the MP4 while it is already
      // playing. Hide native splash first, then start the video from frame 0.
      await ExpoSplashScreen.hideAsync().catch(() => undefined);
      if (cancelled || hasStartedVideo.current) return;
      hasStartedVideo.current = true;
      player.currentTime = 0;
      player.play();
    };

    void revealAndPlay();
    return () => {
      cancelled = true;
    };
  }, [player]);

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
    const fallback = setTimeout(() => setVideoFinished(true), 9500);
    return () => {
      subscription.remove();
      clearTimeout(fallback);
    };
  }, [player]);

  useEffect(() => {
    goNext();
  }, [goNext]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <VideoView
        style={styles.video}
        player={player}
        nativeControls={false}
        contentFit="cover"
        surfaceType="textureView"
        allowsFullscreen={false}
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
    ...StyleSheet.absoluteFillObject,
  },
});
