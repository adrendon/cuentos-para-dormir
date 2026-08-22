import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '../theme/colors';
import { useProfile } from '../hooks/useProfile';

const logoVideo = require('../assets/logo_video.mp4');

export default function SplashScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const hasNavigated = useRef(false);

  const player = useVideoPlayer(logoVideo, (p) => {
    p.loop = false;
    p.play();
  });

  const goNext = () => {
    if (hasNavigated.current || isLoading) return;
    hasNavigated.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      if (profile.hasCompletedOnboarding) {
        router.replace('/library');
      } else {
        router.replace('/onboarding');
      }
    });
  };

  useEffect(() => {
    const subscription = player.addListener('playToEnd', goNext);
    // Safety net in case the video fails to fire playToEnd.
    const fallbackTimer = setTimeout(goNext, 4500);

    return () => {
      subscription.remove();
      clearTimeout(fallbackTimer);
    };
  }, [isLoading, profile.hasCompletedOnboarding]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.splashBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

