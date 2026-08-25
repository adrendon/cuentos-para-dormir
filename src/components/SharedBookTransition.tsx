import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
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

export function SharedBookTransition({
  direction,
  source,
  coverSource,
  firstPageSource,
  coverColor,
  title,
  onComplete,
}: SharedBookTransitionProps) {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 904, height / 407);
  const pageHeight = Math.min(height * 0.82, 296 * scale);
  const pageWidth = Math.min(width * 0.36, pageHeight * 0.9);
  const bookLeft = (width - pageWidth * 2) / 2;
  const target: BookCardLayout = {
    // A closed front cover occupies the right-hand page and hinges at the spine.
    x: bookLeft + pageWidth,
    y: (height - pageHeight) / 2,
    width: pageWidth,
    height: pageHeight,
  };
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: direction === 'opening' ? 460 : 1180,
      easing: Easing.inOut(Easing.cubic),
    }, (finished) => {
      if (finished) runOnJS(onComplete)();
    });
  }, [direction, onComplete, progress]);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: direction === 'opening'
      ? progress.value
      : interpolate(progress.value, [0, 0.18, 0.72, 1], [0, 1, 1, 0]),
  }));

  const coverStyle = useAnimatedStyle(() => {
    const geometryProgress = direction === 'opening'
      ? progress.value
      : interpolate(progress.value, [0, 0.64, 1], [0, 0, 1]);
    const from = direction === 'opening' ? source : target;
    const to = direction === 'opening' ? target : source;
    const rotation = direction === 'opening'
      ? 0
      : interpolate(progress.value, [0, 0.22, 0.64, 1], [-165, -165, 0, 0]);
    return {
      left: interpolate(geometryProgress, [0, 1], [from.x, to.x]),
      top: interpolate(geometryProgress, [0, 1], [from.y, to.y]),
      width: interpolate(geometryProgress, [0, 1], [from.width, to.width]),
      height: interpolate(geometryProgress, [0, 1], [from.height, to.height]),
      borderRadius: direction === 'opening'
        ? interpolate(geometryProgress, [0, 1], [12 * scale, 10 * scale])
        : interpolate(geometryProgress, [0, 1], [10 * scale, 12 * scale]),
      transform: [
        { perspective: 1400 },
        { rotateY: `${rotation}deg` },
      ],
      opacity: direction === 'closing'
        ? interpolate(progress.value, [0, 0.18, 0.24], [0, 0, 1])
        : 1,
    };
  });

  const storyFrameStyle = useAnimatedStyle(() => {
    if (direction === 'opening') return {};
    const settle = Math.min(1, progress.value / 0.22);
    return {
      left: interpolate(settle, [0, 1], [0, target.x]),
      top: interpolate(settle, [0, 1], [0, target.y]),
      width: interpolate(settle, [0, 1], [width, target.width]),
      height: interpolate(settle, [0, 1], [height, target.height]),
      borderRadius: interpolate(settle, [0, 1], [0, 10 * scale]),
    };
  });

  const pageStyle = useAnimatedStyle(() => ({
    opacity: direction === 'closing'
      ? interpolate(progress.value, [0, 0.42, 0.52], [1, 1, 0])
      : interpolate(progress.value, [0, 0.65, 1], [0, 0, 1]),
  }));

  const cardChromeStyle = useAnimatedStyle(() => ({
    opacity: direction === 'opening'
      ? interpolate(progress.value, [0, 0.35], [1, 0])
      : interpolate(progress.value, [0, 0.72, 1], [0, 0, 1]),
  }));

  return (
    <View style={styles.root} pointerEvents="auto">
      <Animated.View style={[styles.background, backgroundStyle]} />
      {firstPageSource && (
        <Animated.View style={[styles.pageGroup, pageStyle]}>
          <View style={[styles.pageLayerFar, { left: target.x + 8 * scale, top: target.y + 7 * scale, width: target.width, height: target.height, borderColor: coverColor }]} />
          <View style={[styles.pageLayerNear, { left: target.x + 4 * scale, top: target.y + 3 * scale, width: target.width, height: target.height, borderColor: coverColor }]} />
          <Animated.View style={[styles.storyPage, { left: target.x, top: target.y, width: target.width, height: target.height, borderColor: coverColor }, storyFrameStyle]}>
            <Image source={firstPageSource} style={styles.artwork} resizeMode="cover" />
          </Animated.View>
        </Animated.View>
      )}
      <Animated.View style={[styles.cover, { backgroundColor: coverColor, borderColor: coverColor }, coverStyle]}>
        <View style={styles.coverFront}>
          {coverSource ? (
            <Image source={coverSource} style={styles.artwork} resizeMode="cover" />
          ) : (
            <Text style={styles.title} numberOfLines={3}>{title}</Text>
          )}
          <View style={styles.edgeHighlight} />
          <Animated.View style={[styles.cardChrome, cardChromeStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.78)']}
              style={[styles.titleGradient, { paddingVertical: 18 * scale, paddingHorizontal: 16 * scale }]}
            >
              <Text style={[styles.cardTitle, { fontSize: 30 * scale, lineHeight: 36 * scale }]} numberOfLines={2}>
                {title}
              </Text>
            </LinearGradient>
            <Image
              source={require('../assets/ui/ic_page_mark.png')}
              style={[styles.ribbon, {
                right: 32 * scale,
                width: 46 * scale,
                height: 63 * scale,
              }]}
            />
            <Text style={[styles.dots, {
              right: 43 * scale,
              top: 5 * scale,
              width: 24 * scale,
              fontSize: 31 * scale,
              lineHeight: 34 * scale,
            }]}>⋮</Text>
          </Animated.View>
        </View>
        <View style={[styles.coverBack, { backgroundColor: coverColor }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, zIndex: 1000 },
  background: { ...StyleSheet.absoluteFill, backgroundColor: Colors.backgroundDark },
  pageGroup: { ...StyleSheet.absoluteFill },
  cover: {
    position: 'absolute',
    transformOrigin: 'left center',
    borderWidth: 3,
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  storyPage: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 3,
  },
  pageLayerFar: { position: 'absolute', borderRadius: 10, backgroundColor: '#D8D4C6', borderWidth: 3, opacity: 0.42 },
  pageLayerNear: { position: 'absolute', borderRadius: 10, backgroundColor: '#ECE9DD', borderWidth: 3, opacity: 0.72 },
  coverFront: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderRadius: 7,
    backfaceVisibility: 'hidden',
  },
  coverBack: {
    ...StyleSheet.absoluteFill,
    borderRadius: 7,
    backfaceVisibility: 'hidden',
    transform: [{ rotateY: '180deg' }],
  },
  artwork: { width: '100%', height: '100%' },
  title: {
    flex: 1,
    padding: 24,
    color: '#FFF',
    fontSize: 28,
    fontFamily: 'BalooBhaijaan',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  edgeHighlight: {
    position: 'absolute', top: 4, right: 2, bottom: 4, width: 5,
    borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.28)',
  },
  cardChrome: { ...StyleSheet.absoluteFill },
  titleGradient: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
  },
  cardTitle: {
    color: '#FFF', fontFamily: 'Montserrat-SemiBold', fontWeight: '700', textAlign: 'center',
  },
  ribbon: { position: 'absolute', top: -2, tintColor: '#FFF' },
  dots: { position: 'absolute', color: '#34343A', fontWeight: 'bold', textAlign: 'center' },
});
