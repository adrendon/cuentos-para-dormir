import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BookCardLayout } from '../types/book';
import { Colors } from '../theme/colors';

interface SharedBookTransitionProps {
  direction: 'opening' | 'closing';
  source: BookCardLayout;
  coverSource?: ImageSourcePropType;
  firstPageSource?: ImageSourcePropType;
  coverColor: string;
  title: string;
  onComplete: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const segment = (value: number, start: number, end: number) => {
  'worklet';
  return interpolate(value, [start, end], [0, 1], Extrapolation.CLAMP);
};

export function SharedBookTransition({
  direction,
  source,
  coverSource,
  coverColor,
  title,
  onComplete,
}: SharedBookTransitionProps) {
  const { width, height } = useWindowDimensions();
  const [localWidth, setLocalWidth] = useState<number | null>(null);
  const sourceScale = localWidth ? localWidth / width : 1;
  const localSource = {
    x: source.x * sourceScale,
    y: source.y * sourceScale,
    width: source.width * sourceScale,
    height: source.height * sourceScale,
  };
  const uiScale = clamp(height / 407, 0.78, 1.08);
  const targetWidth = Math.min(localSource.width * 1.16, width * 0.22);
  const targetHeight = targetWidth * (localSource.height / localSource.width);
  const targetLeft = (width - targetWidth) / 2;
  const targetTop = (height - targetHeight) / 2;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!localWidth) return;
    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: direction === 'opening' ? 620 : 460,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      }
    );
  }, [direction, localWidth, onComplete, progress]);

  const timeline = (value: number) => {
    'worklet';
    return direction === 'opening' ? value : 1 - value;
  };

  const backgroundStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    return {
      opacity: interpolate(p, [0, 1], [0, 0.72], Extrapolation.CLAMP),
    };
  });

  const coverStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    return {
      left: interpolate(p, [0, 1], [localSource.x, targetLeft]),
      top: interpolate(p, [0, 1], [localSource.y, targetTop]),
      width: interpolate(p, [0, 1], [localSource.width, targetWidth]),
      height: interpolate(p, [0, 1], [localSource.height, targetHeight]),
      opacity: interpolate(p, [0, 0.72, 1], [1, 1, 0], Extrapolation.CLAMP),
      borderRadius: interpolate(p, [0, 1], [12, 10]),
    };
  });

  const coverChromeStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    return { opacity: interpolate(p, [0, 0.34], [1, 0], Extrapolation.CLAMP) };
  });

  return (
    <View
      style={styles.root}
      pointerEvents="auto"
      onLayout={(event: LayoutChangeEvent) => setLocalWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.background, backgroundStyle]} />

      <Animated.View
        style={[
          styles.frontCover,
          { backgroundColor: coverColor, borderColor: coverColor },
          coverStyle,
        ]}
      >
        <View style={styles.coverFront}>
          {coverSource ? (
            <Image source={coverSource} style={styles.coverArtwork} resizeMode="cover" />
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}
          <Animated.View style={[StyleSheet.absoluteFill, coverChromeStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.titleGradient}
            >
              <Text style={[styles.cardTitle, { fontSize: 22 * uiScale }]} numberOfLines={2}>
                {title}
              </Text>
            </LinearGradient>
            <Image
              source={require('../assets/ui/ic_page_mark.png')}
              style={[
                styles.ribbon,
                { right: 24 * uiScale, width: 42 * uiScale, height: 58 * uiScale },
              ]}
            />
          </Animated.View>
        </View>
        <View style={[styles.coverBack, { backgroundColor: coverColor }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'transparent', 'rgba(0,0,0,0.22)']}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Colors.backgroundDark,
  },
  frontCover: {
    position: 'absolute',
    borderWidth: 3,
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  coverFront: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderRadius: 7,
    backfaceVisibility: 'hidden',
  },
  coverBack: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderRadius: 7,
    backfaceVisibility: 'hidden',
    transform: [{ rotateY: '180deg' }],
  },
  coverArtwork: { width: '100%', height: '100%' },
  title: {
    flex: 1,
    padding: 24,
    color: '#FFF',
    fontSize: 28,
    fontFamily: 'BalooBhaijaan',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  titleGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardTitle: {
    color: '#FFF',
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '700',
    textAlign: 'center',
  },
  ribbon: { position: 'absolute', top: -2, tintColor: '#FFF' },
});
