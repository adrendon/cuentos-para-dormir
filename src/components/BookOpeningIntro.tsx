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
}: BookOpeningIntroProps) {
  const { width, height } = useWindowDimensions();
  const pageWidth = Math.min(width * 0.25, 330);
  const pageHeight = Math.min(height * 0.57, pageWidth * 0.72);
  const [menuReady, setMenuReady] = useState(false);
  const coverRotation = useSharedValue(0);
  const bookScale = useSharedValue(0.72);

  useEffect(() => {
    bookScale.value = withTiming(1, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
    coverRotation.value = withDelay(
      350,
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) })
    );
    const menuTimer = setTimeout(() => setMenuReady(true), 1350);
    return () => clearTimeout(menuTimer);
  }, [bookScale, coverRotation]);

  const bookStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookScale.value }],
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
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.roundButton} onPress={onClose} accessibilityLabel="Biblioteca">
            <Image source={require('../assets/ui/ic_home.png')} style={styles.topIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.roundButton} onPress={onToggleMusic} accessibilityLabel="Música">
            <Image
              source={
                musicEnabled
                  ? require('../assets/onboarding/ic_music_on.png')
                  : require('../assets/onboarding/ic_music_off.png')
              }
              style={styles.musicIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.centeredMenu}>
          <TouchableOpacity style={styles.modeButton} onPress={() => onSelectMode('read')}>
            <Image source={require('../assets/ui/ic_book_read.png')} style={styles.modeIcon} />
            <Text style={styles.modeLabel}>Leer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeButton} onPress={() => onSelectMode('listen')}>
            <Image source={require('../assets/ui/ic_book_listen.png')} style={styles.modeIcon} />
            <Text style={styles.modeLabel}>Escuchar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeButton} onPress={() => onSelectMode('record')}>
            <View style={styles.microphoneIcon}>
              <View style={styles.microphoneHead} />
              <View style={styles.microphoneStand} />
            </View>
            <Text style={styles.modeLabel}>Grabar</Text>
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

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.roundButton} onPress={onClose} accessibilityLabel="Biblioteca">
          <Image source={require('../assets/ui/ic_home.png')} style={styles.topIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.roundButton}
          onPress={onToggleMusic}
          accessibilityLabel={musicEnabled ? 'Silenciar música' : 'Activar música'}
        >
          <Image
            source={
              musicEnabled
                ? require('../assets/onboarding/ic_music_on.png')
                : require('../assets/onboarding/ic_music_off.png')
            }
            style={styles.musicIcon}
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
            {coverSource ? (
              <Image source={coverSource} style={styles.coverArtwork} resizeMode="cover" />
            ) : (
              <Text style={styles.coverTitle} numberOfLines={3}>{title}</Text>
            )}
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
    position: 'absolute', top: 18, left: 20, right: 20, zIndex: 20,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  roundButton: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F6F4E8',
    justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  topIcon: { width: 27, height: 27, resizeMode: 'contain' },
  musicIcon: { width: 24, height: 24, resizeMode: 'contain' },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 30,
  },
  book: { position: 'relative' },
  storyPage: {
    position: 'absolute', top: 0, overflow: 'hidden', borderRadius: 10,
    backgroundColor: '#FFF', borderWidth: 3, borderColor: Colors.accentTurquoise,
  },
  pageImage: { width: '100%', height: '100%' },
  pageFallback: { flex: 1 },
  cover: {
    position: 'absolute', top: 0, borderRadius: 10, padding: 20,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3,
    borderColor: Colors.accentTurquoise, backfaceVisibility: 'hidden',
    transformOrigin: 'right center', elevation: 8,
  },
  coverTitle: {
    color: '#FFF', fontSize: 22, fontWeight: 'bold', fontFamily: 'BalooBhaijaan',
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
    gap: 22,
  },
  modeButton: {
    width: 390, minHeight: 88, borderRadius: 44, paddingHorizontal: 48,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22,
    backgroundColor: '#238FDD', borderWidth: 2, borderColor: '#25C8EE', elevation: 5,
  },
  modeIcon: { width: 42, height: 42, tintColor: '#FFF', resizeMode: 'contain' },
  microphoneIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  microphoneHead: {
    width: 16, height: 25, borderRadius: 8, borderWidth: 3, borderColor: '#FFF',
  },
  microphoneStand: {
    width: 24, height: 15, marginTop: -10, borderBottomWidth: 3,
    borderLeftWidth: 3, borderRightWidth: 3, borderColor: '#FFF', borderRadius: 12,
  },
  modeLabel: { color: '#FFF', fontSize: 26, fontFamily: 'Montserrat-ExtraBold' },
});
