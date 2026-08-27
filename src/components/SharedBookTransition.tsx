import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
const segment = (value: number, start: number, end: number) =>
  {
    'worklet';
    return interpolate(value, [start, end], [0, 1], Extrapolation.CLAMP);
  };

/**
 * One continuous shared-element timeline. The selected card is never swapped or
 * faded: it travels to the viewport spine first, then becomes the hinged cover
 * of a layered book while the library recedes underneath it.
 */
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
  const uiScale = clamp(height / 407, 0.78, 1.08);
  const pageHeight = Math.min(height * 0.78, 286 * uiScale);
  const pageWidth = Math.min(width * 0.31, pageHeight * 0.9);
  const bookLeft = (width - pageWidth * 2) / 2;
  const bookTop = (height - pageHeight) / 2;
  const spineX = bookLeft + pageWidth;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: direction === 'opening' ? 2200 : 1750,
        easing: direction === 'opening'
          ? Easing.bezier(0.22, 1, 0.36, 1)
          : Easing.bezier(0.4, 0, 0.2, 1),
      },
      (finished) => {
        if (finished) runOnJS(onComplete)();
      },
    );
  }, [direction, onComplete, progress]);

  const timeline = (value: number) => {
    'worklet';
    return direction === 'opening' ? value : 1 - value;
  };

  const backgroundStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    return {
      opacity: interpolate(p, [0, 0.2, 0.5, 1], [0, 0.12, 0.9, 1], Extrapolation.CLAMP),
    };
  });

  const bookStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    const settle = segment(p, 0.78, 1);
    return {
      transform: [
        { translateY: interpolate(settle, [0, 0.62, 1], [10, -2, 0]) },
        { scale: interpolate(p, [0, 0.4, 0.82, 0.94, 1], [0.85, 0.92, 1, 1.015, 1]) },
      ],
    };
  });

  const pagesStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    return {
      opacity: interpolate(p, [0.35, 0.52, 0.68], [0, 0.35, 1], Extrapolation.CLAMP),
      transform: [{ scaleX: interpolate(p, [0.4, 0.82], [0.96, 1], Extrapolation.CLAMP) }],
    };
  });

  const artworkStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    return {
      opacity: interpolate(p, [0.5, 0.68, 0.82], [0, 0.35, 1], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(p, [0.5, 0.82], [5, 0], Extrapolation.CLAMP) }],
    };
  });

  const coverStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    // The global timeline already supplies the fast-out spatial curve. Keeping
    // phase maps normalized prevents drift between the hinge and book body.
    const travel = segment(p, 0.08, 0.46);
    const opening = segment(p, 0.4, 0.86);
    const currentWidth = interpolate(travel, [0, 1], [source.width, pageWidth]);
    return {
      left: interpolate(travel, [0, 1], [source.x, spineX]),
      top: interpolate(travel, [0, 1], [source.y, bookTop]),
      width: currentWidth,
      height: interpolate(travel, [0, 1], [source.height, pageHeight]),
      borderRadius: interpolate(travel, [0, 1], [12, 9]),
      transform: [
        { perspective: 1400 },
        { translateX: currentWidth / 2 },
        { rotateY: `${interpolate(opening, [0, 1], [0, -179])}deg` },
        { translateX: -currentWidth / 2 },
      ],
    };
  });

  const coverChromeStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    return { opacity: interpolate(p, [0, 0.38, 0.53], [1, 1, 0], Extrapolation.CLAMP) };
  });

  const spineStyle = useAnimatedStyle(() => {
    const p = timeline(progress.value);
    return { opacity: interpolate(p, [0.28, 0.48, 0.85], [0, 1, 0.82], Extrapolation.CLAMP) };
  });

  return (
    <View style={styles.root} pointerEvents="auto">
      <Animated.View style={[styles.background, backgroundStyle]} />

      <Animated.View
        style={[
          styles.openBook,
          { left: bookLeft, top: bookTop, width: pageWidth * 2, height: pageHeight },
          bookStyle,
        ]}
      >
        <View style={[styles.backCover, { borderColor: coverColor, backgroundColor: coverColor }]} />
        <Animated.View style={[styles.pages, pagesStyle]}>
          <View style={[styles.leftPage, { width: pageWidth, borderColor: coverColor }]}>
            {firstPageSource && (
              <Animated.Image
                source={firstPageSource}
                style={[styles.spreadArtwork, { width: pageWidth * 2 }, artworkStyle]}
                resizeMode="cover"
              />
            )}
          </View>
          <View style={[styles.rightPage, { left: pageWidth, width: pageWidth, borderColor: coverColor }]}>
            {firstPageSource && (
              <Animated.Image
                source={firstPageSource}
                style={[styles.spreadArtwork, { left: -pageWidth, width: pageWidth * 2 }, artworkStyle]}
                resizeMode="cover"
              />
            )}
          </View>
        </Animated.View>
        <Animated.View style={[styles.spine, { left: pageWidth - 5 * uiScale, width: 10 * uiScale }, spineStyle]} />
      </Animated.View>

      <Animated.View style={[styles.frontCover, { backgroundColor: coverColor, borderColor: coverColor }, coverStyle]}>
        <View style={styles.coverFront}>
          {coverSource ? (
            <Image source={coverSource} style={styles.coverArtwork} resizeMode="cover" />
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}
          <Animated.View style={[StyleSheet.absoluteFill, coverChromeStyle]}>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.titleGradient}>
              <Text style={[styles.cardTitle, { fontSize: 22 * uiScale }]} numberOfLines={2}>{title}</Text>
            </LinearGradient>
            <Image
              source={require('../assets/ui/ic_page_mark.png')}
              style={[styles.ribbon, { right: 24 * uiScale, width: 42 * uiScale, height: 58 * uiScale }]}
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
  root: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000, overflow: 'hidden' },
  background: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Colors.backgroundDark },
  openBook: { position: 'absolute' },
  backCover: { position: 'absolute', top: 3, right: -5, bottom: -4, left: -5, borderWidth: 3, borderRadius: 11 },
  pages: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  leftPage: { position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden', borderWidth: 3, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, backgroundColor: '#F3F0E3' },
  rightPage: { position: 'absolute', top: 0, bottom: 0, overflow: 'hidden', borderWidth: 3, borderTopRightRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#F3F0E3' },
  spreadArtwork: { position: 'absolute', top: 0, height: '100%' },
  spine: { position: 'absolute', top: 4, bottom: 4, zIndex: 8, backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 6 },
  frontCover: { position: 'absolute', borderWidth: 3, elevation: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 12 },
  coverFront: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden', borderRadius: 7, backfaceVisibility: 'hidden' },
  coverBack: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden', borderRadius: 7, backfaceVisibility: 'hidden', transform: [{ rotateY: '180deg' }] },
  coverArtwork: { width: '100%', height: '100%' },
  title: { flex: 1, padding: 24, color: '#FFF', fontSize: 28, fontFamily: 'BalooBhaijaan', textAlign: 'center', textAlignVertical: 'center' },
  titleGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingVertical: 14, paddingHorizontal: 14 },
  cardTitle: { color: '#FFF', fontFamily: 'Montserrat-SemiBold', fontWeight: '700', textAlign: 'center' },
  ribbon: { position: 'absolute', top: -2, tintColor: '#FFF' },
});
