import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import orbitPaths from '../assets/branding/lumioOrbit';
import astronautAPaths from '../assets/branding/lumioAstronautA';
import astronautBPaths from '../assets/branding/lumioAstronautB';
import starPaths from '../assets/branding/lumioStars';
import wordmarkPaths from '../assets/branding/lumioWordmark';

const BLUE = '#004B82';
const WHITE = '#FFFFFF';
const VIEWBOX_SIZE = 1254;
const STATIC_HOLD_MS = 1400;

type Props = { onComplete?: () => void };
const ALL_PATHS = [...orbitPaths, ...astronautAPaths, ...astronautBPaths, ...starPaths, ...wordmarkPaths] as const;

export default function LumioSplash({ onComplete }: Props) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { const timer = setTimeout(() => onCompleteRef.current?.(), STATIC_HOLD_MS); return () => clearTimeout(timer); }, []);

  return (
    <View style={styles.root}>
      <View style={styles.logoFrame}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} preserveAspectRatio="xMidYMid meet">
          {ALL_PATHS.map((d, index) => <Path key={index} d={d} fill={WHITE} fillRule="evenodd" clipRule="evenodd" />)}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', height: '100%', backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  logoFrame: { width: '88%', height: '88%', alignItems: 'center', justifyContent: 'center' },
});
