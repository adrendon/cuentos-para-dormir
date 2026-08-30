import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors, Gradients } from '../theme/colors';
import { useBooks } from '../hooks/useBooks';
import { BookCard } from '../components/BookCard';
import { FilterModal } from '../components/FilterModal';
import { SearchOverlay } from '../components/SearchOverlay';
import { Book } from '../types/book';
import { warmBookVisual } from '../assets/books/bookVisualRegistry';
import { useProfile } from '../hooks/useProfile';
import { useBookMusic } from '../hooks/useBookMusic';
import { useVirtualCanvas } from '../theme/virtualCanvas';

const LIBRARY_STARS = [
  [9, 65],
  [18, 91],
  [31, 73],
  [40, 54],
  [52, 89],
  [61, 63],
  [72, 78],
  [83, 57],
  [92, 88],
];
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
let libraryMotionPlayed = false;

export default function LibraryScreen() {
  const { width: canvasWidth, height: canvasHeight } = useVirtualCanvas();
  const router = useRouter();
  const {
    books,
    filteredBooks,
    isLoading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
    markBookAsDownloaded,
    toggleFavorite,
    deleteBook,
  } = useBooks();
  const { profile, updateMusicVolume } = useProfile();
  const [isFocused, setIsFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );
  const libraryMusicBook = books.find((book) => book.isDownloaded);
  const libraryMusic = useBookMusic(
    libraryMusicBook,
    profile.musicEnabled && isFocused,
    profile.musicVolume,
    updateMusicVolume
  );
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const fadeAnim = useRef(new Animated.Value(libraryMotionPlayed ? 1 : 0)).current;
  const railAnim = useRef(new Animated.Value(libraryMotionPlayed ? 1 : 0)).current;
  const headerAnim = useRef(new Animated.Value(libraryMotionPlayed ? 1 : 0)).current;
  const scrollTopAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const densityScale = clamp(canvasHeight / 768, 0.72, 1.18);
  const outerPadding = clamp(canvasWidth * 0.016, 12, 28);
  const railSize = clamp(canvasHeight * 0.11, 64, 88);
  const railGap = clamp(canvasHeight * 0.038, 22, 34);
  const controlGap = clamp(canvasWidth * 0.018, 18, 32);
  const contentLeft = outerPadding + railSize + clamp(canvasWidth * 0.024, 22, 42);
  const contentRight = outerPadding + railSize + controlGap;
  const columnGap = clamp(canvasWidth * 0.018, 18, 34);
  const rowGap = clamp(canvasHeight * 0.075, 38, 66);
  const gridInset = Math.max(contentLeft, contentRight);
  const availableCardWidth = (canvasWidth - gridInset * 2 - columnGap * 2) / 3;
  const cardWidth = Math.max(180, availableCardWidth);
  const headerTop = clamp(canvasHeight * 0.022, 12, 22);
  const headerHeight = clamp(canvasHeight * 0.09, 58, 72);
  const headerGap = clamp(canvasWidth * 0.024, 24, 42);
  const filterWidth = clamp(canvasWidth * 0.145, 170, 210);
  const gridTop = headerTop + headerHeight + clamp(canvasHeight * 0.055, 34, 54);
  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);
  useEffect(() => {
    if (libraryMotionPlayed) return;
    fadeAnim.setValue(0);
    railAnim.setValue(0);
    headerAnim.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(railAnim, {
        toValue: 1,
        duration: 430,
        delay: 80,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 430,
        delay: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      libraryMotionPlayed = true;
    });
  }, [fadeAnim, headerAnim, railAnim]);
  const handleBookPress = useCallback(
    (book: Book) => {
      router.push({ pathname: '/book/[id]', params: { id: book.id } });
      void warmBookVisual(book.folderName);
    },
    [router]
  );
  const handleScroll = useCallback(
    (event: any) => {
      const shouldShow = event.nativeEvent.contentOffset.y > cardWidth + 20;
      if (shouldShow && !showScrollTop) {
        setShowScrollTop(true);
        Animated.spring(scrollTopAnim, {
          toValue: 1,
          speed: 20,
          bounciness: 4,
          useNativeDriver: true,
        }).start();
      } else if (!shouldShow && showScrollTop) {
        Animated.timing(scrollTopAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => setShowScrollTop(false));
      }
    },
    [showScrollTop, cardWidth, scrollTopAnim]
  );
  const scrollToTop = useCallback(
    () => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }),
    []
  );
  const handleDownloadComplete = useCallback(
    (bookId: string) => markBookAsDownloaded(bookId),
    [markBookAsDownloaded]
  );
  const handleSearchSubmit = useCallback(
    (value: string) => {
      setSearchQuery(value);
      requestAnimationFrame(() =>
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
      );
    },
    [setSearchQuery]
  );
  const renderBookItem = useCallback(
    ({ item, index }: { item: Book; index: number }) => (
      <BookCard
        book={item}
        onPress={handleBookPress}
        onDownloadComplete={handleDownloadComplete}
        onToggleFavorite={toggleFavorite}
        onDelete={deleteBook}
        index={index}
        cardWidth={cardWidth}
      />
    ),
    [cardWidth, deleteBook, handleBookPress, handleDownloadComplete, toggleFavorite]
  );
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden />
      <LinearGradient colors={[...Gradients.background]} style={styles.gradient}>
        <View style={styles.stars} pointerEvents="none">
          {LIBRARY_STARS.map(([left, top], index) => (
            <View key={index} style={[styles.star, { left: `${left}%`, top: `${top}%` }]} />
          ))}
        </View>
        <Animated.View
          style={[
            styles.sideRail,
            {
              left: outerPadding,
              top: headerTop,
              width: railSize,
              gap: railGap,
              opacity: railAnim,
              transform: [
                {
                  translateX: railAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-34, 0],
                  }),
                },
                {
                  scale: railAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.settingsButton,
              { width: railSize, height: railSize, borderRadius: railSize / 2 },
            ]}
            onPress={() =>
              router.push({
                pathname: '/settings',
                params: { destination: 'profile' },
              })
            }
          >
            <Image
              source={require('../assets/ui/ic_settings.png')}
              style={{
                width: railSize * 0.58,
                height: railSize * 0.58,
                tintColor: '#FFF',
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.mailButton,
              { width: railSize, height: railSize, borderRadius: railSize / 2 },
            ]}
            onPress={() =>
              router.push({
                pathname: '/settings',
                params: { destination: 'mail' },
              })
            }
          >
            <Image
              source={require('../assets/ui/ic_mail_to.png')}
              style={{
                width: railSize * 0.48,
                height: railSize * 0.48,
                tintColor: '#FFF',
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            styles.musicControl,
            {
              top: headerTop,
              right: outerPadding,
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.musicButton,
              { width: railSize, height: railSize, borderRadius: railSize / 2 },
            ]}
            onPress={() => {
              void libraryMusic.toggle();
            }}
            accessibilityLabel={
              libraryMusic.isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo'
            }
          >
            <Image
              source={
                libraryMusic.isPlaying
                  ? require('../assets/onboarding/ic_music_on.png')
                  : require('../assets/onboarding/ic_music_off.png')
              }
              style={{
                width: railSize * 0.46,
                height: railSize * 0.46,
                tintColor: '#FFF',
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            styles.searchRow,
            {
              top: headerTop,
              left: contentLeft,
              right: contentRight,
              gap: headerGap,
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.94}
            onPress={() => setSearchVisible(true)}
            style={[
              styles.searchBox,
              {
                height: headerHeight,
                borderRadius: headerHeight / 2,
                paddingHorizontal: clamp(canvasWidth * 0.02, 22, 34),
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.searchInput,
                { fontSize: clamp(30 * densityScale, 22, 31) },
                !searchQuery && styles.searchPlaceholder,
              ]}
            >
              {searchQuery || 'Escribe el texto que buscas…'}
            </Text>
            {!!searchQuery && (
              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation();
                  setSearchQuery('');
                }}
              >
                <Image
                  source={require('../assets/ui/ic_close.png')}
                  style={{
                    width: 30 * densityScale,
                    height: 30 * densityScale,
                    tintColor: Colors.textFieldColor,
                  }}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                width: filterWidth,
                height: headerHeight,
                borderRadius: headerHeight / 2,
                paddingHorizontal: clamp(24 * densityScale, 18, 26),
                gap: clamp(12 * densityScale, 8, 14),
              },
            ]}
            onPress={() => setFilterModalVisible(true)}
          >
            <View
              style={[
                styles.filterIcon,
                {
                  width: clamp(30 * densityScale, 24, 32),
                  height: clamp(24 * densityScale, 19, 26),
                },
              ]}
            >
              <View style={styles.filterLineLong} />
              <View style={styles.filterLineMedium} />
              <View style={styles.filterLineShort} />
            </View>
            <Text style={[styles.filterButtonText, { fontSize: clamp(29 * densityScale, 22, 30) }]}>
              Filtro
            </Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
        <SearchOverlay
          visible={isSearchVisible}
          value={searchQuery}
          onSubmit={handleSearchSubmit}
          onClose={() => setSearchVisible(false)}
        />
        <FilterModal
          visible={isFilterModalVisible}
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          onClose={() => setFilterModalVisible(false)}
        />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando cuentos...</Text>
          </View>
        ) : filteredBooks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>
              {searchQuery || activeFilterCount > 0
                ? 'No encontramos cuentos que coincidan. Prueba cambiando la búsqueda y vuelve a intentarlo.'
                : 'No hay cuentos disponibles'}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={filteredBooks}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            contentContainerStyle={[
              styles.gridContent,
              {
                paddingTop: gridTop,
                paddingLeft: gridInset,
                paddingRight: gridInset,
                paddingBottom: clamp(canvasHeight * 0.075, 40, 64),
                gap: rowGap,
              },
            ]}
            columnWrapperStyle={[styles.gridRow, { gap: columnGap }]}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
        )}
        {showScrollTop && (
          <Animated.View
            style={[
              styles.scrollTopButton,
              {
                opacity: scrollTopAnim,
                left: outerPadding,
                bottom: clamp(canvasHeight * 0.02, 12, 18),
                width: railSize,
                height: railSize,
                borderRadius: railSize / 2,
                transform: [
                  {
                    translateY: scrollTopAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                  {
                    scale: scrollTopAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.88, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity onPress={scrollToTop}>
              <Image
                source={require('../assets/ui/ic_arrow_up.png')}
                style={{
                  width: railSize * 0.48,
                  height: railSize * 0.48,
                  tintColor: '#FFF',
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  stars: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,.35)',
  },
  sideRail: { position: 'absolute', alignItems: 'center', zIndex: 20 },
  settingsButton: {
    backgroundColor: '#0AA36F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mailButton: {
    backgroundColor: '#267ECB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicControl: { position: 'absolute', zIndex: 31 },
  musicButton: {
    backgroundColor: '#267ECB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  searchRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 30,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tooltipBackground,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.textFieldColor,
    fontFamily: 'Montserrat-SemiBold',
  },
  searchPlaceholder: { opacity: 0.72 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4DD',
    overflow: 'hidden',
  },
  filterButtonText: { color: '#333', fontFamily: 'Montserrat-SemiBold' },
  filterIcon: { justifyContent: 'space-between', alignItems: 'center' },
  filterLineLong: { width: '100%', height: 3, backgroundColor: '#3E3E38' },
  filterLineMedium: { width: '68%', height: 3, backgroundColor: '#3E3E38' },
  filterLineShort: { width: '36%', height: 3, backgroundColor: '#3E3E38' },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: Colors.backgroundDark,
    fontSize: 11,
    fontWeight: '800',
  },
  gridContent: { flexGrow: 1 },
  gridRow: { justifyContent: 'flex-start' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textGrayLight, fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { color: Colors.textGrayLight, fontSize: 16, textAlign: 'center' },
  scrollTopButton: {
    position: 'absolute',
    backgroundColor: '#34338B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
