import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Gradients } from '../theme/colors';
import { useProfile } from '../hooks/useProfile';
import { GenderSelector } from '../components/GenderSelector';
import { AnimalSelector } from '../components/AnimalSelector';
import { Gender } from '../types/book';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    profile,
    updateName,
    updateGender,
    updateAvatar,
    toggleMusic,
  } = useProfile();

  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNameChange = (text: string) => {
    setName(text);
    setHasChanges(true);
  };

  const handleGenderChange = (g: Gender) => {
    setGender(g);
    setHasChanges(true);
  };

  const handleAvatarChange = (a: string) => {
    setAvatar(a);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (name.trim().length > 0) {
      await updateName(name.trim());
    }
    await updateGender(gender);
    await updateAvatar(avatar);
    setHasChanges(false);
  };

  const handleBack = () => {
    if (hasChanges) {
      handleSave().then(() => router.back());
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...Gradients.background]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel="Volver a la biblioteca"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajustes</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Name section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={handleNameChange}
              placeholder="Escribe tu nombre..."
              placeholderTextColor={Colors.subtitleGray}
              maxLength={20}
            />
          </View>

          {/* Gender section */}
          <View style={styles.section}>
            <GenderSelector selected={gender} onSelect={handleGenderChange} />
          </View>

          {/* Avatar section */}
          <View style={styles.section}>
            <AnimalSelector selected={avatar} onSelect={handleAvatarChange} />
          </View>

          {/* Music toggle */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.sectionTitle}>Música de fondo</Text>
                <Text style={styles.toggleDescription}>
                  Reproduce música mientras lees los cuentos
                </Text>
              </View>
              <Switch
                value={profile.musicEnabled}
                onValueChange={toggleMusic}
                trackColor={{
                  false: 'rgba(255,255,255,0.2)',
                  true: Colors.buttonGreenEnd,
                }}
                thumbColor={Colors.textWhite}
              />
            </View>
          </View>

          {/* Save button */}
          {hasChanges && (
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButtonWrapper}
              accessibilityLabel="Guardar cambios"
            >
              <LinearGradient
                colors={[...Gradients.primaryButton]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: Colors.textWhite,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: Colors.titleGold,
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    fontSize: 17,
    color: Colors.textWhite,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 16,
  },
  toggleDescription: {
    color: Colors.subtitleGray,
    fontSize: 12,
    marginTop: 2,
  },
  saveButtonWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveButton: {
    height: 52,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});
