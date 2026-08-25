import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const leftIn = useRef(new Animated.Value(0)).current;
  const centerIn = useRef(new Animated.Value(0)).current;
  const rightIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    leftIn.setValue(0);
    centerIn.setValue(0);
    rightIn.setValue(0);
    Animated.stagger(70, [
      Animated.timing(leftIn, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(centerIn, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(rightIn, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [step, leftIn, centerIn, rightIn]);

  const entrance = (value: Animated.Value, fromX: number, fromY = -10) => ({
    opacity: value,
    transform: [
      { translateX: value.interpolate({ inputRange: [0, 1], outputRange: [fromX, 0] }) },
      { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [fromY, 0] }) },
      { scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
    ],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={entrance(leftIn, -18)}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Regresar"
        >
          <Image source={require('../assets/ui/ic_left_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.progressWrapper, entrance(centerIn, 0, -16)]}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]}>
            {[0, 1, 2, 3, 4].map((stripe) => (
              <View key={stripe} style={[styles.progressStripe, { left: stripe * 24 }]} />
            ))}
          </View>
          <Text style={styles.stepLabel}>{step}/{totalSteps}</Text>
        </View>
      </Animated.View>

      <Animated.View style={entrance(rightIn, 18)}>
        <TouchableOpacity
          style={styles.musicButton}
          onPress={onToggleMusic}
          accessibilityRole="button"
          accessibilityLabel={musicEnabled ? 'Silenciar música' : 'Activar música'}
        >
          <LinearGradient colors={['#4544A7', '#282776']} style={styles.iconGradient}>
            <Image
              source={
                musicEnabled
                  ? require('../assets/onboarding/ic_music_on.png')
                  : require('../assets/onboarding/ic_music_off.png')
              }
              style={styles.musicIcon}
              resizeMode="contain"
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    gap: 18,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34338B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 25,
    height: 25,
    tintColor: Colors.textWhite,
    resizeMode: 'contain',
  },
  progressWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 22,
    borderRadius: 11,
    backgroundColor: '#29285F',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    borderRadius: 11,
    backgroundColor: '#FFC000',
    minWidth: 42,
    overflow: 'hidden',
  },
  progressStripe: {
    position: 'absolute',
    top: -10,
    width: 9,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ rotate: '35deg' }],
  },
  stepLabel: {
    position: 'absolute',
    alignSelf: 'center',
    top: -8,
    color: Colors.textWhite,
    fontSize: 28,
    fontFamily: 'Montserrat-ExtraBold',
    textShadowColor: '#171641',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  musicButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicIcon: {
    width: 34,
    height: 34,
  },
});
