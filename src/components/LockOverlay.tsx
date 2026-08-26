import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable } from 'react-native';
import { Colors } from '../theme/colors';

interface LockOverlayProps {
  onUnlock: () => void;
  showPrompt: boolean;
  onRequestPrompt: () => void;
}

const HOLD_DURATION_MS = 1500;
const UNLOCK_BUTTON_SIZE = 64;

export function LockOverlay({ onUnlock, showPrompt, onRequestPrompt }: LockOverlayProps) {
  const [isHolding, setIsHolding] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const promptAnim = useRef(new Animated.Value(showPrompt ? 1 : 0)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Animated.timing(promptAnim, {
      toValue: showPrompt ? 1 : 0,
      duration: showPrompt ? 220 : 180,
      useNativeDriver: true,
    }).start();
  }, [promptAnim, showPrompt]);

  const clearHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    progress.stopAnimation();
    progress.setValue(0);
    setIsHolding(false);
  }, [progress]);

  useEffect(() => () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    progress.stopAnimation();
  }, [progress]);

  const handlePressIn = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    progress.stopAnimation();
    progress.setValue(0);
    setIsHolding(true);

    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      useNativeDriver: false,
    }).start();

    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      onUnlock();
    }, HOLD_DURATION_MS);
  }, [progress, onUnlock]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onRequestPrompt} />

      <Animated.View
        style={[
          styles.hint,
          {
            opacity: promptAnim,
            transform: [{ translateY: promptAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.closedLockIcon} />
      </Animated.View>

      <Animated.View
        pointerEvents={showPrompt ? 'auto' : 'none'}
        style={[
          styles.unlockWrapper,
          {
            opacity: promptAnim,
            transform: [
              { translateY: promptAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
              { scale: promptAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.unlockButton}
          onPressIn={handlePressIn}
          onPressOut={clearHold}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Mantén presionado para desbloquear"
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.unlockFill,
              {
                width: progress.interpolate({ inputRange: [0, 1], outputRange: [0, UNLOCK_BUTTON_SIZE] }),
              },
            ]}
          />
          <View pointerEvents="none" style={styles.openLockIcon} />
        </TouchableOpacity>
        <Text style={styles.unlockLabel}>
          {isHolding ? 'Mantén presionado…' : 'Mantén presionado para desbloquear'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 200,
    elevation: 200,
  },
  hint: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 9,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockWrapper: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    alignItems: 'center',
  },
  unlockButton: {
    width: UNLOCK_BUTTON_SIZE,
    height: UNLOCK_BUTTON_SIZE,
    borderRadius: UNLOCK_BUTTON_SIZE / 2,
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
  closedLockIcon: {
    width: 16,
    height: 15,
    borderWidth: 3,
    borderColor: Colors.accentYellow,
    borderRadius: 3,
  },
  openLockIcon: {
    width: 24,
    height: 22,
    borderWidth: 4,
    borderColor: Colors.textWhite,
    borderRadius: 5,
    borderTopColor: 'transparent',
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
