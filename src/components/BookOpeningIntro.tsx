import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  runOnJS,
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
  [6, 14],
  [13, 75],
  [19, 34],
  [27, 9],
  [34, 87],
  [42, 23],
  [49, 69],
  [57, 12],
  [64, 89],
  [72, 31],
  [79, 72],
  [87, 16],
  [93, 56],
  [10, 48],
  [31, 57],
  [53, 42],
  [68, 60],
  [84, 43],
];

const BLUE_GRADIENT: [string, string] = ['#28D4EB', '#278BEC'];
const ORANGE_GRADIENT: [string, string] = ['#F6BD35', '#FF8E3B'];
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

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
  const [canvasSize, setCanvasSize] = useState({ width, height });
  const canvasWidth = canvasSize.width || width;
  const canvasHeight = canvasSize.height || height;
  const uiScale = clamp(canvasHeight / 407, 0.78, 1.08);
  const pageHeight = Math.min(canvasHeight * 0.78, 286 * uiScale);
  const pageWidth = Math.min(canvasWidth * 0.31, pageHeight * 0.9);
  const roundButtonSize = 54 * uiScale;
  const modeButtonWidth = Math.min(canvasWidth * 0.22, 245 * uiScale);
  const modeButtonHeight = 52 * uiScale;
  const modeButtonRadius = modeButtonHeight / 2;
  const menuBaseTranslateY = -92 * uiScale;
  const [menuReady, setMenuReady] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'listen' | 'record' | null>(null);
  const coverRotation = useSharedValue(skipEntranceScale ? 1 : 0);
  const bookScale = useSharedValue(skipEntranceScale ? 1 : 0.88);
  const menuReveal = useSharedValue(0);
  const menuShift = useSharedValue(0);

  useEffect(() => {
    if (!skipEntranceScale) {
      bookScale.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
      coverRotation.value = withDelay(
        120,
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) })
      );
    }
    const menuTimer = setTimeout(
      () => {
        setMenuReady(true);
        menuReveal.value = withTiming(1, { duration: 430, easing: Easing.out(Easing.cubic) });
      },
      skipEntranceScale ? 100 : 1060
    );
    return () => clearTimeout(menuTimer);
  }, [bookScale, coverRotation, menuReveal, skipEntranceScale]);

  const finishSelection = useCallback(
    (mode: 'listen' | 'record') => onSelectMode(mode),
    [onSelectMode]
  );

  const selectExpandableMode = useCallback(
    (mode: 'listen' | 'record') => {
      if (selectedMode) return;
      setSelectedMode(mode);
      menuShift.value = withTiming(
        1,
        { duration: 360, easing: Easing.inOut(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(finishSelection)(mode);
        }
      );
    },
    [selectedMode, menuShift, finishSelection]
  );

  const bookStyle = useAnimatedStyle(() => ({ transform: [{ scale: bookScale.value }] }));
  const coverStyle = useAnimatedStyle(() => {
    const rotation = interpolate(coverRotation.value, [0, 1], [0, -168]);
    return {
      transform: [
        { perspective: 1400 },
        { translateX: -pageWidth / 2 },
        { rotateY: `${rotation}deg` },
        { translateX: pageWidth / 2 },
      ],
    };
  });
  const shadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(menuReveal.value, [0, 1], [0, 1]),
  }));
  const menuStyle = useAnimatedStyle(() => ({
    opacity: menuReveal.value,
    transform: [
      { translateY: menuBaseTranslateY + interpolate(menuReveal.value, [0, 1], [18 * uiScale, 0]) },
      { scale: interpolate(menuReveal.value, [0, 1], [0.97, 1]) },
    ],
  }));
  const topChromeStyle = useAnimatedStyle(() => ({
    opacity: menuReveal.value,
    transform: [{ translateY: interpolate(menuReveal.value, [0, 1], [-10 * uiScale, 0]) }],
  }));

  if (menuReady) {
    return (
      <View
        style={styles.container}
        onLayout={(event: LayoutChangeEvent) => {
          const { width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
          if (nextWidth !== canvasSize.width || nextHeight !== canvasSize.height) {
            setCanvasSize({ width: nextWidth, height: nextHeight });
          }
        }}
      >
        {firstPageSource && (
          <Image source={firstPageSource} style={styles.modeBackground} resizeMode="cover" />
        )}
        <Animated.View style={[styles.modeShade, shadeStyle]} />
        <Animated.View
          style={[
            styles.topBar,
            { top: 14 * uiScale, left: 14 * uiScale, right: 14 * uiScale },
            topChromeStyle,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.roundButton,
              {
                width: roundButtonSize,
                height: roundButtonSize,
                borderRadius: roundButtonSize / 2,
              },
            ]}
            onPress={onClose}
            accessibilityLabel="Biblioteca"
          >
            <Image
              source={require('../assets/ui/ic_home.png')}
              style={{ width: 34 * uiScale, height: 34 * uiScale }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roundButton,
              {
                width: roundButtonSize,
                height: roundButtonSize,
                borderRadius: roundButtonSize / 2,
              },
            ]}
            onPress={onToggleMusic}
            accessibilityLabel="Música"
          >
            <Image
              source={
                musicEnabled
                  ? require('../assets/onboarding/ic_music_on.png')
                  : require('../assets/onboarding/ic_music_off.png')
              }
              style={{ width: 28 * uiScale, height: 28 * uiScale, tintColor: '#168FD1' }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.modeMenu, { gap: 14 * uiScale }, menuStyle]}>
          <ModeButton
            label="Leer"
            icon={require('../assets/ui/ic_book_read.png')}
            width={modeButtonWidth}
            height={modeButtonHeight}
            scale={uiScale}
            onPress={() => onSelectMode('read')}
            colors={BLUE_GRADIENT}
            disabled={!!selectedMode}
          />
          <ModeButton
            label="Escuchar"
            icon={require('../assets/ui/ic_book_listen.png')}
            width={modeButtonWidth}
            height={modeButtonHeight}
            scale={uiScale}
            onPress={() => selectExpandableMode('listen')}
            colors={selectedMode === 'listen' ? ORANGE_GRADIENT : BLUE_GRADIENT}
            disabled={!!selectedMode && selectedMode !== 'listen'}
          />
          <TouchableOpacity
            style={{
              width: modeButtonWidth,
              height: modeButtonHeight,
              borderRadius: modeButtonRadius,
            }}
            onPress={() => selectExpandableMode('record')}
            disabled={!!selectedMode && selectedMode !== 'record'}
          >
            <LinearGradient
              colors={selectedMode === 'record' ? ORANGE_GRADIENT : BLUE_GRADIENT}
              style={[
                styles.modeButton,
                { borderRadius: modeButtonRadius, paddingHorizontal: 24 * uiScale },
              ]}
            >
              <View style={[styles.microphoneIcon, { width: 32 * uiScale, height: 32 * uiScale }]}>
                <View
                  style={[
                    styles.microphoneHead,
                    {
                      width: 14 * uiScale,
                      height: 23 * uiScale,
                      borderRadius: 7 * uiScale,
                      borderWidth: 2.5 * uiScale,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.microphoneStand,
                    {
                      width: 21 * uiScale,
                      height: 13 * uiScale,
                      marginTop: -9 * uiScale,
                      borderBottomWidth: 2.5 * uiScale,
                      borderLeftWidth: 2.5 * uiScale,
                      borderRightWidth: 2.5 * uiScale,
                      borderRadius: 10 * uiScale,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.modeLabel, { fontSize: 18 * uiScale }]}>Grabar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
      <View style={styles.content}>
        <Animated.View
          style={[styles.book, { width: pageWidth * 2, height: pageHeight }, bookStyle]}
        >
          <View
            style={[
              styles.pageLayerFar,
              {
                left: pageWidth + 8 * uiScale,
                width: pageWidth,
                height: pageHeight,
                borderColor: coverColor,
              },
            ]}
          />
          <View
            style={[
              styles.pageLayerNear,
              {
                left: pageWidth + 4 * uiScale,
                width: pageWidth,
                height: pageHeight,
                borderColor: coverColor,
              },
            ]}
          />
          <View
            style={[
              styles.storyPage,
              { left: pageWidth, width: pageWidth, height: pageHeight, borderColor: coverColor },
            ]}
          >
            {firstPageSource ? (
              <Image source={firstPageSource} style={styles.pageImage} resizeMode="cover" />
            ) : (
              <View style={[styles.pageFallback, { backgroundColor: coverColor }]} />
            )}
          </View>
          <Animated.View
            style={[
              styles.cover,
              {
                left: pageWidth,
                width: pageWidth,
                height: pageHeight,
                backgroundColor: coverColor,
                borderColor: coverColor,
              },
              coverStyle,
            ]}
          >
            <View style={styles.coverFront}>
              {coverSource ? (
                <Image source={coverSource} style={styles.coverArtwork} resizeMode="cover" />
              ) : (
                <Text style={styles.coverTitle} numberOfLines={3}>
                  {title}
                </Text>
              )}
            </View>
            <View style={[styles.coverBack, { backgroundColor: coverColor }]} />
          </Animated.View>
          <View
            style={[styles.spineShadow, { left: pageWidth - 9 * uiScale, width: 18 * uiScale }]}
          />
          <View style={[styles.spine, { left: pageWidth - 2, backgroundColor: coverColor }]} />
        </Animated.View>
      </View>
    </View>
  );
}

function ModeButton({
  label,
  icon,
  width,
  height,
  scale,
  onPress,
  colors = BLUE_GRADIENT,
  disabled = false,
}: {
  label: string;
  icon: number;
  width: number;
  height: number;
  scale: number;
  onPress: () => void;
  colors?: [string, string];
  disabled?: boolean;
}) {
  const radius = height / 2;
  return (
    <TouchableOpacity
      style={{ width, height, borderRadius: radius }}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={colors}
        style={[styles.modeButton, { borderRadius: radius, paddingHorizontal: 24 * scale }]}
      >
        <Image
          source={icon}
          style={{ width: 32 * scale, height: 32 * scale }}
          resizeMode="contain"
        />
        <Text style={[styles.modeLabel, { fontSize: 18 * scale }]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  stars: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  topBar: {
    position: 'absolute',
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundButton: {
    backgroundColor: '#F6F4E8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  book: { position: 'relative' },
  pageLayerFar: {
    position: 'absolute',
    top: 7,
    borderRadius: 10,
    backgroundColor: '#D8D4C6',
    borderWidth: 3,
    opacity: 0.42,
  },
  pageLayerNear: {
    position: 'absolute',
    top: 3,
    borderRadius: 10,
    backgroundColor: '#ECE9DD',
    borderWidth: 3,
    opacity: 0.72,
  },
  storyPage: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 3,
  },
  pageImage: { width: '100%', height: '100%' },
  pageFallback: { flex: 1 },
  cover: {
    position: 'absolute',
    top: 0,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  coverFront: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 7,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  coverBack: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 7,
    backfaceVisibility: 'hidden',
    transform: [{ rotateY: '180deg' }],
  },
  coverTitle: {
    flex: 1,
    padding: 20,
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'BalooBhaijaan',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  coverArtwork: { width: '100%', height: '100%', borderRadius: 7 },
  spine: { position: 'absolute', top: 3, bottom: 3, width: 4, borderRadius: 2, opacity: 0.72 },
  spineShadow: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    zIndex: 6,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 9,
  },
  modeBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  modeShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8, 4, 30, 0.66)',
  },
  modeMenu: {
    position: 'absolute',
    top: '50%',
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#25C8EE',
    elevation: 5,
  },
  microphoneIcon: { alignItems: 'center', justifyContent: 'center' },
  microphoneHead: { borderColor: '#FFF' },
  microphoneStand: { borderColor: '#FFF' },
  modeLabel: { color: '#FFF', fontFamily: 'Montserrat-ExtraBold' },
});
