import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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

export function SharedBookTransition({ direction, source, coverSource, firstPageSource, coverColor, title, onComplete }: SharedBookTransitionProps) {
  const { width, height } = useWindowDimensions();
  const uiScale = clamp(height / 407, 0.78, 1.08);
  const pageHeight = Math.min(height * 0.78, 286 * uiScale);
  const pageWidth = Math.min(width * 0.31, pageHeight * 0.9);
  const bookLeft = (width - pageWidth * 2) / 2;
  const target: BookCardLayout = {
    x: bookLeft + pageWidth,
    y: (height - pageHeight) / 2,
    width: pageWidth,
    height: pageHeight,
  };
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: direction === 'opening' ? 1120 : 1050,
        easing: Easing.inOut(Easing.cubic),
      },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      },
    );
  }, [direction, onComplete, progress]);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: direction === 'opening'
      ? interpolate(progress.value, [0, 0.28, 1], [0, 0.72, 1])
      : interpolate(progress.value, [0, 0.72, 1], [1, 0.62, 0]),
  }));

  const pageStyle = useAnimatedStyle(() => ({
    opacity: direction === 'opening'
      ? interpolate(progress.value, [0.46, 0.68, 1], [0, 0.72, 1])
      : interpolate(progress.value, [0, 0.30, 0.52], [1, 0.82, 0]),
    transform: [
      {
        scale: direction === 'opening'
          ? interpolate(progress.value, [0.46, 1], [0.975, 1])
          : interpolate(progress.value, [0, 0.52], [1, 0.98]),
      },
    ],
  }));

  const coverStyle = useAnimatedStyle(() => {
    let left: number;
    let top: number;
    let currentWidth: number;
    let currentHeight: number;
    let rotation: number;
    let scale: number;

    if (direction === 'opening') {
      const geometry = interpolate(progress.value, [0, 0.55, 1], [0, 1, 1]);
      left = interpolate(geometry, [0, 1], [source.x, target.x]);
      top = interpolate(geometry, [0, 1], [source.y, target.y]);
      currentWidth = interpolate(geometry, [0, 1], [source.width, target.width]);
      currentHeight = interpolate(geometry, [0, 1], [source.height, target.height]);
      rotation = interpolate(progress.value, [0, 0.50, 0.98, 1], [0, 0, -168, -168]);
      scale = interpolate(progress.value, [0, 0.35, 0.55, 1], [1, 1.035, 1, 1]);
    } else {
      const geometry = interpolate(progress.value, [0, 0.46, 1], [0, 0, 1]);
      left = interpolate(geometry, [0, 1], [target.x, source.x]);
      top = interpolate(geometry, [0, 1], [target.y, source.y]);
      currentWidth = interpolate(geometry, [0, 1], [target.width, source.width]);
      currentHeight = interpolate(geometry, [0, 1], [target.height, source.height]);
      rotation = interpolate(progress.value, [0, 0.42, 0.48, 1], [-168, 0, 0, 0]);
      scale = interpolate(progress.value, [0, 0.46, 0.72, 1], [1, 1.015, 1.02, 1]);
    }

    return {
      left,
      top,
      width: currentWidth,
      height: currentHeight,
      borderRadius: 10 * uiScale,
      transform: [
        { perspective: 1600 },
        { translateX: -currentWidth / 2 },
        { rotateY: `${rotation}deg` },
        { translateX: currentWidth / 2 },
        { scale },
      ],
    };
  });

  const cardChromeStyle = useAnimatedStyle(() => ({
    opacity: direction === 'opening'
      ? interpolate(progress.value, [0, 0.38, 0.56], [1, 0.7, 0])
      : interpolate(progress.value, [0, 0.78, 1], [0, 0, 1]),
  }));

  const spineStyle = useAnimatedStyle(() => ({
    opacity: direction === 'opening'
      ? interpolate(progress.value, [0.48, 0.72, 1], [0, 0.45, 0.78])
      : interpolate(progress.value, [0, 0.42, 0.55], [0.78, 0.4, 0]),
  }));

  return (
    <View style={styles.root} pointerEvents="auto">
      <Animated.View style={[styles.background, backgroundStyle]} />

      {firstPageSource && (
        <Animated.View style={[styles.pageGroup, pageStyle]}>
          <View style={[styles.pageLayerFar, {
            left: target.x + 7 * uiScale,
            top: target.y + 6 * uiScale,
            width: target.width,
            height: target.height,
            borderColor: coverColor,
          }]} />
          <View style={[styles.pageLayerNear, {
            left: target.x + 3 * uiScale,
            top: target.y + 3 * uiScale,
            width: target.width,
            height: target.height,
            borderColor: coverColor,
          }]} />
          <View style={[styles.storyPage, {
            left: target.x,
            top: target.y,
            width: target.width,
            height: target.height,
            borderColor: coverColor,
          }]}>
            <Image source={firstPageSource} style={styles.artwork} resizeMode="cover" />
          </View>
        </Animated.View>
      )}

      <Animated.View style={[styles.spineShadow, {
        left: target.x - 8 * uiScale,
        top: target.y + 4 * uiScale,
        width: 16 * uiScale,
        height: target.height - 8 * uiScale,
      }, spineStyle]} />

      <Animated.View style={[styles.cover, { backgroundColor: coverColor, borderColor: coverColor }, coverStyle]}>
        <View style={styles.coverFront}>
          {coverSource ? <Image source={coverSource} style={styles.artwork} resizeMode="cover" /> : <Text style={styles.title} numberOfLines={3}>{title}</Text>}
          <Animated.View style={[styles.cardChrome, cardChromeStyle]}>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.78)']} style={styles.titleGradient}>
              <Text style={[styles.cardTitle, { fontSize: 23 * uiScale, lineHeight: 28 * uiScale }]} numberOfLines={2}>{title}</Text>
            </LinearGradient>
            <Image source={require('../assets/ui/ic_page_mark.png')} style={[styles.ribbon, { right: 28 * uiScale, width: 42 * uiScale, height: 58 * uiScale }]} />
          </Animated.View>
        </View>
        <View style={[styles.coverBack, { backgroundColor: coverColor }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 1000, overflow: 'hidden' },
  background: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.backgroundDark },
  pageGroup: { ...StyleSheet.absoluteFillObject },
  cover: {
    position: 'absolute',
    borderWidth: 3,
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  pageLayerFar: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#D8D4C6',
    borderWidth: 3,
    opacity: 0.46,
  },
  pageLayerNear: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#ECE9DD',
    borderWidth: 3,
    opacity: 0.76,
  },
  storyPage: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 3,
  },
  spineShadow: {
    position: 'absolute',
    zIndex: 8,
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderRadius: 9,
  },
  coverFront: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', borderRadius: 7, backfaceVisibility: 'hidden' },
  coverBack: { ...StyleSheet.absoluteFillObject, borderRadius: 7, backfaceVisibility: 'hidden', transform: [{ rotateY: '180deg' }] },
  artwork: { width: '100%', height: '100%' },
  title: { flex: 1, padding: 24, color: '#FFF', fontSize: 28, fontFamily: 'BalooBhaijaan', textAlign: 'center', textAlignVertical: 'center' },
  cardChrome: { ...StyleSheet.absoluteFillObject },
  titleGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingVertical: 14, paddingHorizontal: 14 },
  cardTitle: { color: '#FFF', fontFamily: 'Montserrat-SemiBold', fontWeight: '700', textAlign: 'center' },
  ribbon: { position: 'absolute', top: -2, tintColor: '#FFF' },
});
