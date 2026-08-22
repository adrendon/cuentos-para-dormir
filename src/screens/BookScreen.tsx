import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  BackHandler,
  StatusBar,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors } from '../theme/colors';
import { useBooks } from '../hooks/useBooks';
import { useBookPages, getBookAudioUri } from '../hooks/useBookPages';
import { useBookTexts } from '../hooks/useBookTexts';
import { useVoicework } from '../hooks/useVoicework';
import { useProfile } from '../hooks/useProfile';
import { PageViewer } from '../components/PageViewer';
import { BookOpeningIntro } from '../components/BookOpeningIntro';
import { PageIndexOverlay } from '../components/PageIndexOverlay';
import { LockOverlay } from '../components/LockOverlay';
import {
  playBookMusic,
  pauseMusic,
  resumeMusic,
  stopMusic,
  duckVolume,
  restoreVolume,
} from '../services/audioService';
import { LinearGradient } from 'expo-linear-gradient';

type BookStage = 'intro' | 'reading';
type ReadingMode = 'read' | 'listen';

export default function BookScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBookById, markAsRead, toggleFavorite } = useBooks();
  const { profile } = useProfile();
  const book = getBookById(id ?? '');

  const {
    pages,
    currentPage,
    setCurrentPage,
  } = useBookPages(book, profile.gender);

  const { pageTexts, title, author } = useBookTexts(
    book?.folderName,
    profile.gender,
    profile.name
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [showText, setShowText] = useState(true);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [stage, setStage] = useState<BookStage>('intro');
  const [mode, setMode] = useState<ReadingMode | null>(null);
  const [showIndex, setShowIndex] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // In "Escuchar" mode, auto-advance to the next page once narration finishes.
  const handleNarrationEnd = useCallback(() => {
    if (mode === 'listen' && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (mode === 'listen' && currentPage === pages.length - 1) {
      setShowEndScreen(true);
      if (book) markAsRead(book.id);
    }
  }, [mode, currentPage, pages.length, setCurrentPage, book, markAsRead]);

  const { isNarrating, playNarration, toggleNarration, stopNarration } = useVoicework(book?.folderName, handleNarrationEnd);

  // Keep screen awake
  useEffect(() => {
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
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
      // ALWAYS stop all audio when leaving screen
      stopMusic();
      stopNarration();
    };
  }, [book?.id]);

  // Ignore the hardware back button while the child lock is active.
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isLocked) return true;
      handleGoBack();
      return true;
    });
    return () => backHandler.remove();
  }, [isLocked]);

  const handleFinish = useCallback(() => {
    setShowEndScreen(true);
    if (book) markAsRead(book.id);
  }, [book, markAsRead]);

  // Auto-hide controls after 4 seconds
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => setShowControls(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showControls, currentPage]);

  const handleGoBack = useCallback(async () => {
    // Stop ALL audio immediately
    await stopMusic();
    await stopNarration();
    setIsPlaying(false);
    // Navigate back without animation delay
    router.back();
  }, [stopNarration]);

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

  // Narration from the old page must never continue over the new image.
  const handlePageChange = useCallback(async (pageIndex: number) => {
    if (pageIndex === currentPage) return;
    await stopNarration();
    await restoreVolume();
    setCurrentPage(pageIndex);
  }, [currentPage, stopNarration]);

  const handleTapScreen = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  const handleSelectMode = useCallback((selectedMode: ReadingMode) => {
    setMode(selectedMode);
    setStage('reading');
    setIsLocked(true); // Auto-lock touches once the story opens (kid-safe)
  }, []);

  const handleReadAgain = useCallback(() => {
    setCurrentPage(0);
    setShowEndScreen(false);
    setIsLocked(true);
  }, [setCurrentPage]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `¡Te recomiendo el cuento "${title || book?.title}"!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [title, book?.title]);

  const handleToggleFavoriteFromEndScreen = useCallback(() => {
    if (book) toggleFavorite(book.id);
  }, [book, toggleFavorite]);

  const handleSelectIndexPage = useCallback((pageIndex: number) => {
    setShowIndex(false);
    handlePageChange(pageIndex);
  }, [handlePageChange]);

  // "Escuchar" mode auto-plays the narration for the current page.
  useEffect(() => {
    if (stage !== 'reading' || mode !== 'listen') return;
    if (!pages[currentPage]) return;

    const pageNum = pages[currentPage].pageNumber;
    let cancelled = false;
    void (async () => {
      await duckVolume();
      if (cancelled) return;
      await playNarration(pageNum);
    })();
    return () => {
      cancelled = true;
      void stopNarration();
      void restoreVolume();
    };
  }, [stage, mode, currentPage, pages, playNarration, stopNarration]);

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

      {stage === 'intro' ? (
        <BookOpeningIntro
          coverColor={book.coverColor}
          title={title || book.title}
          firstPageSource={pages[0] ? { uri: pages[0].uri } : undefined}
          musicEnabled={isPlaying}
          onToggleMusic={handleToggleMusic}
          onClose={handleGoBack}
          onSelectMode={handleSelectMode}
        />
      ) : (
        <>
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
            onFinish={handleFinish}
            coverColor={book.coverColor}
            pageTexts={pageTexts}
            showText={showText}
          />
        </TouchableOpacity>
      ) : (
        /* End screen */
        <View style={[styles.endScreen, { backgroundColor: book.coverColor }]}>
          <Text style={styles.endEmoji}>FIN</Text>
          <Text style={styles.endTitle}>{title || book.title}</Text>
          <Text style={styles.endCredits}>
            {(author || book.author) && `Escrito por: ${author || book.author}`}
          </Text>
          <Text style={styles.endCredits}>
            {book.illustrator && `Ilustrado por: ${book.illustrator}`}
          </Text>
          <Text style={styles.endMessage}>~ Fin ~</Text>

          <View style={styles.endActionsRow}>
            <TouchableOpacity
              style={styles.endActionButton}
              onPress={handleReadAgain}
              accessibilityLabel="Leer otra vez"
            >
              <Text style={styles.endActionText}>Leer otra vez</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endActionButton}
              onPress={handleToggleFavoriteFromEndScreen}
              accessibilityLabel={book.isFavorite ? 'Sacar de favoritos' : 'Agregar a favoritos'}
            >
              <Text style={styles.endActionText}>
                {book.isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endActionButton}
              onPress={handleShare}
              accessibilityLabel="Compartir"
            >
              <Text style={styles.endActionText}>Compartir</Text>
            </TouchableOpacity>
          </View>

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

      {/* Compact floating controls with readable labels. */}
      {!showEndScreen && showControls && (
        <View style={styles.topControls}>
          <View style={styles.titleGroup}>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={handleGoBack}
              accessibilityLabel="Biblioteca"
            >
              <Image source={require('../assets/ui/ic_home.png')} style={styles.homeIcon} />
            </TouchableOpacity>
            <Text style={styles.controlTitle} numberOfLines={1}>{title || book.title}</Text>
          </View>

          <View style={styles.rightControls}>
            <TouchableOpacity
              style={styles.labeledControl}
              onPress={() => setShowIndex(true)}
              accessibilityLabel="Índice de páginas"
            >
              <Image
                source={require('../assets/ui/ic_content_burger.png')}
                style={styles.controlIconImage}
              />
              <Text style={styles.controlLabel}>Páginas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.labeledControl, isNarrating && styles.controlButtonActive]}
              onPress={handleToggleNarration}
              accessibilityLabel={isNarrating ? 'Detener narración' : 'Escuchar narración'}
            >
              <Image
                source={require('../assets/ui/ic_book_listen.png')}
                style={styles.controlIconImage}
              />
              <Text style={styles.controlLabel}>{isNarrating ? 'Detener' : 'Narrar'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.labeledControl}
              onPress={() => setShowText(prev => !prev)}
              accessibilityLabel={showText ? 'Ocultar texto' : 'Mostrar texto'}
            >
              <Text style={styles.aaIcon}>Aa</Text>
              <Text style={styles.controlLabel}>{showText ? 'Ocultar' : 'Texto'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.labeledControl}
              onPress={handleToggleMusic}
              accessibilityLabel={isPlaying ? 'Silenciar música' : 'Activar música'}
            >
              <Image
                source={
                  isPlaying
                    ? require('../assets/onboarding/ic_music_on.png')
                    : require('../assets/onboarding/ic_music_off.png')
                }
                style={styles.controlIconImage}
              />
              <Text style={styles.controlLabel}>Música</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.labeledControl}
              onPress={() => setIsLocked(true)}
              accessibilityLabel="Bloquear pantalla"
            >
              <View style={styles.lockShape} />
              <Text style={styles.controlLabel}>Bloquear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PageIndexOverlay
        visible={showIndex}
        pages={pages}
        currentPage={currentPage}
        onSelectPage={handleSelectIndexPage}
        onClose={() => setShowIndex(false)}
      />

      {isLocked && !showEndScreen && (
        <LockOverlay onUnlock={() => setIsLocked(false)} />
      )}
        </>
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
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  titleGroup: {
    maxWidth: '34%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(10, 8, 38, 0.78)',
    paddingRight: 18,
  },
  homeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F6F4E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIcon: { width: 27, height: 27, resizeMode: 'contain' },
  labeledControl: {
    minWidth: 68,
    height: 52,
    paddingHorizontal: 9,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 8, 38, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  controlButtonActive: {
    backgroundColor: Colors.chipOrange,
  },
  controlIconImage: {
    width: 21,
    height: 21,
    tintColor: Colors.textWhite,
    resizeMode: 'contain',
  },
  aaIcon: {
    height: 21,
    color: Colors.textWhite,
    fontSize: 16,
    fontFamily: 'Montserrat-ExtraBold',
  },
  lockShape: {
    width: 17,
    height: 15,
    marginTop: 3,
    borderRadius: 3,
    borderWidth: 3,
    borderColor: Colors.textWhite,
  },
  controlLabel: {
    color: Colors.textWhite,
    fontSize: 9,
    fontFamily: 'Montserrat-SemiBold',
  },
  controlTitle: {
    flex: 1,
    color: Colors.titleGold,
    fontSize: 15,
    fontFamily: 'Montserrat-ExtraBold',
    marginLeft: 12,
  },
  rightControls: {
    flexDirection: 'row',
    gap: 6,
  },
  endScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  endEmoji: {
    color: Colors.titleGold,
    fontSize: 32,
    fontFamily: 'Montserrat-ExtraBold',
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
  endActionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  endActionButton: {
    alignItems: 'center',
    width: 90,
  },
  endActionText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
