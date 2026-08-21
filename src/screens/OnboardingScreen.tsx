import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Gradients } from '../theme/colors';
import { Gender } from '../types/book';
import { useProfile } from '../hooks/useProfile';
import { GenderSelector } from '../components/GenderSelector';
import { AnimalSelector } from '../components/AnimalSelector';

type OnboardingStep = 'name' | 'gender' | 'avatar';

export default function OnboardingScreen() {
  const router = useRouter();
  const { profile, updateName, updateGender, updateAvatar, completeOnboarding } = useProfile();
  const [step, setStep] = useState<OnboardingStep>('name');
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [avatar, setAvatar] = useState(profile.avatar);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in on mount
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNext = async () => {
    if (step === 'name') {
      if (name.trim().length === 0) return;
      await updateName(name.trim());
      setStep('gender');
    } else if (step === 'gender') {
      await updateGender(gender);
      setStep('avatar');
    } else if (step === 'avatar') {
      await updateAvatar(avatar);
      await completeOnboarding();

      // Fade out then navigate
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/library');
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'name':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>¡Hola! 👋</Text>
            <Text style={styles.stepSubtitle}>
              ¿Cómo te llamas?
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Escribe tu nombre..."
              placeholderTextColor={Colors.subtitleGray}
              autoFocus
              maxLength={20}
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
          </View>
        );

      case 'gender':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>
              ¡Hola {name}! 🎉
            </Text>
            <GenderSelector selected={gender} onSelect={setGender} />
          </View>
        );

      case 'avatar':
        return (
          <View style={[styles.stepContainer, { flex: 1 }]}>
            <Text style={styles.stepTitle}>
              ¡Genial! 🌟
            </Text>
            <AnimalSelector selected={avatar} onSelect={setAvatar} />
          </View>
        );
    }
  };

  const getButtonLabel = () => {
    if (step === 'avatar') return '¡Comenzar!';
    return 'Continuar';
  };

  const isButtonDisabled = step === 'name' && name.trim().length === 0;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress dots */}
          <View style={styles.progressContainer}>
            {(['name', 'gender', 'avatar'] as OnboardingStep[]).map((s, i) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  (step === s || ['name', 'gender', 'avatar'].indexOf(step) > i) &&
                    styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Step content */}
          {renderStep()}
        </ScrollView>

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={isButtonDisabled}
            style={styles.buttonWrapper}
            accessibilityRole="button"
            accessibilityLabel={getButtonLabel()}
          >
            <LinearGradient
              colors={isButtonDisabled ? ['#555', '#444'] : [...Gradients.primaryButton]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{getButtonLabel()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: Colors.titleGold,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    color: Colors.titleGold,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: Colors.subtitleGray,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    fontSize: 20,
    color: Colors.textWhite,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
  },
  buttonWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: '700',
  },
});
