import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../theme/colors';
import { useProfile } from '../hooks/useProfile';

export default function SplashScreen() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoading) return;

    // Show splash for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
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
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoading, profile.hasCompletedOnboarding]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Moon / Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.moonEmoji}>🌙</Text>
        <Text style={styles.title}>Cuentos{'\n'}para Dormir</Text>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Historias mágicas antes de dormir</Text>

      {/* Stars decoration */}
      <Text style={styles.stars}>✨ ⭐ ✨</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.splashBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  moonEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    color: Colors.titleGold,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 44,
  },
  subtitle: {
    color: Colors.subtitleGray,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  stars: {
    fontSize: 24,
    marginTop: 40,
  },
});
