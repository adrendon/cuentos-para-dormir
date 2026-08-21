export interface BookAdditionalInfo {
  commonPages: number[];
  imageType: string;
  numberOfPages: number;
  resolution: string;
}

export interface BookTexts {
  title: string;
  author: string;
  illustrator: string;
  description: string;
}

export interface Book {
  id: string;
  folderName: string;
  title: string;
  author: string;
  illustrator: string;
  description: string;
  coverColor: string;
  numberOfPages: number;
  imageType: string;
  resolution: string;
  commonPages: number[];
  hasVoicework: boolean;
  isRead: boolean;
  isFavorite: boolean;
  isDownloaded: boolean;
  isEmbedded: boolean;
}

export interface BookPage {
  pageNumber: number;
  uri: string;
}

export type Gender = 'boy' | 'girl';

export interface UserProfile {
  name: string;
  gender: Gender;
  avatar: string;
  musicEnabled: boolean;
  hasCompletedOnboarding: boolean;
}

export type FilterType = 'all' | 'favorites' | 'unread';

export interface VoiceworkInfo {
  language: string;
  narrator: string;
  totalFiles: number;
}

// Navigation params
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Library: undefined;
  Book: { bookId: string };
  Settings: undefined;
};

// Animal avatars available for selection
export const AVAILABLE_AVATARS = [
  'bear',
  'bunny',
  'cat',
  'dog',
  'elephant',
  'fox',
  'giraffe',
  'koala',
  'lion',
  'owl',
  'panda',
  'penguin',
] as const;

export type AvatarType = (typeof AVAILABLE_AVATARS)[number];
