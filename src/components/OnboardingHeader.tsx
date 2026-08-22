import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors } from '../theme/colors';

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}

/** Top bar: back arrow, pencil progress bar with "N/9" label, music toggle. */
export function OnboardingHeader({
  step,
  totalSteps,
  onBack,
  musicEnabled,
  onToggleMusic,
}: OnboardingHeaderProps) {
  const progress = step / totalSteps;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Regresar"
      >
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      {/* Progress bar with pencil + step label */}
      <View style={styles.progressWrapper}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]}>
            <Text style={styles.pencilIcon}>✏️</Text>
          </View>
        </View>
        <Text style={styles.stepLabel}>{step}/{totalSteps}</Text>
      </View>

      <TouchableOpacity
        style={styles.musicButton}
        onPress={onToggleMusic}
        accessibilityRole="button"
        accessibilityLabel={musicEnabled ? 'Silenciar música' : 'Activar música'}
      >
        <Image
          source={
            musicEnabled
              ? require('../assets/onboarding/ic_music_on.png')
              : require('../assets/onboarding/ic_music_off.png')
          }
          style={styles.musicIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 14,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: Colors.textWhite,
    fontSize: 24,
    fontWeight: '300',
    marginTop: -2,
  },
  progressWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.accentYellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 2,
    minWidth: 24,
  },
  pencilIcon: {
    fontSize: 12,
  },
  stepLabel: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 28,
  },
  musicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(62, 112, 220, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(62, 112, 220, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicIcon: {
    width: 20,
    height: 20,
  },
});
