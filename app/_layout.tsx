import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import * as Font from 'expo-font';
import { setupPlayer } from '../src/services/audioService';
import { getVirtualCanvasSize, LANDSCAPE_CONTENT_SCALE } from '../src/theme/layout';
import { VirtualCanvasContext } from '../src/theme/virtualCanvas';

const NAV_MOTION = Object.freeze({
  fade: 320,
  settingsSlide: 460,
});

// Landscape screens were designed against a denser tablet canvas. Rendering
// them at the raw Android dp viewport makes every fixed-size control dominate
// wide phones whose display-size setting reports fewer dp. Give the app a
// slightly larger virtual canvas and scale it back to the physical viewport.
// Backgrounds still cover edge-to-edge, while artwork, cards and controls all
// receive the same correction instead of fixing only their text.
SplashScreen.preventAutoHideAsync();

// The application is a fixed, highly visual children's interface. Android's
// accessibility font multiplier can otherwise enlarge labels independently of
// their buttons, making the whole landscape UI look zoomed and wrapping short
// words onto several lines. Keep text at the size defined by the responsive UI.
const FixedText = Text as typeof Text & { defaultProps?: { allowFontScaling?: boolean } };
const FixedTextInput = TextInput as typeof TextInput & {
  defaultProps?: { allowFontScaling?: boolean };
};
FixedText.defaultProps = { ...FixedText.defaultProps, allowFontScaling: false };
FixedTextInput.defaultProps = { ...FixedTextInput.defaultProps, allowFontScaling: false };

export default function RootLayout() {
  const { width, height } = useWindowDimensions();
  const [, setFontsLoaded] = useState(false);
  const contentScale = width > height ? LANDSCAPE_CONTENT_SCALE : 1;
  const { width: virtualWidth, height: virtualHeight } = getVirtualCanvasSize(width, height);

  useEffect(() => {
    void initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await Font.loadAsync({
        BalooBhaijaan: require('../assets/fonts/baloo_bhaijaan_medium.ttf'),
        'Montserrat-SemiBold': require('../assets/fonts/montserrat_semi_bold.ttf'),
        'Montserrat-ExtraBold': require('../assets/fonts/montserrat_extra_bold.ttf'),
      });
      setFontsLoaded(true);

      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync('hidden');
      }

      // SplashScreen owns the native-splash handoff so it can first set the
      // correct orientation and reveal the video at frame zero without a flash.
      void setupPlayer().catch((error) => {
        console.error('Error initializing audio player:', error);
      });
    } catch (error) {
      console.error('Error initializing app:', error);
      await SplashScreen.hideAsync();
    }
  };

  return (
    <View style={styles.appRoot}>
      <StatusBar hidden />
      <View
        style={[
          styles.scaledViewport,
          {
            width: virtualWidth,
            height: virtualHeight,
            left: (width - virtualWidth) / 2,
            top: (height - virtualHeight) / 2,
            transform: [{ scale: contentScale }],
          },
        ]}
      >
        <VirtualCanvasContext.Provider
          value={{ width: virtualWidth, height: virtualHeight, scale: contentScale }}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: NAV_MOTION.fade,
              contentStyle: { backgroundColor: '#03032A' },
            }}
          >
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="onboarding"
              options={{ animation: 'fade', gestureEnabled: false }}
            />
            <Stack.Screen name="library" options={{ animation: 'fade', gestureEnabled: false }} />
            <Stack.Screen
              name="book/[id]"
              options={{
                animation: 'none',
                gestureEnabled: false,
                presentation: 'transparentModal',
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
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
        </VirtualCanvasContext.Provider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: { flex: 1, overflow: 'hidden', backgroundColor: '#03032A' },
  scaledViewport: { position: 'absolute' },
});
