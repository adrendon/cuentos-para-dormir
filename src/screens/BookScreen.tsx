import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  BackHandler,
  StatusBar,
  Image,
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

type BookMode = 'select' | 'reading';

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
    isLastPage,
  } = useBookPages(book, profile.gender);

  const { pageTexts, title, author } = useBookTexts(
    book?.folderName,
    profile.gender,
    profile.name
  );

  const { isNarrating, toggleNarration, stopNarration } = useVoicework(book?.folderName);

  const [mode, setMode] = useState<BookMode>('select');
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoNarrate, setAutoNarrate] = useState(false);
  const [showText, setShowText] = useState(true);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Keep screen awake
  useEffect(() => {
    activateKeepAwakeAsync();
    return () => { deactivateKeepAwake(); };
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopMusic();
      stopNarration();
    };
  }, []);

  // Handle hardware back
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });
    return () => backHandler.remove();
  }, [mode]);

  // End screen on last page
  useEffect(() => {
    if (isLastPage && pages.length > 0 && mode === 'reading') {
      setShowEndScreen(true);
      if (book) markAsRead(book.id);
    } else {
      setShowEndScreen(false);
    }
  }, [isLastPage, pages.length, mode]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && mode === 'reading') {
      const timer = setTimeout(() => setShowControls(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showControls, currentPage, mode]);

  const handleGoBack = useCallback(async () => {
    if (mode === 'reading') {
      // Go back to mode selector
      await stopMusic();
      await stopNarration();
      setIsPlaying(false);
      setMode('select');
    } else {
      // Go back to library
      await stopMusic();
      await stopNarration();
      router.back();
    }
  }, [mode, stopNarration]);

  const startReading = useCallback((withMusic: boolean, withVoiceover: boolean) => {
    setMode('reading');
    setShowText(true);
    setAutoNarrate(withVoiceover);
    if (withMusic && book) {
      const audioUri = getBookAudioUri(book);
      playBookMusic(book.title, audioUri);
      setIsPlaying(true);
      // If voiceover, duck the music
      if (withVoiceover) {
        duckVolume();
      }
    }
    // Auto-play narration for first page if listen mode
    if (withVoiceover && pages.length > 0) {
      toggleNarration(pages[0].pageNumber);
    }
  }, [book, pages, toggleNarration]);

  const handleToggleMusic = useCallback(async () => {
    if (isPlaying) {
      await pauseMusic();
      setIsPlaying(false);
    } else {
      if (book) {
        const audioUri = getBookAudioUri(book);
        await playBookMusic(book.title, audioUri);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, book]);

  const handleToggleNarration = useCallback(async () => {
    if (!pages[currentPage]) return;
    const pageNum = pages[currentPage].pageNumber;
    if (isNarrating) {
      await stopNarration();
      await restoreVolume();
    } else {
      await duckVolume();
      await toggleNarration(pageNum);
    }
  }, [currentPage, pages, isNarrating, toggleNarration, stopNarration]);

  const handlePageChange = useCallback(async (pageIndex: number) => {
    setCurrentPage(pageIndex);
    setShowControls(true);
    // Stop current narration
    if (isNarrating) {
      await stopNarration();
    }
    // Auto-narrate if in listen mode
    if (autoNarrate && pages[pageIndex]) {
      await toggleNarration(pages[pageIndex].pageNumber);
    } else {
      await restoreVolume();
    }
  }, [isNarrating, stopNarration, autoNarrate, pages, toggleNarration]);

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Cuento no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorLink}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // MODE SELECT — choose read or listen before starting
  if (mode === 'select') {
    return (
      <View style={[styles.modeContainer, { backgroundColor: book.coverColor }]}>
        <StatusBar hidden />

        {/* Back button */}
        <TouchableOpacity style={styles.modeBackBtn} onPress={() => router.back()}>
          <Image source={require('../assets/ui/ic_home.png')} style={styles.modeBackIcon} />
        </TouchableOpacity>

        <Text style={styles.modeTitle}>{title || book.title}</Text>
        <Text style={styles.modeAuthor}>{author || book.author}</Text>

        <View style={styles.modeButtons}>
          {/* Read mode - with background music, no voiceover */}
          <TouchableOpacity style={styles.modeBtn} onPress={() => startReading(true, false)}>
            <Image source={require('../assets/ui/ic_book_read.png')} style={styles.modeBtnIcon} />
            <Text style={styles.modeBtnText}>Leer</Text>
          </TouchableOpacity>

          {/* Listen mode - with voiceover narration */}
          <TouchableOpacity style={styles.modeBtn} onPress={() => startReading(true, true)}>
            <Image source={require('../assets/ui/ic_book_listen.png')} style={styles.modeBtnIcon} />
            <Text style={styles.modeBtnText}>Escuchar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // READING MODE
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {!showEndScreen ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowControls(prev => !prev)}
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
        <View style={[styles.endScreen, { backgroundColor: book.coverColor }]}>
          <Text style={styles.endEmoji}>🌙</Text>
          <Text style={styles.endTitle}>{title || book.title}</Text>
          <Text style={styles.endCredits}>
            {(author || book.author) && `Escrito por: ${author || book.author}`}
          </Text>
          <Text style={styles.endMessage}>~ Fin ~</Text>
          <TouchableOpacity style={styles.endButton} onPress={handleGoBack}>
            <LinearGradient
              colors={[Colors.buttonGreenStart, Colors.buttonGreenEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.endButtonGradient}
            >
              <Text style={styles.endButtonText}>Volver</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Top controls */}
      {!showEndScreen && showControls && (
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={handleGoBack}>
            <Image source={require('../assets/ui/ic_home.png')} style={styles.ctrlIcon} />
          </TouchableOpacity>

          <Text style={styles.ctrlTitle} numberOfLines={1}>{title || book.title}</Text>

          <View style={styles.ctrlRight}>
            {/* Narration */}
            <TouchableOpacity
              style={[styles.ctrlBtn, isNarrating && styles.ctrlBtnActive]}
              onPress={handleToggleNarration}
            >
              <Text style={styles.ctrlEmoji}>🎧</Text>
            </TouchableOpacity>

            {/* Text toggle */}
            <TouchableOpacity style={styles.ctrlBtn} onPress={() => setShowText(p => !p)}>
              <Text style={[styles.ctrlEmoji, { fontSize: 14 }]}>{showText ? 'Aa' : 'Aa'}</Text>
            </TouchableOpacity>

            {/* Music mute */}
            <TouchableOpacity style={styles.ctrlBtn} onPress={handleToggleMusic}>
              <Image
                source={isPlaying
                  ? require('../assets/ui/ic_music_on.png')
                  : require('../assets/ui/ic_music_off.png')
                }
                style={styles.ctrlIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Mode selector
  modeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modeBackBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBackIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFF',
  },
  modeTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  modeAuthor: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 40,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  modeBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 20,
    width: 140,
  },
  modeBtnIcon: {
    width: 48,
    height: 48,
    tintColor: '#FFF',
    marginBottom: 10,
  },
  modeBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Reading
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
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 100,
  },
  ctrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlBtnActive: {
    backgroundColor: Colors.chipOrange,
  },
  ctrlIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFF',
  },
  ctrlEmoji: {
    fontSize: 16,
  },
  ctrlTitle: {
    flex: 1,
    color: Colors.titleGold,
    fontSize: 13,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  ctrlRight: {
    flexDirection: 'row',
    gap: 6,
  },
  // End
  endScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  endEmoji: { fontSize: 52, marginBottom: 16 },
  endTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  endCredits: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 },
  endMessage: { color: Colors.titleGold, fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 24 },
  endButton: { borderRadius: 24, overflow: 'hidden' },
  endButtonGradient: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  endButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  // Error
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundDark },
  errorText: { color: '#FFF', fontSize: 16, marginBottom: 12 },
  errorLink: { color: Colors.chipBlue, fontSize: 14, textDecorationLine: 'underline' },
});
