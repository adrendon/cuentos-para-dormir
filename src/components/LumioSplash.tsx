import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import orbitPaths from '../assets/branding/lumioOrbit';
import astronautAPaths from '../assets/branding/lumioAstronautA';
import astronautBPaths from '../assets/branding/lumioAstronautB';
import starPaths from '../assets/branding/lumioStars';
import wordmarkPaths from '../assets/branding/lumioWordmark';

const BLUE = '#004B82';
const WHITE = '#FFFFFF';
const SPLASH_DURATION = 6200;

type Props = {
  onComplete?: () => void;
};

function LogoLayer({ paths }: { paths: readonly string[] }) {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 1254 1254"
      preserveAspectRatio="xMidYMid meet"
    >
      {paths.map((d, index) => (
        <Path
          key={index}
          d={d}
          fill={WHITE}
          fillRule="evenodd"
          clipRule="evenodd"
        />
      ))}
    </Svg>
  );
}

function AnimatedLayer({
  paths,
  opacity,
}: {
  paths: readonly string[];
  opacity: Animated.Value;
}) {
  return (
    <Animated.View pointerEvents="none" style={[styles.logoLayer, { opacity }]}>
      <LogoLayer paths={paths} />
    </Animated.View>
  );
}

export default function LumioSplash({ onComplete }: Props) {
  const orbit = useRef(new Animated.Value(0)).current;
  const astronaut = useRef(new Animated.Value(0)).current;
  const face = useRef(new Animated.Value(0)).current;
  const stars = useRef(new Animated.Value(0)).current;
  const wordmark = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    orbit.setValue(0);
    astronaut.setValue(0);
    face.setValue(0);
    stars.setValue(0);
    wordmark.setValue(0);

    const reveal = Animated.sequence([
      Animated.delay(120),
      Animated.timing(orbit, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(astronaut, {
        toValue: 1,
        duration: 1150,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(face, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(300),
      Animated.timing(stars, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(180),
      Animated.timing(wordmark, {
        toValue: 1,
        duration: 920,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    reveal.start();
    const timer = setTimeout(() => onComplete?.(), SPLASH_DURATION);

    return () => {
      reveal.stop();
      clearTimeout(timer);
    };
  }, [astronaut, face, onComplete, orbit, stars, wordmark]);

  return (
    <View style={styles.root}>
      <View style={styles.logoCanvas}>
        <AnimatedLayer paths={orbitPaths} opacity={orbit} />
        <AnimatedLayer paths={astronautAPaths} opacity={astronaut} />
        <AnimatedLayer paths={astronautBPaths} opacity={face} />
        <AnimatedLayer paths={starPaths} opacity={stars} />
        <AnimatedLayer paths={wordmarkPaths} opacity={wordmark} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCanvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  logoLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});
