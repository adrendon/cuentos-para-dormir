import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable } from 'react-native';
import { Colors } from '../theme/colors';

interface LockOverlayProps {
  onUnlock: () => void;
}

const HOLD_DURATION_MS = 1500;

/**
 * Full-screen touch blocker for kids. Swallows all taps except the
 * hold-to-unlock button, which requires a sustained press to release.
 */
export function LockOverlay({ onUnlock }: LockOverlayProps) {
  const [isHolding, setIsHolding] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    progress.stopAnimation();
    progress.setValue(0);
    setIsHolding(false);
  }, [progress]);

  const handlePressIn = useCallback(() => {
    setIsHolding(true);
    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      useNativeDriver: false,
    }).start();

    holdTimer.current = setTimeout(() => {
      onUnlock();
    }, HOLD_DURATION_MS);
  }, [progress, onUnlock]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Transparent full-screen tap absorber — blocks the reader underneath without eating the unlock button's touches */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />

      <View style={styles.hint} pointerEvents="none">
        <Text style={styles.hintText}>🔒 Bloqueado para niños</Text>
      </View>

      <View style={styles.unlockWrapper}>
        <TouchableOpacity
          style={styles.unlockButton}
          onPressIn={handlePressIn}
          onPressOut={clearHold}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Mantén presionado para desbloquear"
        >
          <Animated.View
            style={[
              styles.unlockFill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          <Text style={styles.unlockIcon}>🔓</Text>
        </TouchableOpacity>
        <Text style={styles.unlockLabel}>
          {isHolding ? 'Mantén presionado…' : 'Mantén presionado para desbloquear'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 200,
  },
  hint: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  hintText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  unlockWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  unlockButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  unlockFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.accentYellow,
  },
  unlockIcon: {
    fontSize: 26,
  },
  unlockLabel: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
