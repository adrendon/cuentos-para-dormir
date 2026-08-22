import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Gender, AvatarType, OnboardingGoal, StoryPreference } from '../types/book';

const PROFILE_KEY = '@cuentos_profile';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  gender: 'boy',
  avatar: 'bear',
  musicEnabled: true,
  hasCompletedOnboarding: false,
  language: 'es',
  goals: [],
  preferences: [],
  notificationsEnabled: false,
};

/**
 * Hook to manage the child's profile stored in AsyncStorage.
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from storage on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        setProfile(parsed);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = useCallback(async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, []);

  const updateName = useCallback(
    async (name: string) => {
      const updated = { ...profile, name };
      await saveProfile(updated);
    },
    [profile, saveProfile]
  );

  const updateGender = useCallback(
    async (gender: Gender) => {
      const updated = { ...profile, gender };
      await saveProfile(updated);
    },
    [profile, saveProfile]
  );

  const updateAvatar = useCallback(
    async (avatar: AvatarType | string) => {
      const updated = { ...profile, avatar };
      await saveProfile(updated);
    },
    [profile, saveProfile]
  );

  const toggleMusic = useCallback(async () => {
    const updated = { ...profile, musicEnabled: !profile.musicEnabled };
    await saveProfile(updated);
  }, [profile, saveProfile]);

  const updateLanguage = useCallback(
    async (language: string) => {
      const updated = { ...profile, language };
      await saveProfile(updated);
    },
    [profile, saveProfile]
  );

  const updateGoals = useCallback(
    async (goals: OnboardingGoal[]) => {
      const updated = { ...profile, goals };
      await saveProfile(updated);
    },
    [profile, saveProfile]
  );

  const updatePreferences = useCallback(
    async (preferences: StoryPreference[]) => {
      const updated = { ...profile, preferences };
      await saveProfile(updated);
    },
    [profile, saveProfile]
  );

  const updateNotificationsEnabled = useCallback(
    async (notificationsEnabled: boolean) => {
      const updated = { ...profile, notificationsEnabled };
      await saveProfile(updated);
    },
    [profile, saveProfile]
  );

  const completeOnboarding = useCallback(async () => {
    const updated = { ...profile, hasCompletedOnboarding: true };
    await saveProfile(updated);
  }, [profile, saveProfile]);

  const resetProfile = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);
      setProfile(DEFAULT_PROFILE);
    } catch (error) {
      console.error('Error resetting profile:', error);
    }
  }, []);

  return {
    profile,
    isLoading,
    updateName,
    updateGender,
    updateAvatar,
    toggleMusic,
    updateLanguage,
    updateGoals,
    updatePreferences,
    updateNotificationsEnabled,
    completeOnboarding,
    saveProfile,
    resetProfile,
  };
}
