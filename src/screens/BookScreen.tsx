import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  BackHandler,
  StatusBar,
  Share,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors } from '../theme/colors';
import { useBooks } from '../hooks/useBooks';
import { useBookPages, getBookAudioUri } from '../hooks/useBookPages';
import { useBookTexts } from '../hooks/useBookTexts';
import { useVoicework } from '../hooks/useVoicework';
import { useVoiceworkProfile } from '../hooks/useVoiceworkProfile';
import { getBookCover } from '../assets/books/coverRegistry';
import { useProfile } from '../hooks/useProfile';
import { PageViewer } from '../components/PageViewer';
import { BookOpeningIntro } from '../components/BookOpeningIntro';
import { PageIndexOverlay } from '../components/PageIndexOverlay';
import { NarrationPanel } from '../components/NarrationPanel';
import { ReaderMenu } from '../components/ReaderMenu';
import {
  playBookMusic,
  pauseMusic,
  resumeMusic,
  stopMusic,
  setVolume,
  duckVolume,
  restoreVolume,
} from '../services/audioService';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { LockOverlay } from '../components/LockOverlay';
import { useReaderLock } from '../hooks/useReaderLock';

type BookStage = 'intro' | 'narrationPanel' | 'recordPanel' | 'reading';
type ReadingMode = 'read' | 'listen' | 'record';

export default function BookScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBookById, markAsRead, toggleFavorite } = useBooks();
  const { profile } = useProfile();
  const book = getBookById(id ?? '');
  const [mode, setMode] = useState<ReadingMode | null>(null);
  const voiceworkProfile = useVoiceworkProfile(book?.folderName);
  const contentGender = mode === 'listen' && voiceworkProfile
    ? voiceworkProfile.gender
    : profile.gender;
  const contentName = mode === 'listen' && voiceworkProfile
    ? voiceworkProfile.name
    : profile.name;

  const {
    pages,
    currentPage,
    setCurrentPage,
  } = useBookPages(book, contentGender);

  const { pageTexts, title, author } = useBookTexts(
    book?.folderName,
    contentGender,
    contentName
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.35);
  const musicVolumeBeforeMute = useRef(0.35);
  const [showText, setShowText] = useState(true);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [stage, setStage] = useState<BookStage>('intro');
  const [showIndex, setShowIndex] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [textSize, setTextSize] = useState(14);
  const readerLock = useReaderLock();

  // Reanimated values for book close animation
  const screenScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);

  const controlsOpacity = useSharedValue(1);

  // In "Escuchar" mode, auto-advance to the next page once narration finishes.
  const handleNarrationEnd = useCallback(() => {
    if (mode === 'listen' && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (mode === 'listen' && currentPage === pages.length - 1) {
      setShowEndScreen(true);
      if (book) markAsRead(book.id);
    }
  }, [mode, currentPage, pages.length, setCurrentPage, book, markAsRead]);

  const {
    isNarrating,
    isNarrationPaused,
    narrationVolume,
    playNarration,
    toggleNarration,
    stopNarration,
    pauseNarration,
    resumeNarration,
    setNarrationVolume,
  } = useVoicework(book?.folderName, handleNarrationEnd);

  // Stack screens can remain mounted after navigation. Stopping on blur (not
  // only on unmount) prevents music or narration from leaking into the library,
  // settings, or another book.
  useFocusEffect(useCallback(() => {
    return () => {
      setIsPlaying(false);
      void stopNarration();
      void stopMusic();
    };
  }, [stopNarration]));

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

  // Fade in on mount
  useEffect(() => {
    screenOpacity.value = withTiming(1, { duration: 550 });
  }, []);

  // Start music when book is loaded
  useEffect(() => {
    let cancelled = false;
    if (book && profile.musicEnabled) {
      const audioUri = getBookAudioUri(book);
      void playBookMusic(book.title, audioUri).then(started => {
        if (!cancelled) setIsPlaying(started);
      });
    }

    return () => {
      cancelled = true;
      // ALWAYS stop all audio when leaving screen
      stopMusic();
      stopNarration();
    };
  }, [book?.id]);

  const handleFinish = useCallback(() => {
    setShowEndScreen(true);
    if (book) markAsRead(book.id);
  }, [book, markAsRead]);

  // Auto-hide controls after 4 seconds
  useEffect(() => {
    if (showControls) {
      controlsOpacity.value = withTiming(1, { duration: 250 });
      const timer = setTimeout(() => setShowControls(false), 4000);
      return () => clearTimeout(timer);
    } else {
      controlsOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [showControls, currentPage]);

  const controlsAnimStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  // Feature 8: Book closing animation
  const handleGoBack = useCallback(async () => {
    // Stop ALL audio immediately
    await stopMusic();
    await stopNarration();
    setIsPlaying(false);

    // Animate scale down + fade out
    screenScale.value = withTiming(0.85, { duration: 400, easing: Easing.inOut(Easing.cubic) });
    screenOpacity.value = withTiming(0, { duration: 400, easing: Easing.inOut(Easing.cubic) });

    // Wait for the animation to complete, then navigate
    setTimeout(() => {
      router.back();
    }, 420);
  }, [stopNarration, router, screenScale, screenOpacity]);

  const screenAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: screenScale.value }],
    opacity: screenOpacity.value,
  }));

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (readerLock.isLocked) return true;
      void handleGoBack();
      return true;
    });
    return () => backHandler.remove();
  }, [handleGoBack, readerLock.isLocked]);

  const handleToggleMusic = useCallback(async () => {
    if (isPlaying) {
      // Mute: save volume, set to 0, pause
      musicVolumeBeforeMute.current = musicVolume;
      await setVolume(0);
      await pauseMusic();
      setIsPlaying(false);
    } else {
      // Unmute: resume with saved volume
      await resumeMusic();
      await setVolume(musicVolumeBeforeMute.current);
      setMusicVolume(musicVolumeBeforeMute.current);
      setIsPlaying(true);
    }
  }, [isPlaying, musicVolume]);

  const handleMusicVolumeChange = useCallback(async (vol: number) => {
    setMusicVolume(vol);
    await setVolume(vol);
  }, []);

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

  const handleSelectIndexPage = useCallback((pageIndex: number) => {
    setShowIndex(false);
    void handlePageChange(pageIndex);
  }, [handlePageChange]);

  const handleTapScreen = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  // Feature 7: Back on first page → return to intro
  const handleBackFromFirstPage = useCallback(() => {
    void stopNarration();
    void restoreVolume();
    setCurrentPage(0);
    setMode(null);
    setStage('intro');
    setShowControls(true);
  }, [stopNarration, setCurrentPage]);

  const handleSelectMode = useCallback((selectedMode: ReadingMode) => {
    if (selectedMode === 'listen') {
      // Feature 2: Show narration panel instead of going directly to reading
      setMode('listen');
      setStage('narrationPanel');
    } else if (selectedMode === 'record') {
      // Feature 10: Show record panel
      setMode('record');
      setStage('recordPanel');
    } else {
      setMode(selectedMode);
      setStage('reading');
      setShowControls(false);
      readerLock.lock();
    }
  }, [readerLock.lock]);

  // When user selects the professional narration from the panel
  const handleSelectProfessionalNarration = useCallback(() => {
    setStage('reading');
    setShowControls(false);
    readerLock.lock();
  }, [readerLock.lock]);

  // Close narration/record panel → back to intro
  const handleClosePanels = useCallback(() => {
    setMode(null);
    setStage('intro');
  }, []);

  const handleReadAgain = useCallback(() => {
    setCurrentPage(0);
    setShowEndScreen(false);
    setShowControls(false);
    readerLock.lock();
  }, [setCurrentPage, readerLock.lock]);

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

  // Feature 6: Text size controls
  const handleIncrementTextSize = useCallback(() => {
    setTextSize(prev => Math.min(24, prev + 2));
  }, []);

  const handleDecrementTextSize = useCallback(() => {
    setTextSize(prev => Math.max(10, prev - 2));
  }, []);

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
    <Animated.View style={[styles.container, screenAnimStyle]}>
      <StatusBar hidden />

      {stage === 'intro' ? (
        <BookOpeningIntro
          coverColor={book.coverColor}
          title={title || book.title}
          firstPageSource={pages[0] ? { uri: pages[0].uri } : undefined}
          coverSource={getBookCover(book.folderName)}
          musicEnabled={isPlaying}
          onToggleMusic={handleToggleMusic}
          onClose={handleGoBack}
          onSelectMode={handleSelectMode}
        />
      ) : stage === 'narrationPanel' ? (
        <NarrationPanel
          narratorName={voiceworkProfile?.narrator ?? ''}
          childName={voiceworkProfile?.name || profile.name}
          coverColor={book.coverColor}
          firstPageSource={pages[0] ? { uri: pages[0].uri } : undefined}
          onSelectProfessional={handleSelectProfessionalNarration}
          onClose={handleClosePanels}
        />
      ) : stage === 'recordPanel' ? (
        /* Feature 10: Record mode panel */
        <View style={styles.recordPanelContainer}>
          {pages[0] && (
            <Image source={{ uri: pages[0].uri }} style={styles.recordBackground} resizeMode="cover" />
          )}
          <View style={styles.recordShade} />

          {/* Small mode icons on the left */}
          <View style={styles.recordLeftIcons}>
            <View style={styles.smallIconWrap}>
              <Image source={require('../assets/ui/ic_book_read.png')} style={styles.smallIcon} />
            </View>
            <View style={styles.smallIconWrap}>
              <Image source={require('../assets/ui/ic_book_listen.png')} style={styles.smallIcon} />
            </View>
            <View style={[styles.smallIconWrap, styles.smallIconActive]}>
              <View style={styles.micSmall}>
                <View style={styles.micHead} />
                <View style={styles.micStand} />
              </View>
            </View>
          </View>

          {/* Main content */}
          <View style={styles.recordContent}>
            <TouchableOpacity style={styles.recordCloseBtn} onPress={handleClosePanels} accessibilityLabel="Cerrar">
              <Image source={require('../assets/ui/ic_close.png')} style={styles.recordCloseIcon} />
            </TouchableOpacity>

            <Text style={styles.recordSectionTitle}>Narraciones personales</Text>
            <Text style={styles.recordDescription}>
              Graba tu propia narración para este cuento
            </Text>

            <TouchableOpacity style={styles.recordButton} disabled accessibilityLabel="Grabar (próximamente)">
              <View style={styles.recordCircle}>
                <View style={styles.recordDot} />
              </View>
              <Text style={styles.recordBtnText}>Próximamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
      {/* Page viewer - fullscreen */}
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
            onBackFromFirstPage={handleBackFromFirstPage}
            coverColor={book.coverColor}
            pageTexts={pageTexts}
            showText={showText}
            textSize={textSize}
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

      {/* Compact floating controls */}
      {!showEndScreen && !readerLock.isLocked && (
        <Animated.View
          style={[styles.topControls, controlsAnimStyle]}
          pointerEvents={showControls ? 'auto' : 'none'}
        >
          <View style={styles.titleGroup}>
            {/* Home button + page counter below it */}
            <View style={styles.homeColumn}>
              <TouchableOpacity
                style={styles.homeButton}
                onPress={handleGoBack}
                accessibilityLabel="Biblioteca"
              >
                <Image source={require('../assets/ui/ic_home.png')} style={styles.homeIcon} />
              </TouchableOpacity>
              {/* Feature 3: Page counter below home icon */}
              <Text style={styles.pageCounter}>
                {currentPage + 1}/{pages.length}
              </Text>
            </View>

            <Text style={styles.controlTitle} numberOfLines={1}>{title || book.title}</Text>
          </View>

          {mode === 'listen' && isNarrating && (
            <View style={styles.voiceBar}>
              <TouchableOpacity
                style={styles.voicePauseButton}
                onPress={isNarrationPaused ? resumeNarration : pauseNarration}
                accessibilityLabel={isNarrationPaused ? 'Continuar narración' : 'Pausar narración'}
              >
                <Text style={styles.voicePauseIcon}>{isNarrationPaused ? '▶' : 'Ⅱ'}</Text>
              </TouchableOpacity>
              <Text style={styles.voiceLabel}>Voz</Text>
              <Slider
                style={styles.voiceSlider}
                minimumValue={0}
                maximumValue={1}
                value={narrationVolume}
                onValueChange={setNarrationVolume}
                minimumTrackTintColor={Colors.accentTurquoise}
                maximumTrackTintColor="rgba(255,255,255,0.35)"
                thumbTintColor={Colors.textWhite}
                accessibilityLabel="Volumen de la narración"
              />
            </View>
          )}

          <View style={styles.rightControls}>
            {/* Feature 5: Hamburger menu button */}
            <TouchableOpacity
              style={styles.labeledControl}
              onPress={() => {
                setShowControls(false);
                setShowMenu(true);
              }}
              accessibilityLabel="Menú"
            >
              <Image
                source={require('../assets/ui/ic_content_burger.png')}
                style={styles.controlIconImage}
              />
              <Text style={styles.controlLabel}>Menú</Text>
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
            {isPlaying && (
              <View style={styles.musicSliderWrap}>
                <Slider
                  style={styles.musicSlider}
                  minimumValue={0}
                  maximumValue={1}
                  value={musicVolume}
                  onValueChange={handleMusicVolumeChange}
                  minimumTrackTintColor={Colors.accentYellow}
                  maximumTrackTintColor="rgba(255,255,255,0.25)"
                  thumbTintColor={Colors.accentYellow}
                  accessibilityLabel="Volumen de la música"
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.labeledControl}
              onPress={() => {
                setShowControls(false);
                readerLock.lock();
              }}
              accessibilityLabel="Bloquear pantalla"
            >
              <View style={styles.lockShape} />
              <Text style={styles.controlLabel}>Bloquear</Text>
            </TouchableOpacity>

          </View>
        </Animated.View>
      )}

      {/* Feature 5: Hamburger menu overlay */}
      <ReaderMenu
        visible={showMenu}
        textSize={textSize}
        onClose={() => setShowMenu(false)}
        onOpenIndex={() => setShowIndex(true)}
        onIncrementTextSize={handleIncrementTextSize}
        onDecrementTextSize={handleDecrementTextSize}
      />

      <PageIndexOverlay
        visible={showIndex}
        pages={pages}
        currentPage={currentPage}
        onSelectPage={handleSelectIndexPage}
        onClose={() => setShowIndex(false)}
      />

      {readerLock.isLocked && !showEndScreen && (
        <LockOverlay
          showPrompt={readerLock.showUnlockPrompt}
          onRequestPrompt={readerLock.requestUnlock}
          onUnlock={() => {
            readerLock.unlock();
            setShowControls(true);
          }}
        />
      )}

        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
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
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(10, 8, 38, 0.78)',
    paddingRight: 18,
  },
  homeColumn: {
    alignItems: 'center',
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
  // Feature 3: Page counter
  pageCounter: {
    color: Colors.textWhite,
    fontSize: 10,
    fontFamily: 'Montserrat-ExtraBold',
    marginTop: 3,
  },
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
  voiceBar: {
    height: 52,
    width: 210,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 8, 38, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  voicePauseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.accentTurquoise,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voicePauseIcon: { color: '#FFF', fontSize: 15, fontFamily: 'Montserrat-ExtraBold' },
  voiceLabel: { color: '#FFF', fontSize: 10, marginLeft: 8 },
  voiceSlider: { flex: 1, height: 40 },
  musicSliderWrap: {
    width: 100,
    justifyContent: 'center',
  },
  musicSlider: { width: 100, height: 36 },
  lockShape: {
    width: 17,
    height: 15,
    marginTop: 3,
    borderRadius: 3,
    borderWidth: 3,
    borderColor: Colors.textWhite,
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
  // Feature 10: Record panel styles
  recordPanelContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  recordBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  recordShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 4, 30, 0.78)',
  },
  recordLeftIcons: {
    position: 'absolute',
    left: 18,
    top: '50%',
    marginTop: -80,
    gap: 12,
    zIndex: 10,
  },
  smallIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallIconActive: {
    backgroundColor: '#238FDD',
    borderWidth: 2,
    borderColor: '#25C8EE',
  },
  smallIcon: {
    width: 22,
    height: 22,
    tintColor: '#FFF',
    resizeMode: 'contain',
  },
  micSmall: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micHead: {
    width: 9,
    height: 14,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  micStand: {
    width: 14,
    height: 8,
    marginTop: -5,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFF',
    borderRadius: 7,
  },
  recordContent: {
    flex: 1,
    marginLeft: 80,
    paddingTop: 32,
    paddingRight: 32,
    justifyContent: 'center',
  },
  recordCloseBtn: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  recordCloseIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFF',
  },
  recordSectionTitle: {
    color: Colors.titleGold,
    fontSize: 16,
    fontFamily: 'Montserrat-ExtraBold',
    marginBottom: 12,
  },
  recordDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 28,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 14,
    opacity: 0.5,
  },
  recordCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#FF4800',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF4800',
  },
  recordBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
});
