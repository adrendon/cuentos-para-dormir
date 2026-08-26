import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { Gender, OnboardingGoal, StoryPreference } from '../types/book';
import { useProfile } from '../hooks/useProfile';
import { OnboardingStarField } from '../components/OnboardingStarField';

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
  { key: 'stayEngaged', label: (name) => `Que ${name} aprenda otros idiomas` },
  { key: 'fallAsleepFaster', label: (name) => `Ayudar a que ${name} se duerma más rápido` },
  { key: 'learnNewWords', label: (name) => `Que ${name} amplíe su vocabulario` },
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
const MUTED = '#ADB1D5';
const YELLOW = '#FFC21C';
const CYAN = '#23BEE9';
const SELECTED = '#157AAE';
const ROW = '#343A91';
const INPUT = '#F1F1DF';

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.82, Math.min(1.24, Math.min(width / 360, height / 800)));

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

  const bodyOpacity = useRef(new Animated.Value(1)).current;
  const bodyTranslateX = useRef(new Animated.Value(0)).current;
  const bodyTranslateY = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(1)).current;
  const buttonsTranslateY = useRef(new Animated.Value(0)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;
  const transitionLock = useRef(false);

  const step = STEP_ORDER[stepIndex] ?? 'loading';
  const displayName = name.trim() || 'tu hijo';

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    bodyOpacity.setValue(1);
    bodyTranslateX.setValue(0);
    bodyTranslateY.setValue(0);
    buttonsOpacity.setValue(1);
    buttonsTranslateY.setValue(0);
  }, [bodyOpacity, bodyTranslateX, bodyTranslateY, buttonsOpacity, buttonsTranslateY]);

  useEffect(() => {
    if (step !== 'loading') return;

    progressBarWidth.setValue(0);
    setLoadingProgress(0);

    const listenerId = progressBarWidth.addListener(({ value }) => {
      setLoadingProgress(Math.round(value * 100));
    });

    Animated.timing(progressBarWidth, {
      toValue: 1,
      duration: 5000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

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
  }, [completeOnboarding, goals, preferences, progressBarWidth, router, step, updateGoals, updatePreferences]);

  const animateStepIn = useCallback((direction: number) => {
    bodyTranslateX.setValue(direction * width * 0.50);
    bodyTranslateY.setValue(0);
    bodyOpacity.setValue(0);
    buttonsTranslateY.setValue(28 * scale);
    buttonsOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(bodyTranslateX, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bodyOpacity, {
        toValue: 1,
        duration: 330,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonsTranslateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        transitionLock.current = false;
      });
    }, 120);
  }, [bodyOpacity, bodyTranslateX, bodyTranslateY, buttonsOpacity, buttonsTranslateY, scale, width]);

  const goToStep = useCallback((nextIndex: number) => {
    if (transitionLock.current || nextIndex < 0 || nextIndex > STEP_ORDER.length) return;
    transitionLock.current = true;
    const direction = nextIndex > stepIndex ? 1 : -1;

    Animated.parallel([
      Animated.timing(bodyTranslateX, {
        toValue: -direction * width * 0.42,
        duration: 270,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bodyOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStepIndex(nextIndex);
      requestAnimationFrame(() => animateStepIn(direction));
    });
  }, [animateStepIn, bodyOpacity, bodyTranslateX, buttonsOpacity, stepIndex, width]);

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

    if (stepIndex + 1 <= STEP_ORDER.length) goToStep(stepIndex + 1);
  }, [gender, goToStep, name, step, stepIndex, updateAvatar, updateGender, updateName]);

  const handleSkip = useCallback(() => {
    if (stepIndex + 1 <= STEP_ORDER.length) goToStep(stepIndex + 1);
  }, [goToStep, stepIndex]);

  const handleEnableNotifications = useCallback(async () => {
    try {
      const { requestPermissionsAsync } = await import('expo-notifications');
      await requestPermissionsAsync();
    } catch (error) {
      console.warn('Could not request notification permission:', error);
    }
    await updateNotificationsEnabled(true);
    goToStep(STEP_ORDER.length);
  }, [goToStep, updateNotificationsEnabled]);

  const handleSkipNotifications = useCallback(async () => {
    await updateNotificationsEnabled(false);
    goToStep(STEP_ORDER.length);
  }, [goToStep, updateNotificationsEnabled]);

  const toggleGoal = (goal: OnboardingGoal) => {
    setGoals((current) => current.includes(goal)
      ? current.filter((item) => item !== goal)
      : [...current, goal]);
  };

  const togglePreference = (preference: StoryPreference) => {
    setPreferences((current) => current.includes(preference)
      ? current.filter((item) => item !== preference)
      : [...current, preference]);
  };

  const renderStep = () => {
    switch (step) {
      case 'language':
        return (
          <StepShell scale={scale} motionKey={step}>
            <Image source={require('../assets/onboarding/ic_globe.webp')} style={{ width: 106 * scale, height: 106 * scale, marginBottom: 4 * scale }} resizeMode="contain" fadeDuration={0} />
            <Title scale={scale}>Elige un idioma</Title>
            <Subtitle scale={scale}>Puedes cambiarlo en la configuración cuando quieras.</Subtitle>
            <View style={[styles.languageCapsule, { height: 44 * scale, borderRadius: 22 * scale, paddingHorizontal: 30 * scale }]}>
              <Text style={[styles.languageCapsuleText, { fontSize: 16 * scale }]}>Español</Text>
            </View>
          </StepShell>
        );

      case 'noAi':
        return (
          <StepShell scale={scale} motionKey={step}>
            <Image source={require('../assets/onboarding/no_ai.webp')} style={{ width: 238 * scale, height: 238 * scale, marginBottom: 8 * scale }} resizeMode="contain" fadeDuration={0} />
            <Title scale={scale}>Sin inteligencia artificial.</Title>
            <Subtitle scale={scale}>Los cuentos, las ilustraciones y la música son creados por artistas.</Subtitle>
          </StepShell>
        );

      case 'protagonist':
        return (
          <StepShell scale={scale} motionKey={step}>
            <Image source={require('../assets/onboarding/protagonist.webp')} style={{ width: 238 * scale, height: 238 * scale, marginBottom: 8 * scale }} resizeMode="contain" fadeDuration={0} />
            <Title scale={scale}>Tus hijos son los protagonistas</Title>
            <Subtitle scale={scale}>Lee cuentos sobre tu hijo o sobre tu hija.</Subtitle>
          </StepShell>
        );

      case 'name':
        return (
          <StepShell scale={scale} topBias motionKey={step}>
            <Title scale={scale}>Nombre del niño</Title>
            <Subtitle scale={scale}>Su nombre será parte del cuento.</Subtitle>
            <TextInput
              style={[styles.input, { width: Math.min(width * 0.76, 280 * scale), height: 43 * scale, borderRadius: 22 * scale, fontSize: 16 * scale, marginTop: 12 * scale }]}
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
          <StepShell scale={scale} topBias motionKey={step}>
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
          <StepShell scale={scale} motionKey={step}>
            <Image source={require('../assets/onboarding/preview_cat.webp')} style={[styles.previewImage, { width: Math.min(width * 0.82, 292 * scale), height: Math.min(width * 0.82, 292 * scale), borderRadius: 22 * scale }]} resizeMode="contain" fadeDuration={0} />
            <Text style={[styles.previewTitle, { fontSize: 26 * scale, lineHeight: 28 * scale, marginTop: 12 * scale }]}>
              ¡A <Text style={styles.yellow}>{displayName}</Text> le va a encantar!
            </Text>
            <Subtitle scale={scale}>Va a ser una experiencia inolvidable para tus hijos.</Subtitle>
          </StepShell>
        );

      case 'goals':
        return (
          <StepShell scale={scale} topBias motionKey={step}>
            <Title scale={scale}>¿Qué es lo que buscas?</Title>
            <Subtitle scale={scale}>Puedes elegir varias respuestas.</Subtitle>
            <View style={[styles.optionsList, { width: Math.min(width * 0.88, 316 * scale), gap: 7 * scale }]}>
              {GOALS.map((goal) => {
                const selected = goals.includes(goal.key);
                return (
                  <TouchableOpacity key={goal.key} style={[styles.optionRow, selected && styles.optionRowSelected, { minHeight: 42 * scale, borderRadius: 14 * scale, paddingHorizontal: 12 * scale, paddingVertical: 7 * scale }]} onPress={() => toggleGoal(goal.key)}>
                    <View style={[styles.checkCircle, selected && styles.checkCircleSelected, { width: 17 * scale, height: 17 * scale, borderRadius: 9 * scale }]}>
                      {selected && <Text style={[styles.checkMark, { fontSize: 12 * scale }]}>✓</Text>}
                    </View>
                    <Text style={[styles.optionText, { fontSize: 12.5 * scale, lineHeight: 16 * scale }]}>{goal.label(displayName)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </StepShell>
        );

      case 'preferences':
        return (
          <StepShell scale={scale} topBias motionKey={step}>
            <Title scale={scale}>¿Qué prefieres?</Title>
            <Subtitle scale={scale}>Puedes elegir varias respuestas.</Subtitle>
            <View style={[styles.preferenceList, { width: Math.min(width * 0.88, 316 * scale), gap: 10 * scale }]}>
              {PREFERENCES.map((preference) => {
                const selected = preferences.includes(preference.key);
                return (
                  <TouchableOpacity key={preference.key} style={[styles.preferenceCard, selected && styles.preferenceCardSelected, { height: 73 * scale, borderRadius: 18 * scale, paddingHorizontal: 12 * scale }]} onPress={() => togglePreference(preference.key)}>
                    <View style={[styles.checkCircle, selected && styles.checkCircleSelected, { width: 17 * scale, height: 17 * scale, borderRadius: 9 * scale }]}>
                      {selected && <Text style={[styles.checkMark, { fontSize: 12 * scale }]}>✓</Text>}
                    </View>
                    <Text style={[styles.preferenceLabel, { fontSize: 13 * scale }]}>{preference.label}</Text>
                    <Image source={selected ? preference.imageSelected : preference.image} style={{ width: 72 * scale, height: 62 * scale, marginLeft: 'auto' }} resizeMode="contain" fadeDuration={0} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </StepShell>
        );

      case 'notifications':
        return (
          <StepShell scale={scale} motionKey={step}>
            <Image source={require('../assets/onboarding/notification.webp')} style={{ width: 230 * scale, height: 230 * scale, marginBottom: 8 * scale }} resizeMode="contain" fadeDuration={0} />
            <Title scale={scale}>Permitir notificaciones</Title>
            <Subtitle scale={scale}>Te vamos a avisar si hay un cuento nuevo. Sin spam; lo prometemos.</Subtitle>
          </StepShell>
        );

      case 'loading':
        return (
          <View style={[styles.loadingContainer, { paddingHorizontal: 30 * scale }]}>
            <Image source={require('../assets/onboarding/loading_mascot.webp')} style={{ width: 190 * scale, height: 190 * scale, marginBottom: 15 * scale }} resizeMode="contain" fadeDuration={0} />
            <Text style={[styles.loadingTitle, { fontSize: 27 * scale, lineHeight: 29 * scale }]}>Estamos preparando nuevos cuentos para ti</Text>
            <Text style={[styles.loadingSubtitle, { fontSize: 12.5 * scale, lineHeight: 17 * scale }]}>Estamos personalizando las imágenes y los textos...</Text>
            <View style={[styles.loadingTrack, { width: Math.min(width * 0.82, 300 * scale), height: 19 * scale, borderRadius: 10 * scale }]}>
              <Animated.View style={[styles.loadingFill, { borderRadius: 10 * scale, width: progressBarWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
              <Text style={[styles.loadingPercentInside, { fontSize: 10.5 * scale }]}>{loadingProgress}%</Text>
            </View>
          </View>
        );
    }
  };

  const showSkip = step === 'goals' || step === 'preferences';
  const nameDisabled = step === 'name' && name.trim().length === 0;

  const bodyStyle = useMemo(() => ({
    opacity: bodyOpacity,
    transform: [{ translateX: bodyTranslateX }, { translateY: bodyTranslateY }],
  }), [bodyOpacity, bodyTranslateX, bodyTranslateY]);

  const buttonsStyle = useMemo(() => ({
    opacity: buttonsOpacity,
    transform: [{ translateY: buttonsTranslateY }],
  }), [buttonsOpacity, buttonsTranslateY]);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundBase} pointerEvents="none" />
      <OnboardingStarField />

      {step !== 'loading' && (
        <Header scale={scale} step={stepIndex + 1} total={TOTAL_STEPS} onBack={handleBack} musicEnabled={profile.musicEnabled} onToggleMusic={toggleMusic} />
      )}

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 18 * scale, paddingTop: 8 * scale, paddingBottom: 8 * scale }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.animatedBody, bodyStyle]}>{renderStep()}</Animated.View>
        </ScrollView>

        {step !== 'loading' && (
          <Animated.View style={[styles.bottomArea, { paddingHorizontal: 24 * scale, paddingBottom: 22 * scale, gap: 7 * scale }, buttonsStyle]}>
            {step === 'notifications' && (
              <TouchableOpacity onPress={handleSkipNotifications} style={{ width: '100%' }}>
                <View style={[styles.secondaryButton, { height: 42 * scale, borderRadius: 21 * scale }]}>
                  <Text style={[styles.secondaryButtonText, { fontSize: 13 * scale }]}>Quizás más tarde</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={step === 'notifications' ? handleEnableNotifications : handleNext} disabled={nameDisabled} style={{ width: '100%' }}>
              <LinearGradient colors={nameDisabled ? ['#4A55AE', '#5263C4'] : ['#F7C22A', '#FF9437']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.primaryButton, { height: 42 * scale, borderRadius: 21 * scale }]}>
                <Text style={[styles.primaryButtonText, { fontSize: 14 * scale }]}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>

            {showSkip && (
              <TouchableOpacity onPress={handleSkip}>
                <Text style={[styles.skipText, { fontSize: 11.5 * scale }]}>Omitir</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

function Header({ scale, step, total, onBack, musicEnabled, onToggleMusic }: {
  scale: number;
  step: number;
  total: number;
  onBack: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}) {
  const progress = Math.max(0, Math.min(1, step / total));
  return (
    <View style={[styles.header, { height: 70 * scale, paddingHorizontal: 14 * scale, paddingTop: 10 * scale }]}>
      <TouchableOpacity style={[styles.headerCircle, { width: 40 * scale, height: 40 * scale, borderRadius: 20 * scale }]} onPress={onBack}>
        <Text style={[styles.backChevron, { fontSize: 29 * scale }]}>‹</Text>
      </TouchableOpacity>
      <View style={[styles.progressWrap, { width: 150 * scale }]}>
        <View style={[styles.progressTrack, { height: 12 * scale, borderRadius: 6 * scale }]}>
          <LinearGradient colors={['#FFD52A', '#F7A91E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${progress * 100}%`, borderRadius: 6 * scale }]} />
        </View>
        <Text style={[styles.stepCount, { fontSize: 13 * scale }]}>{step}/{total}</Text>
      </View>
      <TouchableOpacity style={[styles.headerCircle, { width: 40 * scale, height: 40 * scale, borderRadius: 20 * scale }]} onPress={onToggleMusic}>
        <Image source={musicEnabled ? require('../assets/onboarding/ic_music_on.png') : require('../assets/onboarding/ic_music_off.png')} style={{ width: 23 * scale, height: 23 * scale }} resizeMode="contain" fadeDuration={0} />
      </TouchableOpacity>
    </View>
  );
}

function StepShell({ children, scale, topBias = false, motionKey }: {
  children: React.ReactNode;
  scale: number;
  topBias?: boolean;
  motionKey: string;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const childArray = React.Children.toArray(children);

  useEffect(() => {
    entrance.setValue(0);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 560,
      delay: 90,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance, motionKey]);

  return (
    <View style={[styles.stepContainer, { paddingTop: topBias ? 16 * scale : 0, paddingBottom: 6 * scale }]}>
      {childArray.map((child, index) => {
        const start = Math.min(0.58, index * 0.12);
        const end = Math.min(1, start + 0.42);
        return (
          <Animated.View
            key={`${motionKey}-${index}`}
            style={{
              alignItems: 'center',
              opacity: entrance.interpolate({ inputRange: [start, end], outputRange: [0, 1], extrapolate: 'clamp' }),
              transform: [
                { translateY: entrance.interpolate({ inputRange: [start, end], outputRange: [18 * scale, 0], extrapolate: 'clamp' }) },
                { scale: entrance.interpolate({ inputRange: [start, end], outputRange: [0.98, 1], extrapolate: 'clamp' }) },
              ],
            }}
          >
            {child}
          </Animated.View>
        );
      })}
    </View>
  );
}

function Title({ children, scale }: { children: React.ReactNode; scale: number }) {
  return <Text style={[styles.title, { fontSize: 27 * scale, lineHeight: 30 * scale }]}>{children}</Text>;
}

function Subtitle({ children, scale }: { children: React.ReactNode; scale: number }) {
  return <Text style={[styles.subtitle, { fontSize: 12.5 * scale, lineHeight: 17 * scale }]}>{children}</Text>;
}

function GenderChoice({ gender, selected, scale, onPress }: { gender: Gender; selected: boolean; scale: number; onPress: () => void }) {
  const source = gender === 'boy'
    ? (selected ? require('../assets/onboarding/ic_boy_on.png') : require('../assets/onboarding/ic_boy.png'))
    : (selected ? require('../assets/onboarding/ic_girl_on.png') : require('../assets/onboarding/ic_girl.png'));
  return (
    <TouchableOpacity style={styles.genderChoice} onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>
      <Image source={source} style={{ width: 78 * scale, height: 92 * scale }} resizeMode="contain" fadeDuration={0} />
      <Text style={[styles.genderLabel, { fontSize: 13 * scale }]}>{gender === 'boy' ? 'Niño' : 'Niña'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, overflow: 'hidden' },
  backgroundBase: { ...StyleSheet.absoluteFillObject, backgroundColor: BG },
  starBackground: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', opacity: 0.13 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 },
  headerCircle: { backgroundColor: '#3E459B', justifyContent: 'center', alignItems: 'center' },
  backChevron: { color: WHITE, fontFamily: 'Montserrat-SemiBold', lineHeight: 31, marginTop: -3 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  progressTrack: { flex: 1, backgroundColor: '#1D235E', overflow: 'hidden' },
  progressFill: { height: '100%' },
  stepCount: { color: WHITE, fontFamily: 'Montserrat-ExtraBold' },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  animatedBody: { width: '100%', minHeight: 1 },
  stepContainer: { alignItems: 'center', width: '100%' },
  title: { color: WHITE, fontFamily: 'BalooBhaijaan', textAlign: 'center', marginBottom: 2 },
  previewTitle: { color: WHITE, fontFamily: 'BalooBhaijaan', textAlign: 'center' },
  yellow: { color: YELLOW },
  subtitle: { color: MUTED, fontFamily: 'Montserrat-SemiBold', textAlign: 'center', marginBottom: 13, maxWidth: '90%' },
  languageCapsule: { justifyContent: 'center', alignItems: 'center', backgroundColor: SELECTED, borderWidth: 1, borderColor: CYAN },
  languageCapsuleText: { color: WHITE, fontFamily: 'Montserrat-ExtraBold' },
  input: { backgroundColor: INPUT, color: '#686A79', fontFamily: 'Montserrat-SemiBold', textAlign: 'center', paddingHorizontal: 18 },
  genderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  genderChoice: { alignItems: 'center', justifyContent: 'center' },
  genderLabel: { color: WHITE, fontFamily: 'Montserrat-SemiBold', marginTop: 4 },
  previewImage: { borderWidth: 3, borderColor: '#F2F1DF', backgroundColor: '#161A56' },
  optionsList: { alignItems: 'stretch' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: ROW, borderWidth: 1, borderColor: '#4E54A3' },
  optionRowSelected: { backgroundColor: SELECTED, borderColor: CYAN },
  checkCircle: { borderWidth: 1.4, borderColor: '#646AAF', justifyContent: 'center', alignItems: 'center' },
  checkCircleSelected: { backgroundColor: '#17BDEA', borderColor: '#17BDEA' },
  checkMark: { color: WHITE, fontFamily: 'Montserrat-ExtraBold', marginTop: -1 },
  optionText: { color: WHITE, fontFamily: 'Montserrat-SemiBold', flex: 1 },
  preferenceList: { alignItems: 'stretch' },
  preferenceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: ROW, borderWidth: 1.4, borderColor: '#4E54A3' },
  preferenceCardSelected: { backgroundColor: SELECTED, borderColor: CYAN },
  preferenceLabel: { color: WHITE, fontFamily: 'Montserrat-ExtraBold', marginLeft: 10 },
  bottomArea: { width: '100%', alignItems: 'center' },
  primaryButton: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: WHITE, fontFamily: 'Montserrat-ExtraBold' },
  secondaryButton: { width: '100%', backgroundColor: '#4C58B5', justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { color: WHITE, fontFamily: 'Montserrat-ExtraBold' },
  skipText: { color: MUTED, fontFamily: 'Montserrat-SemiBold', textDecorationLine: 'underline' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { color: WHITE, fontFamily: 'BalooBhaijaan', textAlign: 'center', maxWidth: 310 },
  loadingSubtitle: { color: MUTED, fontFamily: 'Montserrat-SemiBold', textAlign: 'center', marginTop: 3, marginBottom: 14 },
  loadingTrack: { backgroundColor: '#364294', overflow: 'hidden', justifyContent: 'center' },
  loadingFill: { height: '100%', backgroundColor: '#FFB326' },
  loadingPercentInside: { position: 'absolute', alignSelf: 'center', color: WHITE, fontFamily: 'Montserrat-ExtraBold' },
});
