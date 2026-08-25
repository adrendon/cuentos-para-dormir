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
  const target: BookCardLayout = { x: bookLeft + pageWidth, y: (height - pageHeight) / 2, width: pageWidth, height: pageHeight };
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: direction === 'opening' ? 520 : 980,
      easing: Easing.inOut(Easing.cubic),
    }, (finished) => { if (finished) runOnJS(onComplete)(); });
  }, [direction, onComplete, progress]);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: direction === 'opening'
      ? interpolate(progress.value, [0, 0.35, 1], [0, 0.72, 1])
      : interpolate(progress.value, [0, 0.72, 1], [1, 0.55, 0]),
  }));

  const coverStyle = useAnimatedStyle(() => {
    const from = direction === 'opening' ? source : target;
    const to = direction === 'opening' ? target : source;
    const currentWidth = interpolate(progress.value, [0, 1], [from.width, to.width]);
    const rotation = direction === 'opening'
      ? 0
      : interpolate(progress.value, [0, 0.42, 0.82, 1], [-168, -168, 0, 0]);
    return {
      left: interpolate(progress.value, [0, 1], [from.x, to.x]),
      top: interpolate(progress.value, [0, 1], [from.y, to.y]),
      width: currentWidth,
      height: interpolate(progress.value, [0, 1], [from.height, to.height]),
      borderRadius: 10 * uiScale,
      transform: [
        { perspective: 1600 },
        { translateX: -currentWidth / 2 },
        { rotateY: `${rotation}deg` },
        { translateX: currentWidth / 2 },
        { scale: direction === 'opening' ? interpolate(progress.value, [0, 0.65, 1], [1, 1.035, 1]) : 1 },
      ],
      opacity: 1,
    };
  });

  const pageStyle = useAnimatedStyle(() => ({
    opacity: direction === 'opening' ? 0 : interpolate(progress.value, [0, 0.48, 0.72], [1, 1, 0]),
  }));

  const cardChromeStyle = useAnimatedStyle(() => ({
    opacity: direction === 'opening'
      ? interpolate(progress.value, [0, 0.58, 1], [1, 0.45, 0])
      : interpolate(progress.value, [0, 0.76, 1], [0, 0, 1]),
  }));

  return (
    <View style={styles.root} pointerEvents="auto">
      <Animated.View style={[styles.background, backgroundStyle]} />
      {firstPageSource && (
        <Animated.View style={[styles.pageGroup, pageStyle]}>
          <View style={[styles.storyPage, { left: target.x, top: target.y, width: target.width, height: target.height, borderColor: coverColor }]}>
            <Image source={firstPageSource} style={styles.artwork} resizeMode="cover" />
          </View>
        </Animated.View>
      )}
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
  root: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },
  background: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.backgroundDark },
  pageGroup: { ...StyleSheet.absoluteFillObject },
  cover: { position: 'absolute', borderWidth: 3, elevation: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 12 },
  storyPage: { position: 'absolute', overflow: 'hidden', borderRadius: 10, backgroundColor: '#FFF', borderWidth: 3 },
  coverFront: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', borderRadius: 7, backfaceVisibility: 'hidden' },
  coverBack: { ...StyleSheet.absoluteFillObject, borderRadius: 7, backfaceVisibility: 'hidden', transform: [{ rotateY: '180deg' }] },
  artwork: { width: '100%', height: '100%' },
  title: { flex: 1, padding: 24, color: '#FFF', fontSize: 28, fontFamily: 'BalooBhaijaan', textAlign: 'center', textAlignVertical: 'center' },
  cardChrome: { ...StyleSheet.absoluteFillObject },
  titleGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingVertical: 14, paddingHorizontal: 14 },
  cardTitle: { color: '#FFF', fontFamily: 'Montserrat-SemiBold', fontWeight: '700', textAlign: 'center' },
  ribbon: { position: 'absolute', top: -2, tintColor: '#FFF' },
});
