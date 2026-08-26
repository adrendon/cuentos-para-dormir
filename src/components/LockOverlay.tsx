import React, { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';

interface LockOverlayProps {
  onUnlock: () => void;
  showPrompt: boolean;
  onRequestPrompt: () => void;
}

const HOLD_DURATION_MS = 1500;
const BUTTON_SIZE = 64;

export function LockOverlay({ onUnlock, showPrompt, onRequestPrompt }: LockOverlayProps) {
  const [isHolding, setIsHolding] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const clearHold = useCallback(() => {
    progress.stopAnimation();
    progress.setValue(0);
    setIsHolding(false);
  }, [progress]);

  const handlePressIn = useCallback(() => {
    progress.stopAnimation();
    progress.setValue(0);
    setIsHolding(true);
    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleUnlock = useCallback(() => {
    clearHold();
    onUnlock();
  }, [clearHold, onUnlock]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onRequestPrompt} />

      {showPrompt && (
        <View style={styles.unlockWrapper} pointerEvents="box-none">
          <Pressable
            style={styles.unlockButton}
            onLongPress={handleUnlock}
            delayLongPress={HOLD_DURATION_MS}
            onPressIn={handlePressIn}
            onPressOut={clearHold}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.unlockFill,
                { width: progress.interpolate({ inputRange: [0, 1], outputRange: [0, BUTTON_SIZE] }) },
              ]}
            />
            <View pointerEvents="none" style={styles.lockBody}>
              <View style={styles.lockShackle} />
            </View>
          </Pressable>
          {isHolding && <Text style={styles.label}>Mantén presionado…</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
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
    backgroundColor: Colors.accentYellow,
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
