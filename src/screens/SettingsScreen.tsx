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
  left: (index * 37) % 97,
  top: (index * 53) % 94,
  size: 1 + (index % 3),
}));

export default function SettingsScreen() {
  const router = useRouter();
  const { destination = 'profile' } = useLocalSearchParams<{ destination?: 'profile' | 'mail' }>();
  const { width, height } = useWindowDimensions();
  const horizontalScale = Math.max(0.68, Math.min(1.45, width / 904));
  const verticalScale = Math.max(0.62, Math.min(1.35, height / 407));
  const scale = Math.max(0.66, Math.min(1.25, Math.min(horizontalScale, verticalScale)));
  const mascotHeight = Math.min(height * 0.74, 430 * verticalScale);
  const mascotWidth = Math.min(width * 0.255, mascotHeight * 0.72);
  const formWidth = Math.min(width * 0.40, 500 * horizontalScale);
  const inputWidth = Math.min(width * 0.295, 430 * horizontalScale);
  const { profile, toggleMusic, updateLanguage, saveProfile } = useProfile();
  const [view, setView] = useState<SettingsView>('gate');
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [musicEnabled, setMusicEnabled] = useState(profile.musicEnabled);
  const [gateValue, setGateValue] = useState('');
  const [gateError, setGateError] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const [loadingPercent, setLoadingPercent] = useState(0);
  const challenge = useMemo(() => Array.from({ length: 3 }, () => String(Math.floor(Math.random() * 10))), []);

  useEffect(() => { void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE); }, []);
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
    return () => { progress.removeListener(listener); clearTimeout(finish); };
  }, [view, progress, router]);

  const handleGateKey = (key: string) => {
    if (!key) return;
    setGateError(false);
    if (key === '⌫') { setGateValue((current) => current.slice(0, -1)); return; }
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
              void Linking.openURL(url).catch(() => Alert.alert('Correo no configurado', 'Configura una aplicación de correo o escribe a abc@diveomedia.com.'));
            }, 220);
          }, 120);
        } else setTimeout(() => setView('profile'), 120);
      } else {
        setGateError(true);
        setTimeout(() => setGateValue(''), 450);
      }
    }
  };

  const handleMusicToggle = () => { setMusicEnabled((current) => !current); void toggleMusic(); };
  const handleContinue = async () => {
    const nextName = name.trim() || profile.name;
    const hasPersonalizationChange = nextName !== profile.name || gender !== profile.gender;
    await saveProfile({ ...profile, name: nextName, gender, language: 'es' });
    if (hasPersonalizationChange) setView('preparing'); else router.back();
  };

  if (view === 'gate') {
    const gateScale = Math.max(0.66, Math.min(scale, height / 430));
    return (
      <View style={styles.gateBackdrop}>
        <View style={[styles.gateCard, { width: Math.min(width * 0.48, 510 * horizontalScale), borderRadius: 26 * gateScale, paddingHorizontal: 24 * gateScale, paddingVertical: 18 * gateScale }]}>
          <TouchableOpacity style={[styles.gateClose, { width: 52 * gateScale, height: 52 * gateScale, borderRadius: 26 * gateScale }]} onPress={() => router.back()} accessibilityLabel="Cerrar">
            <Image source={require('../assets/ui/ic_close.png')} style={{ width: 28 * gateScale, height: 28 * gateScale }} />
          </TouchableOpacity>
          <Text style={[styles.gateTitle, { fontSize: 28 * gateScale }]}>Para mamá y papá</Text>
          <Text style={[styles.gateSubtitle, { fontSize: 17 * gateScale }]}>Escribe los números:</Text>
          <Text style={[styles.gateChallenge, { fontSize: 18 * gateScale }]}>{challenge.map((value) => NUMBER_WORDS[Number(value)]).join(', ')}</Text>
          <View style={[styles.gateInput, gateError && styles.gateInputError, { height: 46 * gateScale, borderRadius: 23 * gateScale }]}>
            <Text style={[styles.gateInputText, { fontSize: 23 * gateScale }]}>{'•'.repeat(gateValue.length)}</Text>
          </View>
          <View style={[styles.keypad, { width: 246 * gateScale, gap: 8 * gateScale, marginTop: 12 * gateScale }]}>
            {KEYS.map((key, index) => key ? (
              <TouchableOpacity key={`${key}-${index}`} style={[styles.key, { width: 72 * gateScale, height: 48 * gateScale, borderRadius: 24 * gateScale }]} onPress={() => handleGateKey(key)} accessibilityLabel={key === '⌫' ? 'Borrar' : key}>
                <Text style={[styles.keyText, { fontSize: 24 * gateScale }]}>{key}</Text>
              </TouchableOpacity>
            ) : <View key={`empty-${index}`} style={{ width: 72 * gateScale, height: 48 * gateScale }} />)}
          </View>
        </View>
      </View>
    );
  }

  if (view === 'preparing') {
    return (
      <SettingsBackground>
        <View style={styles.preparingContent}>
          <View style={[styles.preparingCopy, { width: Math.min(width * 0.62, 620 * horizontalScale) }]}>
            <Text style={[styles.preparingTitle, { fontSize: 38 * scale }]}>Estamos preparando nuevos cuentos para ti</Text>
            <Text style={[styles.preparingSubtitle, { fontSize: 24 * scale }]}>Estamos personalizando las imágenes y los textos…</Text>
            <View style={[styles.progressTrack, { width: Math.min(width * 0.44, 430 * horizontalScale), height: 11 * verticalScale, borderRadius: 6 * scale }]}>
              <Animated.View style={[styles.progressFill, { borderRadius: 6 * scale, width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
            <Text style={[styles.progressText, { fontSize: 16 * scale }]}>{loadingPercent}%</Text>
          </View>
          <Image source={require('../assets/onboarding/loading_mascot.webp')} style={{ width: 300 * horizontalScale, height: 280 * verticalScale }} resizeMode="contain" />
        </View>
      </SettingsBackground>
    );
  }

  if (view === 'language') {
    return (
      <SettingsBackground>
        <TouchableOpacity style={[styles.languageClose, { width: 58 * scale, height: 58 * scale, borderRadius: 29 * scale }]} onPress={() => setView('profile')} accessibilityLabel="Cerrar idioma">
          <Image source={require('../assets/ui/ic_close.png')} style={{ width: 31 * scale, height: 31 * scale }} />
        </TouchableOpacity>
        <Image source={require('../assets/onboarding/ic_globe.webp')} style={[styles.languageGlobe, { width: Math.min(width * 0.25, 280 * horizontalScale), height: Math.min(height * 0.78, 330 * verticalScale) }]} resizeMode="contain" />
        <Image source={require('../assets/settings/fox.webp')} style={[styles.languageFox, { width: Math.min(width * 0.25, 280 * horizontalScale), height: Math.min(height * 0.78, 350 * verticalScale) }]} resizeMode="contain" />
        <View style={[styles.languageContent, { width: Math.min(width * 0.40, 410 * horizontalScale) }]}>
          <Text style={[styles.languageTitle, { fontSize: 36 * scale }]}>Idioma</Text>
          <TouchableOpacity style={styles.languageRow} onPress={() => {}} accessibilityRole="radio" accessibilityState={{ selected: true }}>
            <View style={[styles.radioSelected, { width: 34 * scale, height: 34 * scale, borderRadius: 17 * scale }]} />
            <Text style={[styles.languageLabel, { fontSize: 22 * scale }]}>Español</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.languageConfirm, { width: 78 * scale, height: 78 * scale, borderRadius: 39 * scale }]} onPress={async () => { await updateLanguage('es'); setView('profile'); }} accessibilityLabel="Confirmar español">
            <Text style={[styles.checkmark, { fontSize: 46 * scale }]}>✓</Text>
          </TouchableOpacity>
        </View>
      </SettingsBackground>
    );
  }

  const genderSize = Math.min(height * 0.14, 92 * scale);
  return (
    <SettingsBackground>
      <Image source={require('../assets/settings/bear.webp')} style={[styles.bearImage, { width: mascotWidth, height: mascotHeight }]} resizeMode="contain" />
      <Image source={require('../assets/settings/fox.webp')} style={[styles.foxImage, { width: mascotWidth, height: mascotHeight }]} resizeMode="contain" />

      <TouchableOpacity style={[styles.topButton, { top: 20 * verticalScale, left: 20 * horizontalScale, width: 62 * scale, height: 62 * scale, borderRadius: 31 * scale }]} onPress={() => setView('language')} accessibilityLabel="Idioma">
        <Image source={require('../assets/ui/ic_settings_language.png')} style={{ width: 35 * scale, height: 35 * scale }} resizeMode="contain" />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.topButton, { top: 20 * verticalScale, right: 20 * horizontalScale, width: 62 * scale, height: 62 * scale, borderRadius: 31 * scale }]} onPress={handleMusicToggle} accessibilityLabel="Música">
        <Image source={musicEnabled ? require('../assets/onboarding/ic_music_on.png') : require('../assets/onboarding/ic_music_off.png')} style={{ width: 32 * scale, height: 32 * scale }} resizeMode="contain" />
      </TouchableOpacity>

      <View style={[styles.profileForm, { width: formWidth }]}>
        <Text style={[styles.profileTitle, { fontSize: Math.min(45, 36 * scale), marginBottom: 9 * verticalScale }]}>Historias sobre tus hijos</Text>
        <Text style={[styles.profileLabel, { fontSize: Math.min(25, 21 * scale), marginBottom: 7 * verticalScale }]}>Nombre del niño/niña:</Text>
        <TextInput
          style={[styles.profileInput, { width: inputWidth, height: Math.min(height * 0.11, 62 * verticalScale), borderRadius: 31 * scale, fontSize: Math.min(24, 21 * scale) }]}
          value={name}
          onChangeText={setName}
          placeholder="Nombre"
          placeholderTextColor={Colors.inputTextColor}
          maxLength={20}
          multiline={false}
          numberOfLines={1}
          scrollEnabled={false}
          textAlign="center"
          textAlignVertical="center"
        />
        <Text style={[styles.profileLabel, { fontSize: Math.min(25, 21 * scale), marginTop: 12 * verticalScale, marginBottom: 2 * verticalScale }]}>Género:</Text>
        <View style={[styles.genderRow, { gap: Math.min(width * 0.045, 46 * horizontalScale) }]}>
          <GenderButton gender="girl" selected={gender === 'girl'} size={genderSize} onPress={() => setGender('girl')} />
          <GenderButton gender="boy" selected={gender === 'boy'} size={genderSize} onPress={() => setGender('boy')} />
        </View>
        <TouchableOpacity style={{ marginTop: 10 * verticalScale }} onPress={() => { void handleContinue(); }} accessibilityLabel="Continuar">
          <LinearGradient colors={[...Gradients.orange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.continueButton, { width: Math.min(width * 0.19, 245 * horizontalScale), height: Math.min(height * 0.09, 58 * verticalScale), borderRadius: 29 * scale }]}>
            <Text style={[styles.continueText, { fontSize: Math.min(23, 20 * scale) }]}>Continuar</Text>
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
        {STARS.map((star, index) => <View key={index} style={[styles.star, { left: `${star.left}%`, top: `${star.top}%`, width: star.size, height: star.size }]} />)}
      </View>
      {children}
    </LinearGradient>
  );
}

function GenderButton({ gender, selected, size, onPress }: { gender: Gender; selected: boolean; size: number; onPress: () => void }) {
  const source = gender === 'boy'
    ? (selected ? require('../assets/onboarding/ic_boy_on.png') : require('../assets/onboarding/ic_boy.png'))
    : (selected ? require('../assets/onboarding/ic_girl_on.png') : require('../assets/onboarding/ic_girl.png'));
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={gender === 'boy' ? 'Niño' : 'Niña'}>
      <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, overflow: 'hidden' },
  star: { position: 'absolute', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.32)' },
  gateBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'center', alignItems: 'center' },
  gateCard: { backgroundColor: '#4451B7', borderWidth: 4, borderColor: '#F2F4DD', alignItems: 'center', elevation: 12 },
  gateClose: { position: 'absolute', top: -23, right: -23, backgroundColor: '#F2F4DD', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  gateTitle: { color: Colors.textWhite, fontFamily: Fonts.heading, textAlign: 'center' },
  gateSubtitle: { color: Colors.textWhite, fontFamily: Fonts.body, marginTop: 2 },
  gateChallenge: { color: Colors.textWhite, fontFamily: Fonts.body, marginTop: 2 },
  gateInput: { width: '62%', backgroundColor: Colors.tooltipBackground, marginTop: 12, justifyContent: 'center', alignItems: 'center' },
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
  languageTitle: { color: Colors.titleYellow, fontFamily: Fonts.heading, marginBottom: 22 },
  languageRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  radioSelected: { backgroundColor: '#F6B82B', borderWidth: 5, borderColor: '#3242A4' },
  languageLabel: { color: Colors.textWhite, fontFamily: Fonts.heading },
  languageConfirm: { backgroundColor: '#F6A928', justifyContent: 'center', alignItems: 'center', marginTop: 28, elevation: 4 },
  checkmark: { color: Colors.textWhite, fontFamily: Fonts.heading, marginTop: -4 },
  bearImage: { position: 'absolute', left: -8, bottom: -5 },
  foxImage: { position: 'absolute', right: -8, bottom: -5 },
  topButton: { position: 'absolute', backgroundColor: '#187AD1', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  profileForm: { flex: 1, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  profileTitle: { color: Colors.titleYellow, fontFamily: Fonts.heading, textAlign: 'center' },
  profileLabel: { color: Colors.textWhite, fontFamily: Fonts.heading, textAlign: 'center' },
  profileInput: { backgroundColor: Colors.tooltipBackground, color: Colors.textFieldColor, fontFamily: Fonts.body, paddingHorizontal: 20, paddingVertical: 0, includeFontPadding: false },
  genderRow: { flexDirection: 'row', alignItems: 'center' },
  continueButton: { justifyContent: 'center', alignItems: 'center' },
  continueText: { color: Colors.textWhite, fontFamily: Fonts.heading },
});
