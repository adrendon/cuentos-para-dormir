import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');
const BOOK_W = SCREEN_W * 0.35;
const BOOK_H = SCREEN_H * 0.55;

interface BookOpeningIntroProps {
  coverColor: string;
  title: string;
  coverImage?: any;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onClose: () => void;
  onSelectMode: (mode: 'read' | 'listen') => void;
}

/**
 * 3D book-opening animation: the cover page rotates open (rotateY)
 * revealing the first page, then the mode selection menu fades in.
 */
export function BookOpeningIntro({
  coverColor,
  title,
  coverImage,
  musicEnabled,
  onToggleMusic,
  onClose,
  onSelectMode,
}: BookOpeningIntroProps) {
  // Animation values
  const coverRotation = useSharedValue(0); // 0 = closed, 1 = open (90deg)
  const pageOpacity = useSharedValue(0);
  const menuOpacity = useSharedValue(0);
  const bookScale = useSharedValue(0.6);

  useEffect(() => {
    // Sequence: scale up book → flip cover open → show menu
    bookScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) });
    pageOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));
    coverRotation.value = withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    menuOpacity.value = withDelay(1400, withTiming(1, { duration: 400 }));
  }, []);

  // Book container scale
  const bookContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookScale.value }],
  }));

  // Cover page flips open (rotateY from 0 to -150deg around left edge)
  const coverStyle = useAnimatedStyle(() => {
    const rotate = interpolate(coverRotation.value, [0, 1], [0, -150]);
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotate}deg` },
      ],
      opacity: interpolate(coverRotation.value, [0, 0.6, 1], [1, 0.8, 0.3]),
    };
  });

  // First page behind the cover
  const pageStyle = useAnimatedStyle(() => ({
    opacity: pageOpacity.value,
  }));

  // Menu fades in after animation
  const menuStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: Colors.backgroundDark }]}>
      {/* Starry background */}
      <View style={styles.stars}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
              },
            ]}
          />
        ))}
      </View>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={onClose}>
          <Image
            source={require('../assets/ui/ic_home.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onToggleMusic}>
          <Image
            source={
              musicEnabled
                ? require('../assets/onboarding/ic_music_on.png')
                : require('../assets/onboarding/ic_music_off.png')
            }
            style={styles.musicIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* 3D Book */}
      <Animated.View style={[styles.bookContainer, bookContainerStyle]}>
        {/* Right page (first page of story, behind cover) */}
        <Animated.View style={[styles.rightPage, pageStyle, { backgroundColor: '#FFF' }]}>
          {coverImage && (
            <Image source={coverImage} style={styles.pageImage} resizeMode="cover" />
          )}
          {!coverImage && (
            <View style={[styles.pageImage, { backgroundColor: coverColor, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ fontSize: 40 }}>📖</Text>
            </View>
          )}
        </Animated.View>

        {/* Cover (front page that flips) */}
        <Animated.View style={[styles.coverPage, { backgroundColor: coverColor }, coverStyle]}>
          <View style={styles.coverContent}>
            <Text style={styles.coverTitle} numberOfLines={2}>{title}</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Mode selection menu */}
      <Animated.View style={[styles.menu, menuStyle]}>
        <TouchableOpacity style={styles.modeButton} onPress={() => onSelectMode('read')}>
          <Image
            source={require('../assets/ui/ic_book_read.png')}
            style={styles.modeIcon}
            resizeMode="contain"
          />
          <Text style={styles.modeLabel}>Leer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeButton} onPress={() => onSelectMode('listen')}>
          <Image
            source={require('../assets/ui/ic_book_listen.png')}
            style={styles.modeIcon}
            resizeMode="contain"
          />
          <Text style={styles.modeLabel}>Escuchar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stars: {
    ...StyleSheet.absoluteFill,
  },
  star: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 22,
    height: 22,
    tintColor: '#FFF',
  },
  musicIconImage: {
    width: 20,
    height: 20,
  },
  bookContainer: {
    width: BOOK_W * 2,
    height: BOOK_H,
    flexDirection: 'row',
    marginBottom: 30,
  },
  coverPage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: BOOK_W,
    height: BOOK_H,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: Colors.accentTurquoise,
    transformOrigin: 'left center',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  coverContent: {
    padding: 16,
    alignItems: 'center',
  },
  coverTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'BalooBhaijaan',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  rightPage: {
    position: 'absolute',
    left: BOOK_W * 0.05,
    top: 0,
    width: BOOK_W,
    height: BOOK_H,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.accentTurquoise,
    overflow: 'hidden',
    zIndex: 1,
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  menu: {
    flexDirection: 'column',
    gap: 14,
    alignItems: 'center',
    position: 'absolute',
    bottom: SCREEN_H * 0.15,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3E9FE0',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    gap: 12,
    width: 220,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modeIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFF',
  },
  modeLabel: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Montserrat-ExtraBold',
  },
});
