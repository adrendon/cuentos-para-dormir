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

/** Top bar shared by all onboarding steps: back arrow, segmented progress, music toggle. */
export function OnboardingHeader({
  step,
  totalSteps,
  onBack,
  musicEnabled,
  onToggleMusic,
}: OnboardingHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Regresar"
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.progressTrack}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i < step && styles.progressSegmentActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.iconButton}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: Colors.textWhite,
    fontSize: 20,
    fontWeight: 'bold',
  },
  musicIcon: {
    width: 20,
    height: 20,
  },
  progressTrack: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressSegmentActive: {
    backgroundColor: Colors.accentYellow,
  },
});
