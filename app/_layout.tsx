import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import TrackPlayer from 'react-native-track-player';
import { setupPlayer, PlaybackService } from '../src/services/audioService';
import {
  initializeNotifications,
  subscribeToTopic,
} from '../src/services/notificationService';

// Register TrackPlayer playback service (must be at module level)
TrackPlayer.registerPlaybackService(() => PlaybackService);

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Setup audio player
      await setupPlayer();

      // Setup push notifications
      await initializeNotifications();
      await subscribeToTopic('new_books');
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      // Hide native splash screen
      await SplashScreen.hideAsync();
    }
  };

  return (
    <>
      <StatusBar style="light" backgroundColor="#003A1A" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 550,
          contentStyle: { backgroundColor: '#003A1A' },
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
