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
  const layoutScale = Math.max(0.82, Math.min(1.35, Math.min(width / 904, height / 407)));
  const pageHeight = Math.min(height * 0.82, 296 * layoutScale);
  const pageWidth = Math.min(width * 0.36, pageHeight * 0.9);
  const chromeScale = layoutScale;
  const roundButtonSize = 54 * chromeScale;
  const modeButtonWidth = Math.min(width * 0.38, 285 * chromeScale);
  const modeButtonHeight = Math.min(height * 0.155, 62 * chromeScale);
  const modeButtonRadius = modeButtonHeight / 2;
  const [menuReady, setMenuReady] = useState(false);
  const coverRotation = useSharedValue(skipEntranceScale ? 1 : 0);
  const bookScale = useSharedValue(skipEntranceScale ? 1 : 0.88);
  const menuReveal = useSharedValue(0);

  useEffect(() => {
    if (!skipEntranceScale) {
      bookScale.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
      coverRotation.value = withDelay(120, withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }));
    }
    const menuTimer = setTimeout(() => {
      setMenuReady(true);
      menuReveal.value = withTiming(1, { duration: 430, easing: Easing.out(Easing.cubic) });
    }, skipEntranceScale ? 100 : 1060);
    return () => clearTimeout(menuTimer);
  }, [bookScale, coverRotation, menuReveal, skipEntranceScale]);

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
      { translateY: interpolate(menuReveal.value, [0, 1], [24 * chromeScale, 0]) },
      { scale: interpolate(menuReveal.value, [0, 1], [0.96, 1]) },
    ],
  }));
  const topChromeStyle = useAnimatedStyle(() => ({
    opacity: menuReveal.value,
    transform: [{ translateY: interpolate(menuReveal.value, [0, 1], [-12 * chromeScale, 0]) }],
  }));

  if (menuReady) {
    return (
      <View style={styles.container}>
        {firstPageSource && <Image source={firstPageSource} style={styles.modeBackground} resizeMode="cover" />}
        <Animated.View style={[styles.modeShade, shadeStyle]} />
        <Animated.View style={[styles.topBar, { top: 14 * chromeScale, left: 14 * chromeScale, right: 14 * chromeScale }, topChromeStyle]}>
          <TouchableOpacity style={[styles.roundButton, { width: roundButtonSize, height: roundButtonSize, borderRadius: roundButtonSize / 2 }]} onPress={onClose} accessibilityLabel="Biblioteca">
            <Image source={require('../assets/ui/ic_home.png')} style={{ width: 36 * chromeScale, height: 36 * chromeScale }} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roundButton, { width: roundButtonSize, height: roundButtonSize, borderRadius: roundButtonSize / 2 }]} onPress={onToggleMusic} accessibilityLabel="Música">
            <Image source={musicEnabled ? require('../assets/onboarding/ic_music_on.png') : require('../assets/onboarding/ic_music_off.png')} style={{ width: 30 * chromeScale, height: 30 * chromeScale }} resizeMode="contain" />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.centeredMenu, { gap: 18 * chromeScale }, menuStyle]}>
          <ModeButton label="Leer" icon={require('../assets/ui/ic_book_read.png')} width={modeButtonWidth} height={modeButtonHeight} scale={chromeScale} onPress={() => onSelectMode('read')} />
          <ModeButton label="Escuchar" icon={require('../assets/ui/ic_book_listen.png')} width={modeButtonWidth} height={modeButtonHeight} scale={chromeScale} onPress={() => onSelectMode('listen')} colors={['#F6BD35', '#FF8E3B']} />
          <TouchableOpacity style={{ width: modeButtonWidth, height: modeButtonHeight, borderRadius: modeButtonRadius }} onPress={() => onSelectMode('record')}>
            <LinearGradient colors={['#28D4EB', '#278BEC']} style={[styles.modeButton, { borderRadius: modeButtonRadius, paddingHorizontal: 48 * chromeScale }]}>
              <View style={[styles.microphoneIcon, { width: 42 * chromeScale, height: 42 * chromeScale }]}>
                <View style={styles.microphoneHead} />
                <View style={styles.microphoneStand} />
              </View>
              <Text style={[styles.modeLabel, { fontSize: 24 * chromeScale }]}>Grabar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stars} pointerEvents="none">
        {STARS.map(([left, top], index) => <View key={index} style={[styles.star, { left: `${left}%`, top: `${top}%` }]} />)}
      </View>
      <View style={styles.content}>
        <Animated.View style={[styles.book, { width: pageWidth * 2, height: pageHeight }, bookStyle]}>
          <View style={[styles.pageLayerFar, { left: pageWidth + 8 * layoutScale, width: pageWidth, height: pageHeight, borderColor: coverColor }]} />
          <View style={[styles.pageLayerNear, { left: pageWidth + 4 * layoutScale, width: pageWidth, height: pageHeight, borderColor: coverColor }]} />
          <View style={[styles.storyPage, { left: pageWidth, width: pageWidth, height: pageHeight, borderColor: coverColor }]}>
            {firstPageSource ? <Image source={firstPageSource} style={styles.pageImage} resizeMode="cover" /> : <View style={[styles.pageFallback, { backgroundColor: coverColor }]} />}
          </View>
          <Animated.View style={[styles.cover, { left: pageWidth, width: pageWidth, height: pageHeight, backgroundColor: coverColor, borderColor: coverColor }, coverStyle]}>
            <View style={styles.coverFront}>
              {coverSource ? <Image source={coverSource} style={styles.coverArtwork} resizeMode="cover" /> : <Text style={styles.coverTitle} numberOfLines={3}>{title}</Text>}
            </View>
            <View style={[styles.coverBack, { backgroundColor: coverColor }]} />
          </Animated.View>
          <View style={[styles.spineShadow, { left: pageWidth - 9 * layoutScale, width: 18 * layoutScale }]} />
          <View style={[styles.spine, { left: pageWidth - 2, backgroundColor: coverColor }]} />
        </Animated.View>
      </View>
    </View>
  );
}

function ModeButton({ label, icon, width, height, scale, onPress, colors = ['#28D4EB', '#278BEC'] }: { label: string; icon: number; width: number; height: number; scale: number; onPress: () => void; colors?: [string, string] }) {
  const radius = height / 2;
  return (
    <TouchableOpacity style={{ width, height, borderRadius: radius }} onPress={onPress}>
      <LinearGradient colors={colors} style={[styles.modeButton, { borderRadius: radius, paddingHorizontal: 48 * scale }]}>
        <Image source={icon} style={{ width: 42 * scale, height: 42 * scale }} resizeMode="contain" />
        <Text style={[styles.modeLabel, { fontSize: 24 * scale }]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  stars: { ...StyleSheet.absoluteFill },
  star: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.45)' },
  topBar: { position: 'absolute', zIndex: 20, flexDirection: 'row', justifyContent: 'space-between' },
  roundButton: { backgroundColor: '#F6F4E8', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  book: { position: 'relative' },
  pageLayerFar: { position: 'absolute', top: 7, borderRadius: 10, backgroundColor: '#D8D4C6', borderWidth: 3, opacity: 0.42 },
  pageLayerNear: { position: 'absolute', top: 3, borderRadius: 10, backgroundColor: '#ECE9DD', borderWidth: 3, opacity: 0.72 },
  storyPage: { position: 'absolute', top: 0, overflow: 'hidden', borderRadius: 10, backgroundColor: '#FFF', borderWidth: 3 },
  pageImage: { width: '100%', height: '100%' },
  pageFallback: { flex: 1 },
  cover: { position: 'absolute', top: 0, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 3, shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  coverFront: { ...StyleSheet.absoluteFill, borderRadius: 7, overflow: 'hidden', backfaceVisibility: 'hidden' },
  coverBack: { ...StyleSheet.absoluteFill, borderRadius: 7, backfaceVisibility: 'hidden', transform: [{ rotateY: '180deg' }] },
  coverTitle: { flex: 1, padding: 20, color: '#FFF', fontSize: 22, fontWeight: 'bold', fontFamily: 'BalooBhaijaan', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 4 },
  coverArtwork: { width: '100%', height: '100%', borderRadius: 7 },
  spine: { position: 'absolute', top: 3, bottom: 3, width: 4, borderRadius: 2, opacity: 0.72 },
  spineShadow: { position: 'absolute', top: 4, bottom: 4, zIndex: 6, backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 9 },
  modeBackground: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  modeShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8, 4, 30, 0.66)' },
  centeredMenu: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  modeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22, borderWidth: 2, borderColor: '#25C8EE', elevation: 5 },
  microphoneIcon: { alignItems: 'center', justifyContent: 'center' },
  microphoneHead: { width: 16, height: 25, borderRadius: 8, borderWidth: 3, borderColor: '#FFF' },
  microphoneStand: { width: 24, height: 15, marginTop: -10, borderBottomWidth: 3, borderLeftWidth: 3, borderRightWidth: 3, borderColor: '#FFF', borderRadius: 12 },
  modeLabel: { color: '#FFF', fontFamily: 'Montserrat-ExtraBold' },
});
