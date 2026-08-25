import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Gender, OnboardingGoal, StoryPreference } from '../types/book';
import { useProfile } from '../hooks/useProfile';

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
  { key: 'familyBonding', label: () => 'Generar experiencias familiares' },
  { key: 'goodValues', label: () => 'Inculcar valores' },
  { key: 'stayEngaged', label: (n) => `Que ${n} aprenda otros idiomas` },
  { key: 'fallAsleepFaster', label: (n) => `Ayudar a que ${n} se duerma más rápido` },
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

const BG = '#292F86';
const WHITE = '#FFFFFF';
const MUTED = '#A8ADD1';
const YELLOW = '#FFC21C';
const CYAN = '#23BEE9';
const SELECTED = '#157AAE';
const ROW = '#343A91';
const INPUT = '#F1F1DF';

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.82, Math.min(1.3, Math.min(width / 360, height / 800)));

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

  const progressBarWidth = useRef(new RNAnimated.Value(0)).current;
  const slideX = useSharedValue(0);
  const slideOpacity = useSharedValue(1);
  const enterY = useSharedValue(0);
  const buttonY = useSharedValue(0);
  const buttonOpacity = useSharedValue(1);

  const step = STEP_ORDER[stepIndex] ?? 'loading';
  const displayName = name.trim() || 'tu hijo';

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    if (step !== 'loading') return;
    progressBarWidth.setValue(0);
    setLoadingProgress(0);

    RNAnimated.timing(progressBarWidth, {
      toValue: 1,
      duration: 5000,
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
    }, 5100);

    return () => {
      progressBarWidth.removeListener(listenerId);
      clearTimeout(finish);
    };
  }, [step, goals, preferences, completeOnboarding, progressBarWidth, router, updateGoals, updatePreferences]);

  const animateIn = useCallback((direction: number) => {
    slideX.value = direction * width * 0.12;
    slideOpacity.value = 0;
    enterY.value = 12 * scale;
    buttonY.value = 18 * scale;
    buttonOpacity.value = 0;

    slideX.value = withTiming(0, { duration: 330, easing: Easing.out(Easing.cubic) });
    slideOpacity.value = withTiming(1, { duration: 250 });
    enterY.value = withDelay(45, withTiming(0, { duration: 310, easing: Easing.out(Easing.cubic) }));
    buttonY.value = withDelay(135, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));
    buttonOpacity.value = withDelay(135, withTiming(1, { duration: 230 }));
  }, [buttonOpacity, buttonY, enterY, scale, slideOpacity, slideX, width]);

  const goToStep = useCallback((nextIndex: number) => {
    const direction = nextIndex > stepIndex ? 1 : -1;
    buttonOpacity.value = withTiming(0, { duration: 130 });
    slideX.value = withTiming(-direction * width * 0.10, {
      duration: 180,
      easing: Easing.in(Easing.cubic),
    });
    slideOpacity.value = withTiming(0, { duration: 160 }, (finished) => {
      if (!finished) return;
      runOnJS(setStepIndex)(nextIndex);
      runOnJS(animateIn)(direction);
    });
  }, [animateIn, buttonOpacity, slideOpacity, slideX, stepIndex, width]);

  const handleBack = useCallback(() => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    goToStep(stepIndex - 1);
  }, [goToStep, router, stepIndex]);

  const handleNext = useCallback(async () => {
    if (step === 'name') {
      if (!name.trim()) return;
      await updateName(name.trim());
    } else if (step === 'gender') {
      await updateGender(gender);
      await updateAvatar(gender === 'boy' ? 'bear' : 'fox');
    }

    if (stepIndex + 1 < STEP_ORDER.length) {
      goToStep(stepIndex + 1);
    } else {
      setStepIndex(STEP_ORDER.length);
    }
  }, [gender, goToStep, name, step, stepIndex, updateAvatar, updateGender, updateName]);

  const handleSkip = useCallback(() => {
    if (stepIndex + 1 < STEP_ORDER.length) goToStep(stepIndex + 1);
    else setStepIndex(STEP_ORDER.length);
  }, [goToStep, stepIndex]);

  const handleEnableNotifications = useCallback(async () => {
    try {
      const { requestPermissionsAsync } = await import('expo-notifications');
      await requestPermissionsAsync();
    } catch (error) {
      console.warn('Could not request notification permission:', error);
    }
    await updateNotificationsEnabled(true);
    setStepIndex(STEP_ORDER.length);
  }, [updateNotificationsEnabled]);

  const handleSkipNotifications = useCallback(async () => {
    await updateNotificationsEnabled(false);
    setStepIndex(STEP_ORDER.length);
  }, [updateNotificationsEnabled]);

  const toggleGoal = (goal: OnboardingGoal) => {
    setGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]
    );
  };

  const togglePreference = (pref: StoryPreference) => {
    setPreferences((current) =>
      current.includes(pref) ? current.filter((item) => item !== pref) : [...current, pref]
    );
  };

  const contentAnim = useAnimatedStyle(() => ({
    opacity: slideOpacity.value,
    transform: [{ translateX: slideX.value }, { translateY: enterY.value }],
  }));

  const buttonsAnim = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonY.value }],
  }));

  const renderStep = () => {
    switch (step) {
      case 'language':
        return (
          <StepShell scale={scale}>
            <Image source={require('../assets/onboarding/ic_globe.webp')} style={{ width: 112 * scale, height: 112 * scale }} resizeMode="contain" />
            <Title scale={scale}>Elige un idioma</Title>
            <Subtitle scale={scale}>Puedes cambiarlo en la configuración cuando quieras.</Subtitle>
            <View style={[styles.languageCapsule, { height: 44 * scale, borderRadius: 22 * scale, paddingHorizontal: 28 * scale }]}>
              <Text style={[styles.languageCapsuleText, { fontSize: 16 * scale }]}>Español</Text>
            </View>
          </StepShell>
        );

      case 'noAi':
        return (
          <StepShell scale={scale}>
            <Image source={require('../assets/onboarding/no_ai.webp')} style={{ width: 245 * scale, height: 245 * scale, marginBottom: 10 * scale }} resizeMode="contain" />
            <Title scale={scale}>Sin inteligencia artificial.</Title>
            <Subtitle scale={scale}>Los cuentos, las ilustraciones y la música son creados por artistas.</Subtitle>
          </StepShell>
        );

      case 'protagonist':
        return (
          <StepShell scale={scale}>
            <Image source={require('../assets/onboarding/protagonist.webp')} style={{ width: 245 * scale, height: 245 * scale, marginBottom: 10 * scale }} resizeMode="contain" />
            <Title scale={scale}>Tus hijos son los protagonistas</Title>
            <Subtitle scale={scale}>Lee cuentos sobre tu hijo o sobre tu hija.</Subtitle>
          </StepShell>
        );

      case 'name':
        return (
          <StepShell scale={scale} topBias>
            <Title scale={scale}>Nombre del niño</Title>
            <Subtitle scale={scale}>Su nombre será parte del cuento.</Subtitle>
            <TextInput
              style={[styles.input, {
                width: Math.min(width * 0.76, 280 * scale),
                height: 43 * scale,
                borderRadius: 22 * scale,
                fontSize: 16 * scale,
                marginTop: 12 * scale,
              }]}
              value={name}
              onChangeText={setName}
              placeholder="Nombre"
              placeholderTextColor="#9699A8"
              autoFocus
              maxLength={20}
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
          </StepShell>
        );

      case 'gender':
        return (
          <StepShell scale={scale} topBias>
            <Title scale={scale}>Género</Title>
            <Subtitle scale={scale}>El protagonista del cuento tendrá el mismo género que tu hijo</Subtitle>
            <View style={[styles.genderRow, { marginTop: 22 * scale, gap: 52 * scale }]}>
              <GenderChoice gender="boy" selected={gender === 'boy'} scale={scale} onPress={() => setGender('boy')} />
              <GenderChoice gender="girl" selected={gender === 'girl'} scale={scale} onPress={() => setGender('girl')} />
            </View>
          </StepShell>
        );

      case 'preview':
        return (
          <StepShell scale={scale}>
            <Image
              source={require('../assets/onboarding/preview_cat.webp')}
              style={[styles.previewImage, {
                width: Math.min(width * 0.82, 292 * scale),
                height: Math.min(width * 0.82, 292 * scale),
                borderRadius: 22 * scale,
              }]}
              resizeMode="contain"
            />
            <Text style={[styles.previewTitle, { fontSize: 26 * scale, lineHeight: 28 * scale, marginTop: 12 * scale }]}>
              ¡A <Text style={styles.yellow}>{displayName}</Text> le va a encantar!
            </Text>
            <Subtitle scale={scale}>Va a ser una experiencia inolvidable para tus hijos.</Subtitle>
          </StepShell>
        );

      case 'goals':
        return (
          <StepShell scale={scale} topBias>
            <Title scale={scale}>¿Qué es lo que buscas?</Title>
            <Subtitle scale={scale}>Puedes elegir varias respuestas.</Subtitle>
            <View style={[styles.optionsList, { width: Math.min(width * 0.88, 316 * scale), gap: 7 * scale }]}>
              {GOALS.map((goal) => {
                const selected = goals.includes(goal.key);
                return (
                  <TouchableOpacity
                    key={goal.key}
                    style={[styles.optionRow, selected && styles.optionRowSelected, {
                      minHeight: 42 * scale,
                      borderRadius: 14 * scale,
                      paddingHorizontal: 12 * scale,
                      paddingVertical: 7 * scale,
                    }]}
                    onPress={() => toggleGoal(goal.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                  >
                    <View style={[styles.checkCircle, selected && styles.checkCircleSelected, {
                      width: 17 * scale,
                      height: 17 * scale,
                      borderRadius: 9 * scale,
                    }]}>
                      {selected && <Text style={[styles.checkMark, { fontSize: 12 * scale }]}>✓</Text>}
                    </View>
                    <Text style={[styles.optionText, { fontSize: 12.5 * scale, lineHeight: 16 * scale }]}>
                      {goal.label(displayName)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </StepShell>
        );

      case 'preferences':
        return (
          <StepShell scale={scale} topBias>
            <Title scale={scale}>¿Qué prefieres?</Title>
            <Subtitle scale={scale}>Puedes elegir varias respuestas.</Subtitle>
            <View style={[styles.preferenceList, { width: Math.min(width * 0.88, 316 * scale), gap: 10 * scale }]}>
              {PREFERENCES.map((pref) => {
                const selected = preferences.includes(pref.key);
                return (
                  <TouchableOpacity
                    key={pref.key}
                    style={[styles.preferenceCard, selected && styles.preferenceCardSelected, {
                      height: 73 * scale,
                      borderRadius: 18 * scale,
                      paddingHorizontal: 12 * scale,
                    }]}
                    onPress={() => togglePreference(pref.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                  >
                    <View style={[styles.checkCircle, selected && styles.checkCircleSelected, {
                      width: 17 * scale,
                      height: 17 * scale,
                      borderRadius: 9 * scale,
                    }]}>
                      {selected && <Text style={[styles.checkMark, { fontSize: 12 * scale }]}>✓</Text>}
                    </View>
                    <Text style={[styles.preferenceLabel, { fontSize: 13 * scale }]}>{pref.label}</Text>
                    <Image
                      source={selected ? pref.imageSelected : pref.image}
                      style={{ width: 72 * scale, height: 62 * scale, marginLeft: 'auto' }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </StepShell>
        );

      case 'notifications':
        return (
          <StepShell scale={scale}>
            <Image
              source={require('../assets/onboarding/notification.webp')}
              style={{ width: 235 * scale, height: 235 * scale, marginBottom: 8 * scale }}
              resizeMode="contain"
            />
            <Title scale={scale}>Permitir notificaciones</Title>
            <Subtitle scale={scale}>Te vamos a avisar si hay un cuento nuevo. Sin spam; lo prometemos.</Subtitle>
          </StepShell>
        );

      case 'loading':
        return (
          <View style={[styles.loadingContainer, { paddingHorizontal: 30 * scale }]}>
            <Image
              source={require('../assets/onboarding/loading_mascot.webp')}
              style={{ width: 190 * scale, height: 190 * scale, marginBottom: 15 * scale }}
              resizeMode="contain"
            />
            <Text style={[styles.loadingTitle, { fontSize: 27 * scale, lineHeight: 29 * scale }]}>
              Estamos preparando nuevos cuentos para ti
            </Text>
            <Text style={[styles.loadingSubtitle, { fontSize: 12.5 * scale, lineHeight: 17 * scale }]}>
              Estamos personalizando las imágenes y los textos...
            </Text>
            <View style={[styles.loadingTrack, {
              width: Math.min(width * 0.82, 300 * scale),
              height: 19 * scale,
              borderRadius: 10 * scale,
            }]}>
              <RNAnimated.View
                style={[styles.loadingFill, {
                  borderRadius: 10 * scale,
                  width: progressBarWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }]}
              />
              <Text style={[styles.loadingPercentInside, { fontSize: 10.5 * scale }]}>{loadingProgress}%</Text>
            </View>
          </View>
        );
    }
  };

  const showSkip = step === 'goals' || step === 'preferences';
  const nameDisabled = step === 'name' && name.trim().length === 0;

  return (
    <View style={styles.container}>
      <Image source={require('../assets/onboarding/stars.webp')} style={styles.starBackground} resizeMode="cover" />

      {step !== 'loading' && (
        <Header
          scale={scale}
          step={stepIndex + 1}
          total={TOTAL_STEPS}
          onBack={handleBack}
          musicEnabled={profile.musicEnabled}
          onToggleMusic={toggleMusic}
        />
      )}

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, {
            paddingHorizontal: 18 * scale,
            paddingTop: 8 * scale,
            paddingBottom: 8 * scale,
          }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.animatedBody, contentAnim]}>
            {renderStep()}
          </Animated.View>
        </ScrollView>

        {step !== 'loading' && (
          <Animated.View style={[styles.bottomArea, {
            paddingHorizontal: 24 * scale,
            paddingBottom: 22 * scale,
            gap: 7 * scale,
          }, buttonsAnim]}>
            {step === 'notifications' && (
              <TouchableOpacity onPress={handleSkipNotifications} style={{ width: '100%' }}>
                <View style={[styles.secondaryButton, { height: 42 * scale, borderRadius: 21 * scale }]}>
                  <Text style={[styles.secondaryButtonText, { fontSize: 13 * scale }]}>Quizás más tarde</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={step === 'notifications' ? handleEnableNotifications : handleNext}
              disabled={nameDisabled}
              style={{ width: '100%' }}
              accessibilityRole="button"
              accessibilityLabel="Continuar"
            >
              <LinearGradient
                colors={nameDisabled ? ['#4A55AE', '#5263C4'] : ['#F7C22A', '#FF9437']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.primaryButton, { height: 42 * scale, borderRadius: 21 * scale }]}
              >
                <Text style={[styles.primaryButtonText, { fontSize: 14 * scale }]}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>

            {showSkip && (
              <TouchableOpacity onPress={handleSkip} accessibilityRole="button" accessibilityLabel="Omitir">
                <Text style={[styles.skipText, { fontSize: 11.5 * scale }]}>Omitir</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function Header({
  scale,
  step,
  total,
  onBack,
  musicEnabled,
  onToggleMusic,
}: {
  scale: number;
  step: number;
  total: number;
  onBack: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}) {
  const progress = Math.max(0, Math.min(1, step / total));
  return (
    <View style={[styles.header, {
      height: 70 * scale,
      paddingHorizontal: 14 * scale,
      paddingTop: 10 * scale,
    }]}>
      <TouchableOpacity
        style={[styles.headerCircle, { width: 40 * scale, height: 40 * scale, borderRadius: 20 * scale }]}
        onPress={onBack}
        accessibilityLabel="Regresar"
      >
        <Text style={[styles.backChevron, { fontSize: 29 * scale }]}>‹</Text>
      </TouchableOpacity>

      <View style={[styles.progressWrap, { width: 150 * scale }]}>
        <View style={[styles.progressTrack, { height: 12 * scale, borderRadius: 6 * scale }]}>
          <LinearGradient
            colors={['#FFD52A', '#F7A91E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%`, borderRadius: 6 * scale }]}
          />
        </View>
        <Text style={[styles.stepCount, { fontSize: 13 * scale }]}>{step}/{total}</Text>
      </View>

      <TouchableOpacity
        style={[styles.headerCircle, { width: 40 * scale, height: 40 * scale, borderRadius: 20 * scale }]}
        onPress={onToggleMusic}
        accessibilityLabel={musicEnabled ? 'Silenciar música' : 'Activar música'}
      >
        <Image
          source={musicEnabled ? require('../assets/onboarding/ic_music_on.png') : require('../assets/onboarding/ic_music_off.png')}
          style={{ width: 23 * scale, height: 23 * scale }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

function StepShell({ children, scale, topBias = false }: { children: React.ReactNode; scale: number; topBias?: boolean }) {
  return (
    <View style={[styles.stepContainer, {
      paddingTop: topBias ? 16 * scale : 0,
      paddingBottom: 6 * scale,
    }]}>
      {children}
    </View>
  );
}

function Title({ children, scale }: { children: React.ReactNode; scale: number }) {
  return <Text style={[styles.title, { fontSize: 27 * scale, lineHeight: 30 * scale }]}>{children}</Text>;
}

function Subtitle({ children, scale }: { children: React.ReactNode; scale: number }) {
  return <Text style={[styles.subtitle, { fontSize: 12.5 * scale, lineHeight: 17 * scale }]}>{children}</Text>;
}

function GenderChoice({
  gender,
  selected,
  scale,
  onPress,
}: {
  gender: Gender;
  selected: boolean;
  scale: number;
  onPress: () => void;
}) {
  const source = gender === 'boy'
    ? (selected ? require('../assets/onboarding/ic_boy_on.png') : require('../assets/onboarding/ic_boy.png'))
    : (selected ? require('../assets/onboarding/ic_girl_on.png') : require('../assets/onboarding/ic_girl.png'));

  return (
    <TouchableOpacity style={styles.genderChoice} onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>
      <Image source={source} style={{ width: 78 * scale, height: 92 * scale }} resizeMode="contain" />
      <Text style={[styles.genderLabel, { fontSize: 13 * scale }]}>{gender === 'boy' ? 'Niño' : 'Niña'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  starBackground: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  headerCircle: {
    backgroundColor: '#3E459B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backChevron: {
    color: WHITE,
    fontFamily: 'Montserrat-SemiBold',
    lineHeight: 31,
    marginTop: -3,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  progressTrack: {
    flex: 1,
    backgroundColor: '#1D235E',
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },
  stepCount: {
    color: WHITE,
    fontFamily: 'Montserrat-ExtraBold',
  },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  animatedBody: { width: '100%' },
  stepContainer: { alignItems: 'center', width: '100%' },
  title: {
    color: WHITE,
    fontFamily: 'BalooBhaijaan',
    textAlign: 'center',
    marginBottom: 2,
  },
  previewTitle: {
    color: WHITE,
    fontFamily: 'BalooBhaijaan',
    textAlign: 'center',
  },
  yellow: { color: YELLOW },
  subtitle: {
    color: MUTED,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginBottom: 13,
    maxWidth: '90%',
  },
  languageCapsule: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SELECTED,
    borderWidth: 1,
    borderColor: CYAN,
  },
  languageCapsuleText: { color: WHITE, fontFamily: 'Montserrat-ExtraBold' },
  input: {
    backgroundColor: INPUT,
    color: '#686A79',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  genderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  genderChoice: { alignItems: 'center', justifyContent: 'center' },
  genderLabel: {
    color: WHITE,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 4,
  },
  previewImage: {
    borderWidth: 3,
    borderColor: '#F2F1DF',
    backgroundColor: '#161A56',
  },
  optionsList: { alignItems: 'stretch' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: ROW,
    borderWidth: 1,
    borderColor: '#4E54A3',
  },
  optionRowSelected: {
    backgroundColor: SELECTED,
    borderColor: CYAN,
  },
  checkCircle: {
    borderWidth: 1.4,
    borderColor: '#646AAF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleSelected: {
    backgroundColor: '#17BDEA',
    borderColor: '#17BDEA',
  },
  checkMark: {
    color: WHITE,
    fontFamily: 'Montserrat-ExtraBold',
    marginTop: -1,
  },
  optionText: {
    color: WHITE,
    fontFamily: 'Montserrat-SemiBold',
    flex: 1,
  },
  preferenceList: { alignItems: 'stretch' },
  preferenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ROW,
    borderWidth: 1.4,
    borderColor: '#4E54A3',
  },
  preferenceCardSelected: {
    backgroundColor: SELECTED,
    borderColor: CYAN,
  },
  preferenceLabel: {
    color: WHITE,
    fontFamily: 'Montserrat-ExtraBold',
    marginLeft: 10,
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: { color: WHITE, fontFamily: 'Montserrat-ExtraBold' },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#4C58B5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: { color: WHITE, fontFamily: 'Montserrat-ExtraBold' },
  skipText: {
    color: MUTED,
    fontFamily: 'Montserrat-SemiBold',
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    color: WHITE,
    fontFamily: 'BalooBhaijaan',
    textAlign: 'center',
    maxWidth: 310,
  },
  loadingSubtitle: {
    color: MUTED,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 14,
  },
  loadingTrack: {
    backgroundColor: '#364294',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#FFB326',
  },
  loadingPercentInside: {
    position: 'absolute',
    alignSelf: 'center',
    color: WHITE,
    fontFamily: 'Montserrat-ExtraBold',
  },
});