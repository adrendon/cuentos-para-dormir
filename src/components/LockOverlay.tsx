import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme/colors';

interface LockOverlayProps {
  onUnlock: () => void;
  showPrompt: boolean;
  onRequestPrompt: () => void;
}

const REQUIRED_TAPS = 3;
const TAP_SEQUENCE_TIMEOUT_MS = 1800;
const BUTTON_SIZE = 64;

export function LockOverlay({ onUnlock, showPrompt, onRequestPrompt }: LockOverlayProps) {
  const [tapCount, setTapCount] = useState(0);
  const tapCountRef = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSequence = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = null;
    tapCountRef.current = 0;
    setTapCount(0);
  }, []);

  useEffect(() => clearSequence, [clearSequence]);

  useEffect(() => {
    if (!showPrompt) clearSequence();
  }, [clearSequence, showPrompt]);

  const handleUnlockTap = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    const nextCount = tapCountRef.current + 1;
    if (nextCount >= REQUIRED_TAPS) {
      clearSequence();
      onUnlock();
      return;
    }

    tapCountRef.current = nextCount;
    setTapCount(nextCount);
    resetTimer.current = setTimeout(clearSequence, TAP_SEQUENCE_TIMEOUT_MS);
  }, [clearSequence, onUnlock]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable
        accessibilityLabel="Controles bloqueados"
        accessibilityHint="Toca para mostrar el botón de desbloqueo"
        style={StyleSheet.absoluteFill}
        onPress={onRequestPrompt}
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
            <View pointerEvents="none" style={styles.lockBody}>
              <View style={styles.lockShackle} />
            </View>
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
    ...StyleSheet.absoluteFill,
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
