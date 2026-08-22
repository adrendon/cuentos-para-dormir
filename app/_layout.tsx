import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { setupPlayer } from '../src/services/audioService';
import { setupEmbeddedBooks } from '../src/services/embeddedBooksService';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Only the status bar should be hidden; keep the Android nav/back bar visible.
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync('visible');
      }

      // Setup audio player
      await setupPlayer();

      // Copy embedded book to local storage on first launch
      await setupEmbeddedBooks();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      // Hide native splash screen
      await SplashScreen.hideAsync();
    }
  };

  return (
    <>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 550,
          contentStyle: { backgroundColor: '#171254' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="library"
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="book/[id]"
          options={{
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
}
