import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';

interface LockOverlayProps {
  onUnlock: () => void;
  showPrompt: boolean;
  onRequestPrompt: () => void;
  onDismissPrompt: () => void;
}

const REQUIRED_TAPS = 3;
const TAP_SEQUENCE_TIMEOUT_MS = 1800;
const BUTTON_SIZE = 64;

export function LockOverlay({ onUnlock, showPrompt, onRequestPrompt, onDismissPrompt }: LockOverlayProps) {
  const [tapCount, setTapCount] = useState(0);
  const tapCountRef = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const shackle = useRef(new Animated.Value(0)).current;

  const clearSequence = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = null;
    tapCountRef.current = 0;
    setTapCount(0);
    progress.stopAnimation();
    progress.setValue(0);
    shackle.stopAnimation();
    shackle.setValue(0);
  }, [progress, shackle]);

  useEffect(() => clearSequence, [clearSequence]);

  useEffect(() => {
    if (!showPrompt) clearSequence();
  }, [clearSequence, showPrompt]);

  const handleUnlockTap = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    const nextCount = tapCountRef.current + 1;
    if (nextCount >= REQUIRED_TAPS) {
      tapCountRef.current = nextCount;
      setTapCount(nextCount);
      Animated.parallel([
        Animated.timing(progress, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.spring(shackle, { toValue: 1, speed: 22, bounciness: 7, useNativeDriver: true }),
      ]).start(() => {
        clearSequence();
        onUnlock();
      });
      return;
    }

    tapCountRef.current = nextCount;
    setTapCount(nextCount);
    Animated.spring(progress, {
      toValue: nextCount / REQUIRED_TAPS,
      speed: 24,
      bounciness: 4,
      useNativeDriver: false,
    }).start();
    resetTimer.current = setTimeout(clearSequence, TAP_SEQUENCE_TIMEOUT_MS);
  }, [clearSequence, onUnlock]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable
        accessibilityLabel="Controles bloqueados"
        accessibilityHint={showPrompt ? 'Toca fuera del candado para ocultarlo' : 'Toca para mostrar el botón de desbloqueo'}
        style={StyleSheet.absoluteFill}
        onPress={showPrompt ? onDismissPrompt : onRequestPrompt}
      />

      {showPrompt && (
        <View style={styles.unlockWrapper} pointerEvents="box-none">
          <Pressable
            style={styles.unlockButton}
            accessibilityRole="button"
            accessibilityLabel="Desbloquear controles"
            accessibilityHint="Toca tres veces para desbloquear"
            onPress={handleUnlockTap}
          >
            <Animated.View
              pointerEvents="none"
              style={[styles.unlockFill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: [0, BUTTON_SIZE] }) }]}
            />
            <Animated.View pointerEvents="none" style={[styles.lockBody, { transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }]}>
              <Animated.View style={[styles.lockShackle, { transform: [{ translateY: shackle.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) }, { rotate: shackle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-18deg'] }) }] }]} />
            </Animated.View>
          </Pressable>
          <Text style={styles.label} pointerEvents="none">
            {tapCount === 0 ? 'Toca 3 veces para desbloquear' : `${REQUIRED_TAPS - tapCount} toque${REQUIRED_TAPS - tapCount === 1 ? '' : 's'} más`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position:'absolute',top:0,right:0,bottom:0,left:0,
    zIndex: 9999,
    elevation: 9999,
  },
  unlockWrapper: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10000,
    elevation: 10000,
  },
  unlockButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,.62)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  unlockFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(246,184,43,.46)',
  },
  lockBody: {
    width: 22,
    height: 18,
    borderWidth: 4,
    borderColor: Colors.accentYellow,
    borderRadius: 4,
    marginTop: 7,
  },
  lockShackle: {
    position: 'absolute',
    width: 15,
    height: 14,
    borderWidth: 4,
    borderBottomWidth: 0,
    borderColor: Colors.accentYellow,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    left: 0,
    top: -14,
  },
  label: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 5,
    backgroundColor: 'rgba(0,0,0,.42)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});
