import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

interface BookOpeningIntroProps {
  coverColor: string;
  title: string;
  firstPageSource?: ImageSourcePropType;
  coverSource?: ImageSourcePropType;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onClose: () => void;
  onSelectMode: (mode: 'read' | 'listen' | 'record') => void;
  skipEntranceScale?: boolean;
}

const STARS = [
  [6, 14], [13, 75], [19, 34], [27, 9], [34, 87], [42, 23],
  [49, 69], [57, 12], [64, 89], [72, 31], [79, 72], [87, 16],
  [93, 56], [10, 48], [31, 57], [53, 42], [68, 60], [84, 43],
];

/** Book-opening transition followed by a clear reading-mode selector. */
export function BookOpeningIntro({
  coverColor,
  title,
  firstPageSource,
  coverSource,
  musicEnabled,
  onToggleMusic,
  onClose,
  onSelectMode,
  skipEntranceScale = false,
}: BookOpeningIntroProps) {
  const { width, height } = useWindowDimensions();
  const layoutScale = Math.min(width / 1280, height / 768);
  const pageWidth = 396 * layoutScale;
  const pageHeight = 434 * layoutScale;
  const chromeScale = Math.max(0.72, Math.min(1.15, layoutScale));
  const roundButtonSize = 72 * chromeScale;
  const modeButtonWidth = 390 * chromeScale;
  const modeButtonHeight = 96 * chromeScale;
  const modeButtonRadius = modeButtonHeight / 2;
  const [menuReady, setMenuReady] = useState(false);
  const coverRotation = useSharedValue(0);
  const bookScale = useSharedValue(skipEntranceScale ? 1 : 0.72);

  useEffect(() => {
    if (!skipEntranceScale) {
      bookScale.value = withTiming(1, {
        duration: 450,
        easing: Easing.out(Easing.cubic),
      });
    }
    coverRotation.value = withDelay(
      350,
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) })
    );
    const menuTimer = setTimeout(() => setMenuReady(true), 1350);
    return () => clearTimeout(menuTimer);
  }, [bookScale, coverRotation]);

  const bookStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 82 * layoutScale },
      { scale: bookScale.value },
    ],
  }));

  // Cover starts flat (0deg) and flips open to the left (150deg),
  // hinged on its RIGHT edge (transformOrigin: 'right center').
  const coverStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1400 },
      { rotateY: `${interpolate(coverRotation.value, [0, 1], [0, 150])}deg` },
    ],
  }));

  if (menuReady) {
    return (
      <View style={styles.container}>
        {firstPageSource && (
          <Image source={firstPageSource} style={styles.modeBackground} resizeMode="cover" />
        )}
        <View style={styles.modeShade} />
        <View style={[styles.topBar, { top: 16 * chromeScale, left: -6 * chromeScale, right: 18 * chromeScale }]}>
          <TouchableOpacity style={[styles.roundButton, { width: roundButtonSize, height: roundButtonSize, borderRadius: roundButtonSize / 2 }]} onPress={onClose} accessibilityLabel="Biblioteca">
            <Image source={require('../assets/ui/ic_home.png')} style={{ width: 36 * chromeScale, height: 36 * chromeScale }} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roundButton, { width: roundButtonSize, height: roundButtonSize, borderRadius: roundButtonSize / 2 }]} onPress={onToggleMusic} accessibilityLabel="Música">
            <Image
              source={
                musicEnabled
                  ? require('../assets/onboarding/ic_music_on.png')
                  : require('../assets/onboarding/ic_music_off.png')
              }
              style={{ width: 30 * chromeScale, height: 30 * chromeScale }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.centeredMenu, { gap: 40 * chromeScale, transform: [{ translateX: 82 * chromeScale }] }]}>
          <TouchableOpacity style={{ width: modeButtonWidth, height: modeButtonHeight, borderRadius: modeButtonRadius }} onPress={() => onSelectMode('read')}>
            <LinearGradient colors={['#28D4EB', '#278BEC']} style={[styles.modeButton, { borderRadius: modeButtonRadius, paddingHorizontal: 48 * chromeScale }]}>
              <Image source={require('../assets/ui/ic_book_read.png')} style={{ width: 42 * chromeScale, height: 42 * chromeScale }} resizeMode="contain" />
              <Text style={[styles.modeLabel, { fontSize: 36 * chromeScale }]}>Leer</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: modeButtonWidth, height: modeButtonHeight, borderRadius: modeButtonRadius }} onPress={() => onSelectMode('listen')}>
            <LinearGradient colors={['#28D4EB', '#278BEC']} style={[styles.modeButton, { borderRadius: modeButtonRadius, paddingHorizontal: 48 * chromeScale }]}>
              <Image source={require('../assets/ui/ic_book_listen.png')} style={{ width: 42 * chromeScale, height: 42 * chromeScale }} resizeMode="contain" />
              <Text style={[styles.modeLabel, { fontSize: 36 * chromeScale }]}>Escuchar</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: modeButtonWidth, height: modeButtonHeight, borderRadius: modeButtonRadius }} onPress={() => onSelectMode('record')}>
            <LinearGradient colors={['#28D4EB', '#278BEC']} style={[styles.modeButton, { borderRadius: modeButtonRadius, paddingHorizontal: 48 * chromeScale }]}>
              <View style={[styles.microphoneIcon, { width: 42 * chromeScale, height: 42 * chromeScale }]}>
                <View style={styles.microphoneHead} />
                <View style={styles.microphoneStand} />
              </View>
              <Text style={[styles.modeLabel, { fontSize: 36 * chromeScale }]}>Grabar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stars} pointerEvents="none">
        {STARS.map(([left, top], index) => (
          <View key={index} style={[styles.star, { left: `${left}%`, top: `${top}%` }]} />
        ))}
      </View>

      <View style={[styles.topBar, { top: 16 * chromeScale, left: -6 * chromeScale, right: 18 * chromeScale }]}>
        <TouchableOpacity style={[styles.roundButton, { width: roundButtonSize, height: roundButtonSize, borderRadius: roundButtonSize / 2 }]} onPress={onClose} accessibilityLabel="Biblioteca">
          <Image source={require('../assets/ui/ic_home.png')} style={{ width: 36 * chromeScale, height: 36 * chromeScale }} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roundButton, { width: roundButtonSize, height: roundButtonSize, borderRadius: roundButtonSize / 2 }]}
          onPress={onToggleMusic}
          accessibilityLabel={musicEnabled ? 'Silenciar música' : 'Activar música'}
        >
          <Image
            source={
              musicEnabled
                ? require('../assets/onboarding/ic_music_on.png')
                : require('../assets/onboarding/ic_music_off.png')
            }
            style={{ width: 30 * chromeScale, height: 30 * chromeScale }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.book,
            { width: pageWidth * 2, height: pageHeight },
            bookStyle,
          ]}
        >
          {/* First story page — sits on the RIGHT side, revealed as cover flips open */}
          <View
            style={[
              styles.storyPage,
              { left: pageWidth, width: pageWidth, height: pageHeight },
            ]}
          >
            {firstPageSource ? (
              <Image source={firstPageSource} style={styles.pageImage} resizeMode="cover" />
            ) : (
              <View style={[styles.pageFallback, { backgroundColor: coverColor }]} />
            )}
          </View>

          {/* Cover — starts at LEFT position, hinged on its RIGHT edge, flips open to the left */}
          <Animated.View
            style={[
              styles.cover,
              {
                left: 0,
                width: pageWidth,
                height: pageHeight,
                backgroundColor: coverColor,
              },
              coverStyle,
            ]}
          >
            <View style={styles.coverFront}>
              {coverSource ? (
                <Image source={coverSource} style={styles.coverArtwork} resizeMode="cover" />
              ) : (
                <Text style={styles.coverTitle} numberOfLines={3}>{title}</Text>
              )}
            </View>
            <View style={[styles.coverBack, { backgroundColor: coverColor }]} />
          </Animated.View>

          {/* Spine at center */}
          <View style={[styles.spine, { left: pageWidth - 2 }]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  stars: { ...StyleSheet.absoluteFill },
  star: {
    position: 'absolute', width: 4, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  topBar: {
    position: 'absolute', zIndex: 20,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  roundButton: {
    backgroundColor: '#F6F4E8',
    justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  book: { position: 'relative' },
  storyPage: {
    position: 'absolute', top: 0, overflow: 'hidden', borderRadius: 10,
    backgroundColor: '#FFF', borderWidth: 3, borderColor: Colors.accentTurquoise,
  },
  pageImage: { width: '100%', height: '100%' },
  pageFallback: { flex: 1 },
  cover: {
    position: 'absolute', top: 0, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3,
    borderColor: Colors.accentTurquoise,
    transformOrigin: 'right center', elevation: 8,
  },
  coverFront: {
    ...StyleSheet.absoluteFill,
    borderRadius: 7,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  coverBack: {
    ...StyleSheet.absoluteFill,
    borderRadius: 7,
    backfaceVisibility: 'hidden',
    transform: [{ rotateY: '180deg' }],
  },
  coverTitle: {
    flex: 1, padding: 20, color: '#FFF', fontSize: 22, fontWeight: 'bold', fontFamily: 'BalooBhaijaan',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  coverArtwork: { width: '100%', height: '100%', borderRadius: 7 },
  spine: {
    position: 'absolute', top: 3, bottom: 3, width: 4,
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 2,
  },
  modeBackground: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  modeShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 4, 30, 0.66)',
  },
  centeredMenu: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22,
    borderWidth: 2, borderColor: '#25C8EE', elevation: 5,
  },
  microphoneIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  microphoneHead: {
    width: 16, height: 25, borderRadius: 8, borderWidth: 3, borderColor: '#FFF',
  },
  microphoneStand: {
    width: 24, height: 15, marginTop: -10, borderBottomWidth: 3,
    borderLeftWidth: 3, borderRightWidth: 3, borderColor: '#FFF', borderRadius: 12,
  },
  modeLabel: { color: '#FFF', fontFamily: 'Montserrat-ExtraBold' },
});
