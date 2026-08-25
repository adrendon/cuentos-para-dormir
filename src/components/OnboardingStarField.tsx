import React from 'react';
import { StyleSheet, View } from 'react-native';

const STARS = [
  [7, 8, 2, .32], [17, 5, 1, .24], [27, 12, 2, .22], [39, 7, 1, .30], [51, 13, 2, .28], [63, 6, 1, .22], [76, 10, 2, .30], [89, 5, 1, .24],
  [11, 22, 1, .28], [22, 29, 2, .24], [35, 20, 1, .32], [47, 27, 2, .22], [59, 21, 1, .28], [71, 31, 2, .25], [84, 24, 1, .31], [94, 29, 2, .22],
  [5, 42, 2, .24], [18, 48, 1, .31], [31, 39, 2, .22], [43, 47, 1, .28], [56, 41, 2, .27], [69, 50, 1, .23], [81, 43, 2, .30], [91, 52, 1, .25],
  [10, 61, 1, .27], [24, 68, 2, .23], [37, 58, 1, .30], [49, 66, 2, .22], [61, 60, 1, .27], [74, 71, 2, .24], [86, 63, 1, .31], [96, 69, 2, .21],
  [6, 82, 2, .23], [19, 91, 1, .29], [32, 79, 2, .21], [45, 88, 1, .28], [57, 81, 2, .25], [68, 94, 1, .24], [80, 84, 2, .29], [92, 92, 1, .25],
] as const;

export function OnboardingStarField() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
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
    </View>
  );
}
