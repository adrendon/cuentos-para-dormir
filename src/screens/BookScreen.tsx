import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  BackHandler,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Colors } from '../theme/colors';
import { useBooks } from '../hooks/useBooks';
import { useBookPages, getBookAudioUri } from '../hooks/useBookPages';
import { useBookTexts } from '../hooks/useBookTexts';
import { useVoicework } from '../hooks/useVoicework';
import { useProfile } from '../hooks/useProfile';
import { PageViewer } from '../components/PageViewer';
import {
  playBookMusic,
  pauseMusic,
  resumeMusic,
  stopMusic,
  setVolume,
  getVolume,
  duckVolume,
  restoreVolume,
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
    currentPage,
    setCurrentPage,
    goToPage,
    isLastPage,
  } = useBookPages(book, profile.gender);

  const { pageTexts, title, author } = useBookTexts(
    book?.folderName,
    profile.gender,
    profile.name
  );

  const { isNarrating, toggleNarration, stopNarration } = useVoicework(book?.folderName);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showText, setShowText] = useState(true);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      // ALWAYS stop music when leaving screen
      stopMusic();
    };
  }, [book?.id]);

  // Handle hardware back button — stop audio first, then navigate
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

  // Auto-hide controls after 4 seconds
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => setShowControls(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showControls, currentPage]);

  const handleGoBack = useCallback(async () => {
    // Stop audio FIRST, then animate and navigate
    await stopMusic();
    setIsPlaying(false);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  }, []);

  const handleToggleMusic = useCallback(async () => {
    if (isPlaying) {
      await pauseMusic();
      setIsPlaying(false);
    } else {
      await resumeMusic();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleToggleNarration = useCallback(async () => {
    if (!pages[currentPage]) return;
    const pageNum = pages[currentPage].pageNumber;

    if (isNarrating) {
      await stopNarration();
      await restoreVolume(); // Restore background music volume
    } else {
      await duckVolume(); // Lower background music
      await toggleNarration(pageNum);
    }
  }, [currentPage, pages, isNarrating, toggleNarration, stopNarration]);

  // Stop narration when page changes
  const handlePageChange = useCallback(async (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setShowControls(true);
    if (isNarrating) {
      await stopNarration();
      await restoreVolume();
    }
  }, [isNarrating, stopNarration]);

  const handleTapScreen = useCallback(() => {
    setShowControls(prev => !prev);
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
      <StatusBar hidden />

      {/* Page viewer - fullscreen portrait */}
      {!showEndScreen ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTapScreen}
          style={styles.fullscreen}
        >
          <PageViewer
            pages={pages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            coverColor={book.coverColor}
            pageTexts={pageTexts}
            showText={showText}
          />
        </TouchableOpacity>
      ) : (
        /* End screen */
        <View style={[styles.endScreen, { backgroundColor: book.coverColor }]}>
          <Text style={styles.endEmoji}>🌙</Text>
          <Text style={styles.endTitle}>{title || book.title}</Text>
          <Text style={styles.endCredits}>
            {(author || book.author) && `Escrito por: ${author || book.author}`}
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

      {/* Top controls - show/hide on tap */}
      {!showEndScreen && showControls && (
        <View style={styles.topControls}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleGoBack}
            accessibilityLabel="Volver"
          >
            <Text style={styles.controlIcon}>←</Text>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.controlTitle} numberOfLines={1}>
            {title || book.title}
          </Text>

          {/* Right controls */}
          <View style={styles.rightControls}>
            {/* Narrate this page */}
            <TouchableOpacity
              style={[styles.controlButton, isNarrating && styles.controlButtonActive]}
              onPress={handleToggleNarration}
              accessibilityLabel={isNarrating ? 'Detener narración' : 'Escuchar narración'}
            >
              <Text style={styles.controlIcon}>{isNarrating ? '⏹' : '🎧'}</Text>
            </TouchableOpacity>

            {/* Toggle text */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowText(prev => !prev)}
              accessibilityLabel={showText ? 'Ocultar texto' : 'Mostrar texto'}
            >
              <Text style={styles.controlIcon}>{showText ? 'Aa' : 'Aa'}</Text>
            </TouchableOpacity>

            {/* Mute/unmute music */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleToggleMusic}
              accessibilityLabel={isPlaying ? 'Silenciar música' : 'Activar música'}
            >
              <Text style={styles.controlIcon}>{isPlaying ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreen: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 100,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: Colors.chipOrange,
  },
  controlIcon: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  controlTitle: {
    flex: 1,
    color: Colors.titleGold,
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  rightControls: {
    flexDirection: 'row',
    gap: 8,
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
