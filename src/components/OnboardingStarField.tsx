import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const STARS = [
  [7, 8, 2, 0.32],
  [17, 5, 1, 0.24],
  [27, 12, 2, 0.22],
  [39, 7, 1, 0.3],
  [51, 13, 2, 0.28],
  [63, 6, 1, 0.22],
  [76, 10, 2, 0.3],
  [89, 5, 1, 0.24],
  [11, 22, 1, 0.28],
  [22, 29, 2, 0.24],
  [35, 20, 1, 0.32],
  [47, 27, 2, 0.22],
  [59, 21, 1, 0.28],
  [71, 31, 2, 0.25],
  [84, 24, 1, 0.31],
  [94, 29, 2, 0.22],
  [5, 42, 2, 0.24],
  [18, 48, 1, 0.31],
  [31, 39, 2, 0.22],
  [43, 47, 1, 0.28],
  [56, 41, 2, 0.27],
  [69, 50, 1, 0.23],
  [81, 43, 2, 0.3],
  [91, 52, 1, 0.25],
  [10, 61, 1, 0.27],
  [24, 68, 2, 0.23],
  [37, 58, 1, 0.3],
  [49, 66, 2, 0.22],
  [61, 60, 1, 0.27],
  [74, 71, 2, 0.24],
  [86, 63, 1, 0.31],
  [96, 69, 2, 0.21],
  [6, 82, 2, 0.23],
  [19, 91, 1, 0.29],
  [32, 79, 2, 0.21],
  [45, 88, 1, 0.28],
  [57, 81, 2, 0.25],
  [68, 94, 1, 0.24],
  [80, 84, 2, 0.29],
  [92, 92, 1, 0.25],
] as const;

export function OnboardingStarField() {
  const reveal = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(reveal, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [drift, reveal]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          opacity: reveal,
          transform: [
            { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] }) },
            { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [1, -2] }) },
          ],
        },
      ]}
    >
      {STARS.map(([left, top, size, opacity], index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity,
            backgroundColor: '#FFFFFF',
          }}
        />
      ))}
    </Animated.View>
  );
}
