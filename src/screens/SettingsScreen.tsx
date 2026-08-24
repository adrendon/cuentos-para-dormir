import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors, Gradients, Fonts } from '../theme/colors';
import { useProfile } from '../hooks/useProfile';
import { GenderSelector } from '../components/GenderSelector';
import { Gender } from '../types/book';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, toggleMusic, saveProfile } = useProfile();

  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [musicEnabled, setMusicEnabled] = useState(profile.musicEnabled);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  // Sync local state when profile loads from AsyncStorage
  useEffect(() => {
    setName(profile.name);
    setGender(profile.gender);
    setMusicEnabled(profile.musicEnabled);
  }, [profile.name, profile.gender, profile.musicEnabled]);

  const handleGenderChange = (g: Gender) => {
    setGender(g);
  };

  const handleMusicToggle = () => {
    setMusicEnabled((prev) => !prev);
    toggleMusic();
  };

  const handleContinue = async () => {
    await saveProfile({
      ...profile,
      name: name.trim() || profile.name,
      gender,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Star dots background decorations */}
      <View style={styles.starField}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${(i * 37) % 100}%` as unknown as number,
                top: `${(i * 53) % 100}%` as unknown as number,
                opacity: 0.3 + (i % 5) * 0.15,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
              },
            ]}
          />
        ))}
      </View>

      {/* Bear character - LEFT side */}
      <Image
        source={require('../assets/settings/bear.webp')}
        style={styles.bearImage}
        resizeMode="contain"
      />

      {/* Fox character - RIGHT side */}
      <Image
        source={require('../assets/settings/fox.webp')}
        style={styles.foxImage}
        resizeMode="contain"
      />

      {/* Top-left: Globe/Language icon */}
      <TouchableOpacity
        style={styles.topLeftButton}
        accessibilityLabel="Cambiar idioma"
      >
        <Image
          source={require('../assets/ui/ic_settings_language.png')}
          style={styles.topIconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Top-right: Music icon */}
      <TouchableOpacity
        style={styles.topRightButton}
        onPress={handleMusicToggle}
        accessibilityLabel="Activar o desactivar música"
      >
        <Image
          source={
            musicEnabled
              ? require('../assets/onboarding/ic_music_on.png')
              : require('../assets/onboarding/ic_music_off.png')
          }
          style={styles.topIconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Historias sobre tus hijos</Text>

      {/* Center form area */}
      <View style={styles.formContainer}>
        {/* Name field */}
        <Text style={styles.label}>Nombre del niño/niña:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre"
          placeholderTextColor={Colors.inputTextColor}
          maxLength={20}
        />

        {/* Gender selector */}
        <Text style={styles.label}>Género:</Text>
        <GenderSelector
          selected={gender}
          onSelect={handleGenderChange}
        />

        {/* Continuar button */}
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButtonWrapper}
          accessibilityLabel="Continuar"
        >
          <LinearGradient
            colors={[...Gradients.orange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  starField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: Colors.textWhite,
  },
  bearImage: {
    position: 'absolute',
    left: -20,
    bottom: 0,
    width: 220,
    height: 320,
    zIndex: 2,
  },
  foxImage: {
    position: 'absolute',
    right: -20,
    bottom: 0,
    width: 220,
    height: 320,
    zIndex: 2,
  },
  topLeftButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(54, 192, 237, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  topRightButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(54, 192, 237, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  topIconImage: {
    width: 28,
    height: 28,
  },
  title: {
    color: Colors.titleYellow,
    fontSize: 26,
    fontFamily: Fonts.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 18,
    zIndex: 5,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 80,
    zIndex: 5,
    marginTop: -10,
  },
  label: {
    color: Colors.textWhite,
    fontSize: 15,
    fontFamily: Fonts.body,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    width: 260,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.textFieldBackground,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textFieldColor,
    fontFamily: Fonts.body,
    textAlign: 'center',
    marginBottom: 8,
  },
  continueButtonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 16,
    width: 200,
  },
  continueButton: {
    height: 46,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontFamily: Fonts.heading,
    fontWeight: '800',
  },
});
