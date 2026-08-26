import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const BLUE = '#004A7E';
const WHITE = '#FFFFFF';
const STROKE_WIDTH = 10;
const SPLASH_DURATION = 6200;

type StrokeProps = {
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  length: number;
  delay: number;
  duration: number;
  kind?: 'path' | 'circle' | 'ellipse';
};

type Props = {
  onComplete?: () => void;
};

function Stroke({ d, cx, cy, r, rx, ry, length, delay, duration, kind = 'path' }: StrokeProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, duration, progress]);

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [length, 0],
  });

  const common = {
    stroke: WHITE,
    fill: 'none',
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeDasharray: [length, length] as [number, number],
    strokeDashoffset: dashOffset,
  };

  if (kind === 'circle') {
    return <AnimatedCircle {...common} cx={cx} cy={cy} r={r} />;
  }
  if (kind === 'ellipse') {
    return <AnimatedEllipse {...common} cx={cx} cy={cy} rx={rx} ry={ry} />;
  }
  return <AnimatedPath {...common} d={d!} />;
}

export default function LumioSplash({ onComplete }: Props) {
  const items = useMemo<StrokeProps[]>(() => [
    // 0.0–1.1 s: órbita
    { d: 'M220 670 C300 590 480 555 665 560 C820 565 885 600 885 640 C885 695 760 735 605 755 C445 777 285 760 220 710 C200 695 200 682 220 670', length: 1550, delay: 100, duration: 1000 },
    { kind: 'circle', cx: 360, cy: 735, r: 32, length: 210, delay: 900, duration: 300 },

    // 1.0–2.5 s: casco
    { d: 'M365 330 C380 220 470 160 575 165 C690 170 770 255 760 365 C752 450 690 510 605 520 C515 532 430 500 390 430 C365 388 360 360 365 330', length: 1100, delay: 1000, duration: 1100 },
    { d: 'M415 350 C430 270 500 220 580 225 C660 230 715 285 710 355 C705 425 650 465 585 475 C515 485 455 455 425 405', length: 900, delay: 1450, duration: 900 },
    { kind: 'ellipse', cx: 365, cy: 375, rx: 26, ry: 40, length: 220, delay: 1800, duration: 350 },

    // 2.2–3.2 s: rostro y cuerpo
    { d: 'M505 365 Q520 345 535 365', length: 70, delay: 2200, duration: 250 },
    { d: 'M610 365 Q625 345 640 365', length: 70, delay: 2280, duration: 250 },
    { d: 'M550 405 Q580 432 610 405', length: 100, delay: 2380, duration: 300 },
    { d: 'M445 495 C385 520 355 585 375 640 C392 688 440 705 480 680', length: 500, delay: 2450, duration: 650 },
    { d: 'M470 545 C430 560 420 610 445 640 C468 665 500 654 512 628 C525 600 510 575 485 570', length: 380, delay: 2700, duration: 500 },

    // 3.0–4.1 s: libro
    { d: 'M505 520 L585 545 L585 665 L500 640 C490 600 492 558 505 520', length: 430, delay: 3000, duration: 650 },
    { d: 'M585 545 L655 512 C680 505 705 510 725 522 L710 642 L585 665', length: 470, delay: 3200, duration: 700 },
    { d: 'M585 545 L585 665', length: 130, delay: 3500, duration: 300 },
    { kind: 'ellipse', cx: 706, cy: 585, rx: 26, ry: 38, length: 210, delay: 3650, duration: 350 },

    // 4.0–4.6 s: estrella
    { d: 'M760 255 L772 285 L804 297 L772 309 L760 340 L748 309 L716 297 L748 285 Z', length: 280, delay: 4000, duration: 400 },

    // 4.5–5.9 s: LUMIO
    { d: 'M310 840 L310 920 Q310 945 335 945 L370 945', length: 220, delay: 4500, duration: 320 },
    { d: 'M425 840 L425 910 Q425 950 465 950 Q505 950 505 910 L505 840', length: 300, delay: 4700, duration: 380 },
    { d: 'M560 945 L560 840 L610 900 L660 840 L660 945', length: 360, delay: 4950, duration: 420 },
    { d: 'M725 840 L725 945', length: 110, delay: 5200, duration: 250 },
    { kind: 'circle', cx: 825, cy: 892, r: 55, length: 360, delay: 5350, duration: 380 },
    { d: 'M825 865 L834 883 L852 892 L834 901 L825 919 L816 901 L798 892 L816 883 Z', length: 210, delay: 5650, duration: 250 },
  ], []);

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.root}>
      <Svg
        width="72%"
        height="72%"
        viewBox="0 0 1080 1080"
        preserveAspectRatio="xMidYMid meet"
      >
        {items.map((item, index) => (
          <Stroke key={`${item.kind ?? 'path'}-${index}`} {...item} />
        ))}
        <AnimatedDots />
      </Svg>
    </View>
  );
}

function AnimatedDots() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 420,
      delay: 4100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <>
      <AnimatedCircle cx={742} cy={385} r={10} fill={WHITE} opacity={opacity} />
      <AnimatedCircle cx={810} cy={360} r={7} fill={WHITE} opacity={opacity} />
    </>
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
});
