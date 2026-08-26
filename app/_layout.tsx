import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import * as Font from 'expo-font';
import { setupPlayer } from '../src/services/audioService';

const NAV_MOTION = Object.freeze({
  fade: 320,
  settingsSlide: 460,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [, setFontsLoaded] = useState(false);

  useEffect(() => {
    void initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await Font.loadAsync({
        'BalooBhaijaan': require('../assets/fonts/baloo_bhaijaan_medium.ttf'),
        'Montserrat-SemiBold': require('../assets/fonts/montserrat_semi_bold.ttf'),
        'Montserrat-ExtraBold': require('../assets/fonts/montserrat_extra_bold.ttf'),
      });
      setFontsLoaded(true);

      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync('hidden');
      }

      // The React splash contains the MP4. Reveal it before initializing audio;
      // otherwise the native Expo splash can cover the entire video playback.
      await SplashScreen.hideAsync();

      // Audio initialization is independent from the visual splash and must not
      // keep the native splash over the React video.
      void setupPlayer().catch((error) => {
        console.error('Error initializing audio player:', error);
      });
    } catch (error) {
      console.error('Error initializing app:', error);
      await SplashScreen.hideAsync();
    }
  };

  return (
    <>
      <StatusBar hidden />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: NAV_MOTION.fade, contentStyle: { backgroundColor: '#03032A' } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="library" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="book/[id]" options={{ animation: 'none', gestureEnabled: false, presentation: 'transparentModal', contentStyle: { backgroundColor: 'transparent' } }} />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_bottom',
            animationDuration: NAV_MOTION.settingsSlide,
            gestureEnabled: false,
            presentation: 'card',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </>
  );
}
