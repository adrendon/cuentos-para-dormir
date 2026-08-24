import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import ReanimatedAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Gradients } from '../theme/colors';
import { Gender, OnboardingGoal, StoryPreference } from '../types/book';
import { useProfile } from '../hooks/useProfile';
import { GenderSelector } from '../components/GenderSelector';
import { OnboardingHeader } from '../components/OnboardingHeader';

type OnboardingStep =
  | 'language'
  | 'noAi'
  | 'protagonist'
  | 'name'
  | 'gender'
  | 'preview'
  | 'goals'
  | 'preferences'
  | 'notifications'
  | 'loading';

const STEP_ORDER: OnboardingStep[] = [
  'language',
  'noAi',
  'protagonist',
  'name',
  'gender',
  'preview',
  'goals',
  'preferences',
  'notifications',
];
const TOTAL_STEPS = STEP_ORDER.length;

const GOALS: { key: OnboardingGoal; label: (name: string) => string }[] = [
  { key: 'fallAsleepFaster', label: (n) => `Ayudar a que ${n} se duerma más rápido` },
  { key: 'familyBonding', label: () => 'Generar experiencias familiares' },
  { key: 'goodValues', label: () => 'Inculcar valores' },
  { key: 'stayEngaged', label: (n) => `Que ${n} aprenda otros idiomas` },
  { key: 'learnNewWords', label: (n) => `Que ${n} amplíe su vocabulario` },
];

const PREFERENCES: {
  key: StoryPreference;
  label: string;
  image: any;
  imageSelected: any;
}[] = [
  {
    key: 'read',
    label: 'Leer cuentos',
    image: require('../assets/onboarding/pref_read.webp'),
    imageSelected: require('../assets/onboarding/pref_read_selected.webp'),
  },
  {
    key: 'listen',
    label: 'Escuchar cuentos',
    image: require('../assets/onboarding/pref_listen.webp'),
    imageSelected: require('../assets/onboarding/pref_listen_selected.webp'),
  },
  {
    key: 'record',
    label: 'Narrar cuentos',
    image: require('../assets/onboarding/pref_record.webp'),
    imageSelected: require('../assets/onboarding/pref_record_selected.webp'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const {
    profile,
    updateName,
    updateGender,
    updateAvatar,
    updateGoals,
    updatePreferences,
    updateNotificationsEnabled,
    toggleMusic,
    completeOnboarding,
  } = useProfile();

  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [goals, setGoals] = useState<OnboardingGoal[]>([]);
  const [preferences, setPreferences] = useState<StoryPreference[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;

  // Reanimated slide + alpha transition
  const { width: screenWidth } = useWindowDimensions();
  const slideTranslateX = useSharedValue(0);
  const slideOpacity = useSharedValue(1);
  const [directionRef] = useState({ current: 1 }); // 1 = forward, -1 = back

  const slideAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideTranslateX.value }],
    opacity: slideOpacity.value,
  }));

  const step = STEP_ORDER[stepIndex] ?? 'loading';

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  // No per-step fade needed—reanimated handles it in goToStep.

  // Drive the "preparing stories" loading screen, then enter the library.
  useEffect(() => {
    if (step !== 'loading') return;

    Animated.timing(progressBarWidth, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start();

    const listenerId = progressBarWidth.addListener(({ value }) => {
      setLoadingProgress(Math.round(value * 100));
    });

    const finish = setTimeout(async () => {
      await updateGoals(goals);
      await updatePreferences(preferences);
      await completeOnboarding();
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      router.replace('/library');
    }, 1900);

    return () => {
      progressBarWidth.removeListener(listenerId);
      clearTimeout(finish);
    };
  }, [step]);

  const goToStep = useCallback(
    (nextIndex: number) => {
      const direction = nextIndex > stepIndex ? 1 : -1;
      directionRef.current = direction;
      // Animate current content out (slide out + fade)
      slideTranslateX.value = withTiming(-direction * screenWidth * 0.3, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      slideOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          // Jump to the opposite side instantly, then animate in
          slideTranslateX.value = direction * screenWidth * 0.3;
          runOnJS(setStepIndex)(nextIndex);
          slideTranslateX.value = withTiming(0, {
            duration: 250,
            easing: Easing.out(Easing.cubic),
          });
          slideOpacity.value = withTiming(1, { duration: 250 });
        }
      });
    },
    [stepIndex, screenWidth, slideTranslateX, slideOpacity, directionRef]
  );

  const handleBack = useCallback(() => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    goToStep(stepIndex - 1);
  }, [stepIndex, goToStep, router]);

  const handleNext = useCallback(async () => {
    if (step === 'name') {
      if (name.trim().length === 0) return;
      await updateName(name.trim());
    } else if (step === 'gender') {
      await updateGender(gender);
      await updateAvatar(gender === 'boy' ? 'bear' : 'fox');
    }

    if (stepIndex + 1 < STEP_ORDER.length) {
      goToStep(stepIndex + 1);
    } else {
      // Last onboarding step done -> show preparing-stories loading screen.
      setStepIndex(STEP_ORDER.length);
    }
  }, [step, name, gender, stepIndex, goToStep, updateName, updateGender, updateAvatar]);

  const handleSkip = useCallback(() => {
    if (stepIndex + 1 < STEP_ORDER.length) {
      goToStep(stepIndex + 1);
    } else {
      setStepIndex(STEP_ORDER.length);
    }
  }, [stepIndex, goToStep]);

  const handleEnableNotifications = useCallback(async () => {
    // Request actual Android notification permission
    try {
      const { requestPermissionsAsync } = await import('expo-notifications');
      await requestPermissionsAsync();
    } catch (e) {
      console.warn('Could not request notification permission:', e);
    }
    await updateNotificationsEnabled(true);
    setStepIndex(STEP_ORDER.length);
  }, [updateNotificationsEnabled]);

  const handleSkipNotifications = useCallback(async () => {
    await updateNotificationsEnabled(false);
    setStepIndex(STEP_ORDER.length);
  }, [updateNotificationsEnabled]);

  const toggleGoal = (goal: OnboardingGoal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const togglePreference = (pref: StoryPreference) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const displayName = name.trim() || 'tu hijo';

  const renderStep = () => {
    switch (step) {
      case 'language':
        return (
          <View style={styles.stepContainer}>
            <Image
              source={require('../assets/onboarding/ic_globe.webp')}
              style={styles.mediumIllustration}
              resizeMode="contain"
            />
            <Text style={styles.stepTitle}>Elige un idioma</Text>
            <Text style={styles.stepSubtitle}>
              Puedes cambiarlo en la configuración cuando quieras.
            </Text>
            <View style={styles.languageCapsule}>
              <Text style={styles.languageCapsuleText}>Español</Text>
            </View>
          </View>
        );

      case 'noAi':
        return (
          <View style={styles.stepContainer}>
            <Image
              source={require('../assets/onboarding/no_ai.webp')}
              style={styles.largeIllustration}
              resizeMode="contain"
            />
            <Text style={styles.stepTitle}>Sin inteligencia artificial</Text>
            <Text style={styles.stepSubtitle}>
              Los cuentos, las ilustraciones y la música son creados por artistas.
            </Text>
          </View>
        );

      case 'protagonist':
        return (
          <View style={styles.stepContainer}>
            <Image
              source={require('../assets/onboarding/protagonist.webp')}
              style={styles.largeIllustration}
              resizeMode="contain"
            />
            <Text style={styles.stepTitle}>Tus hijos son los protagonistas</Text>
            <Text style={styles.stepSubtitle}>
              Lee cuentos sobre tu hijo o sobre tu hija.
            </Text>
          </View>
        );

      case 'name':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Nombre del niño</Text>
            <Text style={styles.stepSubtitle}>Su nombre será parte del cuento.</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre"
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
            <Text style={styles.stepTitle}>Género</Text>
            <Text style={styles.stepSubtitle}>
              El protagonista del cuento tendrá el mismo género que tu hijo
            </Text>
            <GenderSelector selected={gender} onSelect={setGender} />
          </View>
        );

      case 'preview':
        return (
          <View style={styles.stepContainer}>
            <Image
              source={require('../assets/onboarding/preview_cat.webp')}
              style={styles.largeIllustration}
              resizeMode="contain"
            />
            <Text style={styles.stepTitle}>
              ¡A <Text style={styles.highlightYellow}>{displayName}</Text> le va a encantar!
            </Text>
            <Text style={styles.stepSubtitle}>
              Va a ser una experiencia inolvidable para tus hijos.
            </Text>
          </View>
        );

      case 'goals':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>¿Qué es lo que buscas?</Text>
            <Text style={styles.stepSubtitle}>Puedes elegir varias respuestas.</Text>
            <View style={styles.optionsList}>
              {GOALS.map((goal) => {
                const isSelected = goals.includes(goal.key);
                return (
                  <TouchableOpacity
                    key={goal.key}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => toggleGoal(goal.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                      {isSelected && <View style={styles.checkDot} />}
                    </View>
                    <Text style={styles.optionText}>{goal.label(displayName)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'preferences':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>¿Qué prefieres?</Text>
            <Text style={styles.stepSubtitle}>Puedes elegir varias respuestas.</Text>
            <View style={styles.preferenceCardsRow}>
              {PREFERENCES.map((pref) => {
                const isSelected = preferences.includes(pref.key);
                return (
                  <TouchableOpacity
                    key={pref.key}
                    style={[styles.preferenceCard, isSelected && styles.preferenceCardSelected]}
                    onPress={() => togglePreference(pref.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Image
                      source={isSelected ? pref.imageSelected : pref.image}
                      style={styles.preferenceImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.preferenceLabel}>{pref.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'notifications':
        return (
          <View style={styles.stepContainer}>
            <Image
              source={require('../assets/onboarding/notification.webp')}
              style={styles.largeIllustration}
              resizeMode="contain"
            />
            <Text style={styles.stepTitle}>Permitir notificaciones</Text>
            <Text style={styles.stepSubtitle}>
              Te vamos a avisar si hay un cuento nuevo. Sin spam; lo prometemos.
            </Text>
          </View>
        );

      case 'loading':
        return (
          <View style={styles.stepContainer}>
            <Image
              source={require('../assets/onboarding/loading_mascot.webp')}
              style={styles.largeIllustration}
              resizeMode="contain"
            />
            <Text style={styles.stepTitle}>Estamos preparando nuevos cuentos para ti</Text>
            <Text style={styles.stepSubtitle}>
              Estamos personalizando las imágenes y los textos…
            </Text>
            <View style={styles.loadingTrack}>
              <Animated.View
                style={[
                  styles.loadingFill,
                  {
                    width: progressBarWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.loadingPercent}>{loadingProgress}%</Text>
          </View>
        );
    }
  };

  const showSkip = step === 'goals' || step === 'preferences';
  const isNameStep = step === 'name';
  const isButtonDisabled = isNameStep && name.trim().length === 0;

  return (
    <View style={styles.container}>
      {step !== 'loading' && (
        <OnboardingHeader
          step={stepIndex + 1}
          totalSteps={TOTAL_STEPS}
          onBack={handleBack}
          musicEnabled={profile.musicEnabled}
          onToggleMusic={toggleMusic}
        />
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ReanimatedAnimated.View style={slideAnimStyle}>
            {renderStep()}
          </ReanimatedAnimated.View>
        </ScrollView>

        {step === 'notifications' ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSkipNotifications}
              style={styles.secondaryButtonWrapper}
              accessibilityRole="button"
              accessibilityLabel="Quizás más tarde"
            >
              <View style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Quizás más tarde</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEnableNotifications}
              style={styles.buttonWrapper}
              accessibilityRole="button"
              accessibilityLabel="Continuar"
            >
              <LinearGradient
                colors={[...Gradients.primaryButton]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : step !== 'loading' ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleNext}
              disabled={isButtonDisabled}
              style={styles.buttonWrapper}
              accessibilityRole="button"
              accessibilityLabel="Continuar"
            >
              <LinearGradient
                colors={isButtonDisabled ? ['#555', '#444'] : [...Gradients.primaryButton]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>
            {showSkip && (
              <TouchableOpacity
                onPress={handleSkip}
                style={styles.skipButton}
                accessibilityRole="button"
                accessibilityLabel="Omitir"
              >
                <Text style={styles.skipButtonText}>Omitir</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
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
    paddingTop: 24,
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  largeIllustration: {
    width: 220,
    height: 220,
    marginBottom: 16,
  },
  mediumIllustration: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  stepTitle: {
    color: Colors.textWhite,
    fontSize: 28,
    fontFamily: 'BalooBhaijaan',
    textAlign: 'center',
    marginBottom: 8,
  },
  highlightYellow: {
    color: Colors.accentYellow,
  },
  stepSubtitle: {
    color: Colors.subtitleGray,
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  languageCapsule: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: Colors.capsuleSelected,
    borderWidth: 2,
    borderColor: Colors.chipPurple,
  },
  languageCapsuleText: {
    color: Colors.textWhite,
    fontSize: 17,
    fontWeight: '700',
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
  optionsList: {
    width: '100%',
    gap: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.backgroundGradientEnd,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(62, 112, 220, 0.35)',
    borderWidth: 1,
    borderColor: Colors.accentCyan,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleSelected: {
    borderColor: Colors.accentCyan,
  },
  checkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accentCyan,
  },
  optionText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  preferenceCardsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  preferenceCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: Colors.backgroundGradientEnd,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  preferenceCardSelected: {
    borderColor: Colors.accentCyan,
    backgroundColor: 'rgba(62, 112, 220, 0.35)',
  },
  preferenceImage: {
    width: 64,
    height: 64,
    marginBottom: 10,
  },
  preferenceLabel: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingTrack: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.backgroundGradientEnd,
    overflow: 'hidden',
    marginTop: 8,
  },
  loadingFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: Colors.accentYellow,
  },
  loadingPercent: {
    color: Colors.subtitleGray,
    fontSize: 13,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
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
    fontFamily: 'Montserrat-ExtraBold',
  },
  secondaryButtonWrapper: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.buttonOrangeEnd,
  },
  secondaryButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    position: 'absolute',
    bottom: -28,
    alignSelf: 'center',
  },
  skipButtonText: {
    color: Colors.subtitleGray,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
