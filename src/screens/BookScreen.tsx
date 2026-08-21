import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player';
import { Colors } from '../theme/colors';
import { useBooks } from '../hooks/useBooks';
import { useBookPages, getBookAudioUri } from '../hooks/useBookPages';
import { useProfile } from '../hooks/useProfile';
import { PageViewer } from '../components/PageViewer';
import { BookMenu } from '../components/BookMenu';
import {
  playBookMusic,
  pauseMusic,
  resumeMusic,
  stopMusic,
  setVolume,
  getVolume,
} from '../services/audioService';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBookById, markAsRead } = useBooks();
  const { profile } = useProfile();
  const book = getBookById(id ?? '');

  const {
    pages,
    isLoading: pagesLoading,
    currentPage,
    setCurrentPage,
    goToPage,
    isLastPage,
    totalPages,
  } = useBookPages(book, profile.gender);

  const [menuVisible, setMenuVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolumeState] = useState(1.0);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Force landscape orientation
  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    lockOrientation();

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  // Keep screen awake
  useEffect(() => {
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  // Fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start();
  }, []);

  // Start music when book is loaded
  useEffect(() => {
    if (book && profile.musicEnabled) {
      const audioUri = getBookAudioUri(book);
      playBookMusic(book.title, audioUri);
      setIsPlaying(true);
    }

    return () => {
      stopMusic();
    };
  }, [book?.id]);

  // Load current volume
  useEffect(() => {
    getVolume().then(setVolumeState);
  }, []);

  // Handle track player events - navigate back when audio ends
  useTrackPlayerEvents([Event.PlaybackQueueEnded], async () => {
    handleGoBack();
  });

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });
    return () => backHandler.remove();
  }, []);

  // Show end screen on last page
  useEffect(() => {
    if (isLastPage && pages.length > 0) {
      setShowEndScreen(true);
      if (book) {
        markAsRead(book.id);
      }
    } else {
      setShowEndScreen(false);
    }
  }, [isLastPage, pages.length]);

  const handleGoBack = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(async () => {
      await stopMusic();
      router.back();
    });
  }, []);

  const handleTogglePlay = useCallback(async () => {
    if (isPlaying) {
      await pauseMusic();
      setIsPlaying(false);
    } else {
      await resumeMusic();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback(async (newVolume: number) => {
    setVolumeState(newVolume);
    await setVolume(newVolume);
  }, []);

  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, []);

  const handlePageSelect = useCallback((pageIndex: number) => {
    goToPage(pageIndex);
  }, []);

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Cuento no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorLink}>Volver a la biblioteca</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Page viewer */}
      {!showEndScreen ? (
        <PageViewer
          pages={pages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          coverColor={book.coverColor}
        />
      ) : (
        /* End screen */
        <View style={[styles.endScreen, { backgroundColor: book.coverColor }]}>
          <Text style={styles.endEmoji}>🌙</Text>
          <Text style={styles.endTitle}>{book.title}</Text>
          <Text style={styles.endCredits}>
            {book.author && `Escrito por: ${book.author}`}
          </Text>
          <Text style={styles.endCredits}>
            {book.illustrator && `Ilustrado por: ${book.illustrator}`}
          </Text>
          <Text style={styles.endMessage}>~ Fin ~</Text>

          <TouchableOpacity
            style={styles.endButton}
            onPress={handleGoBack}
            accessibilityLabel="Volver a la biblioteca"
          >
            <LinearGradient
              colors={[Colors.buttonGreenStart, Colors.buttonGreenEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.endButtonGradient}
            >
              <Text style={styles.endButtonText}>Volver a la biblioteca</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu toggle button (hamburger) */}
      {!showEndScreen && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          accessibilityLabel="Abrir menú"
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      )}

      {/* Overlay menu */}
      <BookMenu
        visible={menuVisible}
        isPlaying={isPlaying}
        volume={volume}
        pages={pages}
        currentPage={currentPage}
        bookTitle={book.title}
        onClose={() => setMenuVisible(false)}
        onGoBack={handleGoBack}
        onTogglePlay={handleTogglePlay}
        onVolumeChange={handleVolumeChange}
        onPageSelect={handlePageSelect}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  menuButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  menuIcon: {
    color: Colors.textWhite,
    fontSize: 24,
  },
  endScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  endEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  endTitle: {
    color: Colors.textWhite,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  endCredits: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  endMessage: {
    color: Colors.titleGold,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 32,
  },
  endButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  endButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  endButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
  },
  errorText: {
    color: Colors.textWhite,
    fontSize: 18,
    marginBottom: 16,
  },
  errorLink: {
    color: Colors.chipBlue,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
