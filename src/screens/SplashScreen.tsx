import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useProfile } from '../hooks/useProfile';

const logoVideo = require('../../assets/lumio-splash.mp4');

export default function SplashScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hasNavigated = useRef(false);
  const [videoFinished, setVideoFinished] = useState(false);

  const player = useVideoPlayer(logoVideo, (p) => {
    p.loop = false;
    p.muted = true;
    p.currentTime = 0;
    p.play();
  });

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    // Android release builds can create the native video surface one frame after
    // the player itself. Re-issuing play after mount avoids remaining on the
    // blue backing view when the initial play() happens too early.
    const timer = setTimeout(() => {
      try {
        player.currentTime = 0;
        player.play();
      } catch {
        // The playToEnd/fallback path below will still let the app continue.
      }
    }, 120);
    return () => clearTimeout(timer);
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
