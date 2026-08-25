import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors, Fonts, Gradients } from '../theme/colors';
import { useProfile } from '../hooks/useProfile';
import { Gender } from '../types/book';

type SettingsView = 'gate' | 'profile' | 'language' | 'preparing';

const NUMBER_WORDS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
const STARS = Array.from({ length: 34 }, (_, index) => ({
  left: `${(index * 37) % 97}%`,
  top: `${(index * 53) % 94}%`,
  size: 2 + (index % 4),
}));

export default function SettingsScreen() {
  const router = useRouter();
  const { destination = 'profile' } = useLocalSearchParams<{ destination?: 'profile' | 'mail' }>();
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.68, Math.min(1.15, Math.min(width / 1280, height / 768)));
  const { profile, toggleMusic, updateLanguage, saveProfile } = useProfile();
  const [view, setView] = useState<SettingsView>('gate');
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [musicEnabled, setMusicEnabled] = useState(profile.musicEnabled);
  const [gateValue, setGateValue] = useState('');
  const [gateError, setGateError] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const [loadingPercent, setLoadingPercent] = useState(0);
  const challenge = useMemo(
    () => Array.from({ length: 3 }, () => String(Math.floor(Math.random() * 10))),
    []
  );

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useEffect(() => {
    setName(profile.name);
    setGender(profile.gender);
    setMusicEnabled(profile.musicEnabled);
  }, [profile.name, profile.gender, profile.musicEnabled]);

  useEffect(() => {
    if (view !== 'preparing') return;
    progress.setValue(0);
    const listener = progress.addListener(({ value }) => setLoadingPercent(Math.round(value * 100)));
    Animated.timing(progress, { toValue: 1, duration: 3000, useNativeDriver: false }).start();
    const finish = setTimeout(() => router.back(), 3100);
    return () => {
      progress.removeListener(listener);
      clearTimeout(finish);
    };
  }, [view, progress, router]);

  const handleGateKey = (key: string) => {
    if (!key) return;
    setGateError(false);
    if (key === '⌫') {
      setGateValue((current) => current.slice(0, -1));
      return;
    }
    if (gateValue.length >= challenge.length) return;
    const next = gateValue + key;
    setGateValue(next);
    if (next.length === challenge.length) {
      if (next === challenge.join('')) {
        if (destination === 'mail') {
          setTimeout(() => {
            router.back();
            setTimeout(() => {
              const url = 'mailto:abc@diveomedia.com?subject=PC%20(Android)%3A%20comentario';
              void Linking.openURL(url).catch(() => {
                Alert.alert('Correo no configurado', 'Configura una aplicación de correo o escribe a abc@diveomedia.com.');
              });
            }, 220);
          }, 120);
        } else {
          setTimeout(() => setView('profile'), 120);
        }
      } else {
        setGateError(true);
        setTimeout(() => setGateValue(''), 450);
      }
    }
  };

  const handleMusicToggle = () => {
    setMusicEnabled((current) => !current);
    void toggleMusic();
  };

  const handleContinue = async () => {
    const nextName = name.trim() || profile.name;
    const hasPersonalizationChange = nextName !== profile.name || gender !== profile.gender;
    await saveProfile({ ...profile, name: nextName, gender, language: 'es' });
    if (hasPersonalizationChange) setView('preparing');
    else router.back();
  };

  if (view === 'gate') {
    return (
      <View style={styles.gateBackdrop}>
        <View style={[styles.gateCard, { width: 520 * scale, borderRadius: 28 * scale, padding: 24 * scale }]}>
          <TouchableOpacity
            style={[styles.gateClose, { width: 56 * scale, height: 56 * scale, borderRadius: 28 * scale }]}
            onPress={() => router.back()}
            accessibilityLabel="Cerrar"
          >
            <Image source={require('../assets/ui/ic_close.png')} style={{ width: 30 * scale, height: 30 * scale }} />
          </TouchableOpacity>
          <Text style={[styles.gateTitle, { fontSize: 30 * scale }]}>Para mamá y papá</Text>
          <Text style={[styles.gateSubtitle, { fontSize: 19 * scale }]}>Escribe los números:</Text>
          <Text style={[styles.gateChallenge, { fontSize: 20 * scale }]}>
            {challenge.map((value) => NUMBER_WORDS[Number(value)]).join(', ')}
          </Text>
          <View style={[styles.gateInput, gateError && styles.gateInputError, { height: 50 * scale, borderRadius: 25 * scale }]}>
            <Text style={[styles.gateInputText, { fontSize: 25 * scale }]}>{'•'.repeat(gateValue.length)}</Text>
          </View>
          <View style={[styles.keypad, { width: 264 * scale, gap: 10 * scale, marginTop: 16 * scale }]}>
            {KEYS.map((key, index) => key ? (
              <TouchableOpacity
                key={`${key}-${index}`}
                style={[styles.key, { width: 78 * scale, height: 58 * scale, borderRadius: 29 * scale }]}
                onPress={() => handleGateKey(key)}
                accessibilityLabel={key === '⌫' ? 'Borrar' : key}
              >
                <Text style={[styles.keyText, { fontSize: 27 * scale }]}>{key}</Text>
              </TouchableOpacity>
            ) : <View key={`empty-${index}`} style={{ width: 78 * scale, height: 58 * scale }} />)}
          </View>
        </View>
      </View>
    );
  }

  if (view === 'preparing') {
    return (
      <SettingsBackground>
        <View style={styles.preparingContent}>
          <View style={[styles.preparingCopy, { width: 620 * scale }]}>
            <Text style={[styles.preparingTitle, { fontSize: 38 * scale }]}>Estamos preparando nuevos cuentos para ti</Text>
            <Text style={[styles.preparingSubtitle, { fontSize: 24 * scale }]}>Estamos personalizando las imágenes y los textos…</Text>
            <View style={[styles.progressTrack, { width: 430 * scale, height: 11 * scale, borderRadius: 6 * scale }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    borderRadius: 6 * scale,
                    width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { fontSize: 16 * scale }]}>{loadingPercent}%</Text>
          </View>
          <Image
            source={require('../assets/onboarding/loading_mascot.webp')}
            style={{ width: 300 * scale, height: 280 * scale }}
            resizeMode="contain"
          />
        </View>
      </SettingsBackground>
    );
  }

  if (view === 'language') {
    return (
      <SettingsBackground>
        <TouchableOpacity
          style={[styles.languageClose, { width: 64 * scale, height: 64 * scale, borderRadius: 32 * scale }]}
          onPress={() => setView('profile')}
          accessibilityLabel="Cerrar idioma"
        >
          <Image source={require('../assets/ui/ic_close.png')} style={{ width: 34 * scale, height: 34 * scale }} />
        </TouchableOpacity>
        <Image source={require('../assets/onboarding/ic_globe.webp')} style={[styles.languageGlobe, { width: 310 * scale, height: 360 * scale }]} resizeMode="contain" />
        <Image source={require('../assets/settings/fox.webp')} style={[styles.languageFox, { width: 300 * scale, height: 390 * scale }]} resizeMode="contain" />
        <View style={[styles.languageContent, { width: 430 * scale }]}>
          <Text style={[styles.languageTitle, { fontSize: 38 * scale }]}>Idioma</Text>
          <TouchableOpacity style={styles.languageRow} onPress={() => {}} accessibilityRole="radio" accessibilityState={{ selected: true }}>
            <View style={[styles.radioSelected, { width: 38 * scale, height: 38 * scale, borderRadius: 19 * scale }]} />
            <Text style={[styles.languageLabel, { fontSize: 24 * scale }]}>Español</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageConfirm, { width: 88 * scale, height: 88 * scale, borderRadius: 44 * scale }]}
            onPress={async () => {
              await updateLanguage('es');
              setView('profile');
            }}
            accessibilityLabel="Confirmar español"
          >
            <Text style={[styles.checkmark, { fontSize: 52 * scale }]}>✓</Text>
          </TouchableOpacity>
        </View>
      </SettingsBackground>
    );
  }

  return (
    <SettingsBackground>
      <Image source={require('../assets/settings/bear.webp')} style={[styles.bearImage, { width: 330 * scale, height: 470 * scale }]} resizeMode="contain" />
      <Image source={require('../assets/settings/fox.webp')} style={[styles.foxImage, { width: 330 * scale, height: 470 * scale }]} resizeMode="contain" />

      <TouchableOpacity
        style={[styles.topButton, styles.topLeft, { width: 70 * scale, height: 70 * scale, borderRadius: 35 * scale }]}
        onPress={() => setView('language')}
        accessibilityLabel="Idioma"
      >
        <Image source={require('../assets/ui/ic_settings_language.png')} style={{ width: 40 * scale, height: 40 * scale }} resizeMode="contain" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.topButton, styles.topRight, { width: 70 * scale, height: 70 * scale, borderRadius: 35 * scale }]}
        onPress={handleMusicToggle}
        accessibilityLabel="Música"
      >
        <Image
          source={musicEnabled ? require('../assets/onboarding/ic_music_on.png') : require('../assets/onboarding/ic_music_off.png')}
          style={{ width: 36 * scale, height: 36 * scale }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={[styles.profileForm, { width: 500 * scale }]}>
        <Text style={[styles.profileTitle, { fontSize: 37 * scale }]}>Historias sobre tus hijos</Text>
        <Text style={[styles.profileLabel, { fontSize: 23 * scale }]}>Nombre del niño/niña:</Text>
        <TextInput
          style={[styles.profileInput, { width: 390 * scale, height: 68 * scale, borderRadius: 34 * scale, fontSize: 22 * scale }]}
          value={name}
          onChangeText={setName}
          placeholder="Nombre"
          placeholderTextColor={Colors.inputTextColor}
          maxLength={20}
          textAlign="center"
        />
        <Text style={[styles.profileLabel, { fontSize: 23 * scale, marginTop: 18 * scale }]}>Género:</Text>
        <View style={[styles.genderRow, { gap: 34 * scale }]}>
          <GenderButton gender="girl" selected={gender === 'girl'} scale={scale} onPress={() => setGender('girl')} />
          <GenderButton gender="boy" selected={gender === 'boy'} scale={scale} onPress={() => setGender('boy')} />
        </View>
        <TouchableOpacity style={{ marginTop: 22 * scale }} onPress={() => { void handleContinue(); }} accessibilityLabel="Continuar">
          <LinearGradient
            colors={[...Gradients.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.continueButton, { width: 250 * scale, height: 64 * scale, borderRadius: 32 * scale }]}
          >
            <Text style={[styles.continueText, { fontSize: 22 * scale }]}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SettingsBackground>
  );
}

function SettingsBackground({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient colors={['#2D399E', '#273285']} style={styles.background}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {STARS.map((star, index) => (
          <View key={index} style={[styles.star, { left: star.left, top: star.top, width: star.size, height: star.size }]} />
        ))}
      </View>
      {children}
    </LinearGradient>
  );
}

function GenderButton({ gender, selected, scale, onPress }: { gender: Gender; selected: boolean; scale: number; onPress: () => void }) {
  const source = gender === 'boy'
    ? (selected ? require('../assets/onboarding/ic_boy_on.png') : require('../assets/onboarding/ic_boy.png'))
    : (selected ? require('../assets/onboarding/ic_girl_on.png') : require('../assets/onboarding/ic_girl.png'));
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={gender === 'boy' ? 'Niño' : 'Niña'}>
      <Image source={source} style={{ width: 104 * scale, height: 104 * scale }} resizeMode="contain" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, overflow: 'hidden' },
  star: { position: 'absolute', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.55)' },
  gateBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'center', alignItems: 'center' },
  gateCard: { backgroundColor: '#4451B7', borderWidth: 4, borderColor: '#F2F4DD', alignItems: 'center', elevation: 12 },
  gateClose: { position: 'absolute', top: -25, right: -25, backgroundColor: '#F2F4DD', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  gateTitle: { color: Colors.textWhite, fontFamily: Fonts.heading, textAlign: 'center' },
  gateSubtitle: { color: Colors.textWhite, fontFamily: Fonts.body, marginTop: 2 },
  gateChallenge: { color: Colors.textWhite, fontFamily: Fonts.body, marginTop: 2 },
  gateInput: { width: '62%', backgroundColor: Colors.tooltipBackground, marginTop: 16, justifyContent: 'center', alignItems: 'center' },
  gateInputError: { borderWidth: 3, borderColor: Colors.error },
  gateInputText: { color: Colors.textFieldColor, fontFamily: Fonts.heading, letterSpacing: 8 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  key: { backgroundColor: '#22B6DE', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  keyText: { color: Colors.textWhite, fontFamily: Fonts.heading },
  preparingContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  preparingCopy: { alignItems: 'center' },
  preparingTitle: { color: Colors.titleYellow, fontFamily: Fonts.heading, textAlign: 'center' },
  preparingSubtitle: { color: Colors.textWhite, fontFamily: Fonts.body, textAlign: 'center', marginTop: 8 },
  progressTrack: { backgroundColor: '#141C55', overflow: 'hidden', marginTop: 18 },
  progressFill: { height: '100%', backgroundColor: '#F1F1EA' },
  progressText: { color: Colors.textWhite, fontFamily: Fonts.body, marginTop: 5 },
  languageClose: { position: 'absolute', top: 20, left: 20, backgroundColor: Colors.tooltipBackground, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  languageGlobe: { position: 'absolute', left: 0, bottom: 0 },
  languageFox: { position: 'absolute', right: 0, bottom: -10 },
  languageContent: { flex: 1, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  languageTitle: { color: Colors.titleYellow, fontFamily: Fonts.heading, marginBottom: 24 },
  languageRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  radioSelected: { backgroundColor: '#F6B82B', borderWidth: 6, borderColor: '#3242A4' },
  languageLabel: { color: Colors.textWhite, fontFamily: Fonts.heading },
  languageConfirm: { backgroundColor: '#F6A928', justifyContent: 'center', alignItems: 'center', marginTop: 34, elevation: 4 },
  checkmark: { color: Colors.textWhite, fontFamily: Fonts.heading, marginTop: -4 },
  bearImage: { position: 'absolute', left: -20, bottom: -5 },
  foxImage: { position: 'absolute', right: -20, bottom: -5 },
  topButton: { position: 'absolute', top: 22, backgroundColor: '#187AD1', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  topLeft: { left: 22 },
  topRight: { right: 22 },
  profileForm: { flex: 1, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  profileTitle: { color: Colors.titleYellow, fontFamily: Fonts.heading, textAlign: 'center', marginBottom: 12 },
  profileLabel: { color: Colors.textWhite, fontFamily: Fonts.heading, textAlign: 'center', marginBottom: 8 },
  profileInput: { backgroundColor: Colors.tooltipBackground, color: Colors.textFieldColor, fontFamily: Fonts.body, paddingHorizontal: 24 },
  genderRow: { flexDirection: 'row', alignItems: 'center' },
  continueButton: { justifyContent: 'center', alignItems: 'center' },
  continueText: { color: Colors.textWhite, fontFamily: Fonts.heading },
});
