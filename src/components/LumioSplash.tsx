import React, { useEffect, useId, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, Mask, Path, Rect } from 'react-native-svg';
import orbitPaths from '../assets/branding/lumioOrbit';
import astronautAPaths from '../assets/branding/lumioAstronautA';
import astronautBPaths from '../assets/branding/lumioAstronautB';
import starPaths from '../assets/branding/lumioStars';
import wordmarkPaths from '../assets/branding/lumioWordmark';

const BLUE = '#004B82';
const WHITE = '#FFFFFF';
const VIEWBOX_SIZE = 1254;
const SPLASH_DURATION = 9001;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = {
  onComplete?: () => void;
};

type RevealDirection = 'left' | 'right' | 'up' | 'down';

function RevealLayer({
  paths,
  progress,
  direction,
}: {
  paths: readonly string[];
  progress: Animated.Value;
  direction: RevealDirection;
}) {
  const reactId = useId().replace(/:/g, '');
  const maskId = `lumio-reveal-${reactId}`;

  const horizontalSize = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, VIEWBOX_SIZE],
  });
  const verticalSize = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, VIEWBOX_SIZE],
  });
  const reverseX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [VIEWBOX_SIZE, 0],
  });
  const reverseY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [VIEWBOX_SIZE, 0],
  });

  const maskRectProps = (() => {
    switch (direction) {
      case 'right':
        return { x: reverseX, y: 0, width: horizontalSize, height: VIEWBOX_SIZE };
      case 'up':
        return { x: 0, y: reverseY, width: VIEWBOX_SIZE, height: verticalSize };
      case 'down':
        return { x: 0, y: 0, width: VIEWBOX_SIZE, height: verticalSize };
      case 'left':
      default:
        return { x: 0, y: 0, width: horizontalSize, height: VIEWBOX_SIZE };
    }
  })();

  return (
    <View pointerEvents="none" style={styles.logoLayer}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <Mask id={maskId} x="0" y="0" width={VIEWBOX_SIZE} height={VIEWBOX_SIZE}>
            <AnimatedRect
              {...(maskRectProps as any)}
              fill={WHITE}
            />
          </Mask>
        </Defs>
        {paths.map((d, index) => (
          <Path
            key={index}
            d={d}
            fill={WHITE}
            fillRule="evenodd"
            clipRule="evenodd"
            mask={`url(#${maskId})`}
          />
        ))}
      </Svg>
    </View>
  );
}

export default function LumioSplash({ onComplete }: Props) {
  const orbit = useRef(new Animated.Value(0)).current;
  const astronaut = useRef(new Animated.Value(0)).current;
  const face = useRef(new Animated.Value(0)).current;
  const stars = useRef(new Animated.Value(0)).current;
  const wordmark = useRef(new Animated.Value(0)).current;
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    orbit.setValue(0);
    astronaut.setValue(0);
    face.setValue(0);
    stars.setValue(0);
    wordmark.setValue(0);

    // Build the mark instead of fading entire SVG layers in at once. Each
    // original vector path is progressively exposed by an animated SVG mask.
    const reveal = Animated.sequence([
      Animated.delay(120),
      Animated.timing(orbit, {
        toValue: 1,
        duration: 1250,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(astronaut, {
          toValue: 1,
          duration: 1750,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.delay(720),
          Animated.timing(face, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]),
      ]),
      Animated.delay(180),
      Animated.timing(stars, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(120),
      Animated.timing(wordmark, {
        toValue: 1,
        duration: 1450,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);

    reveal.start();
    const timer = setTimeout(() => onCompleteRef.current?.(), SPLASH_DURATION);

    return () => {
      reveal.stop();
      clearTimeout(timer);
    };
  }, [astronaut, face, orbit, stars, wordmark]);

  return (
    <View style={styles.root}>
      <View style={styles.logoCanvas}>
        <RevealLayer paths={orbitPaths} progress={orbit} direction="left" />
        <RevealLayer paths={astronautAPaths} progress={astronaut} direction="up" />
        <RevealLayer paths={astronautBPaths} progress={face} direction="down" />
        <RevealLayer paths={starPaths} progress={stars} direction="right" />
        <RevealLayer paths={wordmarkPaths} progress={wordmark} direction="left" />
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
