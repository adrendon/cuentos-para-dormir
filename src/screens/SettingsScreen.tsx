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
  size: 1 + (index % 2),
}));

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function SettingsScreen() {
  const router = useRouter();
  const { destination = 'profile' } = useLocalSearchParams<{ destination?: 'profile' | 'mail' }>();
  const { width, height } = useWindowDimensions();

  const uiScale = clamp(height / 407, 0.78, 1.08);
  const sideScale = clamp(height / 407, 0.82, 1.12);
  const mascotHeight = Math.min(height * 0.60, 260 * sideScale);
  const mascotWidth = mascotHeight * 0.78;
  const formWidth = Math.min(width * 0.39, 460 * uiScale);
  const inputWidth = Math.min(width * 0.31, 360 * uiScale);

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
  const viewEntrance = useRef(new Animated.Value(0)).current;

  useEffect(() => { void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE); }, []);
  useEffect(() => {
    setName(profile.name);
    setGender(profile.gender);
    setMusicEnabled(profile.musicEnabled);
  }, [profile.name, profile.gender, profile.musicEnabled]);

  useEffect(() => {
    viewEntrance.setValue(0);
    Animated.timing(viewEntrance, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [view, viewEntrance]);

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

  const fadeStyle = {
    opacity: viewEntrance,
  };
  const riseStyle = {
    opacity: viewEntrance,
    transform: [{ translateY: viewEntrance.interpolate({ inputRange: [0, 1], outputRange: [24 * uiScale, 0] }) }],
  };
  const topStyle = {
    opacity: viewEntrance,
    transform: [{ translateY: viewEntrance.interpolate({ inputRange: [0, 1], outputRange: [-18 * uiScale, 0] }) }],
  };
  const leftStyle = {
    opacity: viewEntrance,
    transform: [{ translateX: viewEntrance.interpolate({ inputRange: [0, 1], outputRange: [-56 * uiScale, 0] }) }],
  };
  const rightStyle = {
    opacity: viewEntrance,
    transform: [{ translateX: viewEntrance.interpolate({ inputRange: [0, 1], outputRange: [56 * uiScale, 0] }) }],
  };

  if (view === 'gate') {
    const gateScale = clamp(height / 560, 0.72, 1);
    const keyWidth = 68 * gateScale;
    const keyHeight = 48 * gateScale;
    return (
      <View style={styles.gateBackdrop}>
        <Animated.View style={[styles.gateCard, {
          width: Math.min(width * 0.50, 500),
          maxHeight: height * 0.92,
          borderRadius: 24 * gateScale,
          paddingHorizontal: 22 * gateScale,
          paddingTop: 18 * gateScale,
          paddingBottom: 14 * gateScale,
          opacity: viewEntrance,
          transform: [
            { translateY: viewEntrance.interpolate({ inputRange: [0, 1], outputRange: [26 * gateScale, 0] }) },
            { scale: viewEntrance.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
        }]}>
          <TouchableOpacity style={[styles.gateClose, { width: 46 * gateScale, height: 46 * gateScale, borderRadius: 23 * gateScale, top: -18 * gateScale, right: -18 * gateScale }]} onPress={() => router.back()} accessibilityLabel="Cerrar">
            <Image source={require('../assets/ui/ic_close.png')} style={{ width: 24 * gateScale, height: 24 * gateScale }} />
          </TouchableOpacity>
          <Text style={[styles.gateTitle, { fontSize: 25 * gateScale, lineHeight: 29 * gateScale }]}>Para mamá y papá</Text>
          <Text style={[styles.gateSubtitle, { fontSize: 15 * gateScale, marginTop: 2 * gateScale }]}>Escribe los números:</Text>
          <Text style={[styles.gateChallenge, { fontSize: 17 * gateScale, lineHeight: 21 * gateScale }]}>{challenge.map((value) => NUMBER_WORDS[Number(value)]).join(', ')}</Text>
          <View style={[styles.gateInput, gateError && styles.gateInputError, { width: '66%', height: 42 * gateScale, borderRadius: 21 * gateScale, marginTop: 9 * gateScale }]}>
            <Text style={[styles.gateInputText, { fontSize: 21 * gateScale }]}>{'•'.repeat(gateValue.length)}</Text>
          </View>
          <View style={[styles.keypad, { width: keyWidth * 3 + 16 * gateScale, gap: 8 * gateScale, marginTop: 10 * gateScale }]}>
            {KEYS.map((key, index) => key ? (
              <TouchableOpacity key={`${key}-${index}`} style={[styles.key, { width: keyWidth, height: keyHeight, borderRadius: 24 * gateScale }]} onPress={() => handleGateKey(key)} accessibilityLabel={key === '⌫' ? 'Borrar' : key}>
                <Text style={[styles.keyText, { fontSize: 22 * gateScale }]}>{key}</Text>
              </TouchableOpacity>
            ) : <View key={`empty-${index}`} style={{ width: keyWidth, height: keyHeight }} />)}
          </View>
        </Animated.View>
      </View>
    );
  }

  if (view === 'preparing') {
    return (
      <SettingsBackground>
        <Animated.View style={[styles.preparingContent, riseStyle]}>
          <View style={[styles.preparingCopy, { width: Math.min(width * 0.58, 560 * uiScale) }]}>
            <Text style={[styles.preparingTitle, { fontSize: 30 * uiScale }]}>Estamos preparando nuevos cuentos para ti</Text>
            <Text style={[styles.preparingSubtitle, { fontSize: 18 * uiScale }]}>Estamos personalizando las imágenes y los textos…</Text>
            <View style={[styles.progressTrack, { width: Math.min(width * 0.40, 390 * uiScale), height: 10 * uiScale, borderRadius: 5 * uiScale }]}>
              <Animated.View style={[styles.progressFill, { borderRadius: 5 * uiScale, width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
            <Text style={[styles.progressText, { fontSize: 14 * uiScale }]}>{loadingPercent}%</Text>
          </View>
          <Image source={require('../assets/onboarding/loading_mascot.webp')} style={{ width: 250 * uiScale, height: 235 * uiScale }} resizeMode="contain" />
        </Animated.View>
      </SettingsBackground>
    );
  }

  if (view === 'language') {
    return (
      <SettingsBackground>
        <Animated.View style={topStyle}>
          <TouchableOpacity style={[styles.languageClose, { width: 52 * uiScale, height: 52 * uiScale, borderRadius: 26 * uiScale }]} onPress={() => setView('profile')} accessibilityLabel="Cerrar idioma">
            <Image source={require('../assets/ui/ic_close.png')} style={{ width: 28 * uiScale, height: 28 * uiScale }} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.Image source={require('../assets/onboarding/ic_globe.webp')} style={[styles.languageGlobe, { width: 235 * uiScale, height: 285 * uiScale }, leftStyle]} resizeMode="contain" />
        <Animated.Image source={require('../assets/settings/fox.webp')} style={[styles.languageFox, { width: 235 * uiScale, height: 300 * uiScale }, rightStyle]} resizeMode="contain" />
        <Animated.View style={[styles.languageContent, { width: Math.min(width * 0.38, 380 * uiScale) }, riseStyle]}>
          <Text style={[styles.languageTitle, { fontSize: 31 * uiScale }]}>Idioma</Text>
          <TouchableOpacity style={styles.languageRow} onPress={() => {}} accessibilityRole="radio" accessibilityState={{ selected: true }}>
            <View style={[styles.radioSelected, { width: 30 * uiScale, height: 30 * uiScale, borderRadius: 15 * uiScale }]} />
            <Text style={[styles.languageLabel, { fontSize: 20 * uiScale }]}>Español</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.languageConfirm, { width: 68 * uiScale, height: 68 * uiScale, borderRadius: 34 * uiScale }]} onPress={async () => { await updateLanguage('es'); setView('profile'); }} accessibilityLabel="Confirmar español">
            <Text style={[styles.checkmark, { fontSize: 40 * uiScale }]}>✓</Text>
          </TouchableOpacity>
        </Animated.View>
      </SettingsBackground>
    );
  }

  const genderSize = 72 * uiScale;
  const topButtonSize = 54 * uiScale;
  return (
    <SettingsBackground>
      <Animated.Image source={require('../assets/settings/bear.webp')} style={[styles.bearImage, { width: mascotWidth, height: mascotHeight }, leftStyle]} resizeMode="contain" />
      <Animated.Image source={require('../assets/settings/fox.webp')} style={[styles.foxImage, { width: mascotWidth, height: mascotHeight }, rightStyle]} resizeMode="contain" />

      <Animated.View style={topStyle}>
        <TouchableOpacity style={[styles.topButton, { top: 18 * uiScale, left: 18 * uiScale, width: topButtonSize, height: topButtonSize, borderRadius: topButtonSize / 2 }]} onPress={() => setView('language')} accessibilityLabel="Idioma">
          <Image source={require('../assets/ui/ic_settings_language.png')} style={{ width: 30 * uiScale, height: 30 * uiScale }} resizeMode="contain" />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={topStyle}>
        <TouchableOpacity style={[styles.topButton, { top: 18 * uiScale, right: 18 * uiScale, width: topButtonSize, height: topButtonSize, borderRadius: topButtonSize / 2 }]} onPress={handleMusicToggle} accessibilityLabel="Música">
          <Image source={musicEnabled ? require('../assets/onboarding/ic_music_on.png') : require('../assets/onboarding/ic_music_off.png')} style={{ width: 28 * uiScale, height: 28 * uiScale }} resizeMode="contain" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.profileForm, { width: formWidth }, riseStyle]}>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={[styles.profileTitle, { fontSize: 31 * uiScale, lineHeight: 34 * uiScale, marginBottom: 8 * uiScale }]}>Historias sobre tus hijos</Text>
        <Text style={[styles.profileLabel, { fontSize: 18 * uiScale, marginBottom: 6 * uiScale }]}>Nombre del niño/niña:</Text>
        <TextInput
          style={[styles.profileInput, { width: inputWidth, height: 48 * uiScale, borderRadius: 24 * uiScale, fontSize: 18 * uiScale }]}
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
        <Text style={[styles.profileLabel, { fontSize: 18 * uiScale, marginTop: 10 * uiScale, marginBottom: 1 * uiScale }]}>Género:</Text>
        <View style={[styles.genderRow, { gap: 38 * uiScale }]}>
          <GenderButton gender="boy" selected={gender === 'boy'} size={genderSize} onPress={() => setGender('boy')} />
          <GenderButton gender="girl" selected={gender === 'girl'} size={genderSize} onPress={() => setGender('girl')} />
        </View>
        <TouchableOpacity style={{ marginTop: 7 * uiScale }} onPress={() => { void handleContinue(); }} accessibilityLabel="Continuar">
          <LinearGradient colors={[...Gradients.orange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.continueButton, { width: 220 * uiScale, height: 46 * uiScale, borderRadius: 23 * uiScale }]}>
            <Text style={[styles.continueText, { fontSize: 18 * uiScale }]}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
  star: { position: 'absolute', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)' },
  gateBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'center', alignItems: 'center' },
  gateCard: { backgroundColor: '#4451B7', borderWidth: 4, borderColor: '#F2F4DD', alignItems: 'center', elevation: 12 },
  gateClose: { position: 'absolute', backgroundColor: '#F2F4DD', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  gateTitle: { color: Colors.textWhite, fontFamily: Fonts.heading, textAlign: 'center' },
  gateSubtitle: { color: Colors.textWhite, fontFamily: Fonts.body },
  gateChallenge: { color: Colors.textWhite, fontFamily: Fonts.body, marginTop: 2 },
  gateInput: { backgroundColor: Colors.tooltipBackground, justifyContent: 'center', alignItems: 'center' },
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
  bearImage: { position: 'absolute', left: '-2.5%', bottom: 0 },
  foxImage: { position: 'absolute', right: 0, bottom: 0 },
  topButton: { position: 'absolute', backgroundColor: '#187AD1', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  profileForm: { flex: 1, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  profileTitle: { color: Colors.titleYellow, fontFamily: Fonts.heading, textAlign: 'center' },
  profileLabel: { color: Colors.textWhite, fontFamily: Fonts.heading, textAlign: 'center' },
  profileInput: { backgroundColor: Colors.tooltipBackground, color: Colors.textFieldColor, fontFamily: Fonts.body, paddingHorizontal: 20, paddingVertical: 0, includeFontPadding: false },
  genderRow: { flexDirection: 'row', alignItems: 'center' },
  continueButton: { justifyContent: 'center', alignItems: 'center' },
  continueText: { color: Colors.textWhite, fontFamily: Fonts.heading },
});
