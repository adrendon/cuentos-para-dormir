import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Share,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../theme/colors';
import { useBooks } from '../hooks/useBooks';
import { useBookPages } from '../hooks/useBookPages';
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
import { duckVolume, restoreVolume } from '../services/audioService';
import { LockOverlay } from '../components/LockOverlay';
import { useReaderLock } from '../hooks/useReaderLock';
import { BookEndScreen } from '../components/BookEndScreen';
import { RecordComingSoonPanel } from '../components/RecordComingSoonPanel';
import { useBookLifecycle } from '../hooks/useBookLifecycle';
import { ReaderControls } from '../components/ReaderControls';
import { useBookMusic } from '../hooks/useBookMusic';

type BookStage = 'intro' | 'narrationPanel' | 'recordPanel' | 'reading';
type ReadingMode = 'read' | 'listen' | 'record';

export default function BookScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getBookById, markAsRead, toggleFavorite } = useBooks();
  const { profile, updateMusicVolume } = useProfile();
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

  const bookMusic = useBookMusic(book, profile.musicEnabled, profile.musicVolume, updateMusicVolume);
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
    void restoreVolume();
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

  // Fade in on mount
  useEffect(() => {
    screenOpacity.value = withTiming(1, { duration: 550 });
  }, []);

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
    bookMusic.stop();
    await stopNarration();

    // Animate scale down + fade out
    screenScale.value = withTiming(0.85, { duration: 400, easing: Easing.inOut(Easing.cubic) });
    screenOpacity.value = withTiming(0, { duration: 400, easing: Easing.inOut(Easing.cubic) });

    // Wait for the animation to complete, then navigate
    setTimeout(() => {
      router.back();
    }, 420);
  }, [bookMusic.stop, stopNarration, router, screenScale, screenOpacity]);

  const screenAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: screenScale.value }],
    opacity: screenOpacity.value,
  }));

  const handleDeactivate = useCallback(() => {
    bookMusic.stop();
    void stopNarration();
  }, [bookMusic.stop, stopNarration]);

  const handleNativeBack = useCallback(() => {
    void handleGoBack();
  }, [handleGoBack]);

  useBookLifecycle({
    isLocked: readerLock.isLocked,
    onBack: handleNativeBack,
    onDeactivate: handleDeactivate,
  });

  const handleToggleNarration = useCallback(async () => {
    if (!pages[currentPage]) return;
    const pageNum = pages[currentPage].pageNumber;

    if (isNarrating) {
      await stopNarration();
      await restoreVolume(); // Restore background music volume
    } else {
      await duckVolume(); // Lower background music
      const started = await toggleNarration(pageNum);
      if (!started) await restoreVolume();
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
      const started = await playNarration(pageNum);
      if (!started) await restoreVolume();
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
          musicEnabled={bookMusic.isPlaying}
          onToggleMusic={bookMusic.toggle}
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
        <RecordComingSoonPanel firstPageUri={pages[0]?.uri} onClose={handleClosePanels} />
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
            onPageNavigationStart={() => {
              void stopNarration();
              void restoreVolume();
            }}
            onFinish={handleFinish}
            onBackFromFirstPage={handleBackFromFirstPage}
            coverColor={book.coverColor}
            pageTexts={pageTexts}
            showText={showText}
            textSize={textSize}
          />
        </TouchableOpacity>
      ) : (
        <BookEndScreen
          color={book.coverColor}
          title={title || book.title}
          author={author || book.author}
          illustrator={book.illustrator}
          isFavorite={book.isFavorite}
          onReadAgain={handleReadAgain}
          onToggleFavorite={handleToggleFavoriteFromEndScreen}
          onShare={handleShare}
          onClose={handleGoBack}
        />
      )}

      {/* Compact floating controls */}
      {!showEndScreen && !readerLock.isLocked && (
        <ReaderControls
          animatedStyle={controlsAnimStyle}
          interactive={showControls}
          title={title || book.title}
          currentPage={currentPage}
          totalPages={pages.length}
          listenMode={mode === 'listen'}
          isNarrating={isNarrating}
          isNarrationPaused={isNarrationPaused}
          narrationVolume={narrationVolume}
          musicEnabled={bookMusic.isPlaying}
          musicVolume={bookMusic.musicVolume}
          showText={showText}
          onHome={handleGoBack}
          onOpenMenu={() => { setShowControls(false); setShowMenu(true); }}
          onToggleNarration={() => { void handleToggleNarration(); }}
          onPauseNarration={pauseNarration}
          onResumeNarration={resumeNarration}
          onNarrationVolumeChange={setNarrationVolume}
          onToggleText={() => setShowText(prev => !prev)}
          onToggleMusic={() => { void bookMusic.toggle(); }}
          onMusicVolumeChange={(volume) => { void bookMusic.changeVolume(volume); }}
          onLock={() => { setShowControls(false); readerLock.lock(); }}
        />
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
