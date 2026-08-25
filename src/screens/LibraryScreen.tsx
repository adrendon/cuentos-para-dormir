import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  StatusBar,
  useWindowDimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Colors, Gradients } from '../theme/colors';
import { useBooks } from '../hooks/useBooks';
import { BookCard } from '../components/BookCard';
import { FilterModal } from '../components/FilterModal';
import { Book, BookCardLayout } from '../types/book';
import { setupEmbeddedBooks } from '../services/embeddedBooksService';

const LIBRARY_STARS = [
  [9, 65], [18, 91], [31, 73], [40, 54], [52, 89],
  [61, 63], [72, 78], [83, 57], [92, 88],
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function LibraryScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const router = useRouter();
  const {
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
    refreshBooks,
  } = useBooks();
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollTopAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // Keep the same three-column composition as the Android reference, but size
  // each region from the real viewport instead of scaling a fixed 1280x768
  // canvas. This lets wide phones/tablets use their extra horizontal space.
  const densityScale = clamp(windowHeight / 768, 0.72, 1.18);
  const outerPadding = clamp(windowWidth * 0.016, 12, 28);
  const railSize = clamp(windowHeight * 0.13, 72, 104);
  const railGap = clamp(windowHeight * 0.038, 22, 34);
  const railToContentGap = clamp(windowWidth * 0.024, 22, 42);
  const contentLeft = outerPadding + railSize + railToContentGap;
  const contentRight = outerPadding;
  const columnGap = clamp(windowWidth * 0.018, 18, 34);
  const rowGap = clamp(windowHeight * 0.075, 38, 66);
  const availableGridWidth = windowWidth - contentLeft - contentRight;
  const cardWidth = Math.max(180, (availableGridWidth - columnGap * 2) / 3);

  const headerTop = clamp(windowHeight * 0.022, 12, 22);
  const headerHeight = clamp(windowHeight * 0.09, 58, 72);
  const headerGap = clamp(windowWidth * 0.024, 24, 42);
  const filterWidth = clamp(windowWidth * 0.145, 170, 210);
  const gridTop = headerTop + headerHeight + clamp(windowHeight * 0.055, 34, 54);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void setupEmbeddedBooks().then(refreshBooks);
    }, 750);
    return () => clearTimeout(timer);
  }, [refreshBooks]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBookPress = useCallback((book: Book, layout: BookCardLayout) => {
    router.push({
      pathname: '/book/[id]',
      params: {
        id: book.id,
        sourceX: String(layout.x),
        sourceY: String(layout.y),
        sourceWidth: String(layout.width),
        sourceHeight: String(layout.height),
      },
    });
  }, [router]);

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShow = offsetY > cardWidth + 20;
    if (shouldShow && !showScrollTop) {
      setShowScrollTop(true);
      Animated.timing(scrollTopAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (!shouldShow && showScrollTop) {
      Animated.timing(scrollTopAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowScrollTop(false));
    }
  }, [showScrollTop, cardWidth, scrollTopAnim]);

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleSettingsPress = () => {
    router.push({ pathname: '/settings', params: { destination: 'profile' } });
  };

  const handleMailPress = () => {
    router.push({ pathname: '/settings', params: { destination: 'mail' } });
  };

  const handleDownloadComplete = useCallback((bookId: string) => {
    markBookAsDownloaded(bookId);
    refreshBooks();
  }, [markBookAsDownloaded, refreshBooks]);

  const renderBookItem = ({ item, index }: { item: Book; index: number }) => (
    <BookCard
      book={item}
      onPress={handleBookPress}
      onDownloadComplete={handleDownloadComplete}
      onToggleFavorite={toggleFavorite}
      onDelete={deleteBook}
      index={index}
      cardWidth={cardWidth}
    />
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

        <View style={[styles.sideRail, {
          left: outerPadding,
          top: headerTop,
          width: railSize,
          gap: railGap,
        }]}>
          <TouchableOpacity
            style={[styles.settingsButton, {
              width: railSize,
              height: railSize,
              borderRadius: railSize / 2,
            }]}
            onPress={handleSettingsPress}
            accessibilityLabel="Abrir ajustes"
            accessibilityRole="button"
          >
            <Image source={require('../assets/ui/ic_settings.png')} style={[styles.settingsIcon, {
              width: railSize * 0.52,
              height: railSize * 0.52,
            }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mailButton, {
              width: railSize,
              height: railSize,
              borderRadius: railSize / 2,
            }]}
            onPress={handleMailPress}
            accessibilityLabel="Enviar un correo"
          >
            <Image source={require('../assets/ui/ic_mail_to.png')} style={[styles.mailIcon, {
              width: railSize * 0.5,
              height: railSize * 0.5,
            }]} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchRow, {
          top: headerTop,
          left: contentLeft,
          right: contentRight,
          gap: headerGap,
        }]}>
          <View style={[styles.searchBox, {
            height: headerHeight,
            borderRadius: headerHeight / 2,
            paddingHorizontal: clamp(windowWidth * 0.02, 22, 34),
          }]}>
            <TextInput
              style={[styles.searchInput, { fontSize: clamp(30 * densityScale, 22, 31) }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Escribe el texto que buscas…"
              placeholderTextColor={Colors.textFieldColor}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Limpiar búsqueda">
                <Image source={require('../assets/ui/ic_close.png')} style={[styles.clearSearchIcon, {
                  width: clamp(30 * densityScale, 24, 32),
                  height: clamp(30 * densityScale, 24, 32),
                }]} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButton, {
              width: filterWidth,
              height: headerHeight,
              borderRadius: headerHeight / 2,
              paddingHorizontal: clamp(24 * densityScale, 18, 26),
              gap: clamp(12 * densityScale, 8, 14),
            }]}
            onPress={() => setFilterModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Filtro"
          >
            <View style={[styles.filterIcon, {
              width: clamp(30 * densityScale, 24, 32),
              height: clamp(24 * densityScale, 19, 26),
            }]}>
              <View style={styles.filterLineLong} />
              <View style={styles.filterLineMedium} />
              <View style={styles.filterLineShort} />
            </View>
            <Text style={[styles.filterButtonText, { fontSize: clamp(29 * densityScale, 22, 30) }]}>Filtro</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

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
            key={`library-grid-${Math.round(windowWidth)}`}
            contentContainerStyle={[
              styles.gridContent,
              {
                paddingTop: gridTop,
                paddingLeft: contentLeft,
                paddingRight: contentRight,
                paddingBottom: clamp(windowHeight * 0.075, 40, 64),
                gap: rowGap,
              },
            ]}
            columnWrapperStyle={{ gap: columnGap }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
        )}

        {showScrollTop && (
          <Animated.View style={[styles.scrollTopButton, {
            opacity: scrollTopAnim,
            left: outerPadding,
            bottom: clamp(windowHeight * 0.02, 12, 18),
            width: railSize,
            height: railSize,
            borderRadius: railSize / 2,
          }]}>
            <TouchableOpacity onPress={scrollToTop} accessibilityLabel="Volver arriba" accessibilityRole="button">
              <Image source={require('../assets/ui/ic_arrow_up.png')} style={[styles.scrollTopIcon, {
                width: railSize * 0.54,
                height: railSize * 0.54,
              }]} />
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
  stars: { ...StyleSheet.absoluteFill },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  sideRail: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 20,
  },
  settingsButton: {
    backgroundColor: '#0AA36F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: { tintColor: '#FFFFFF', resizeMode: 'contain' },
  mailButton: {
    backgroundColor: '#267ECB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mailIcon: { tintColor: '#FFFFFF', resizeMode: 'contain' },
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
    height: '100%',
  },
  clearSearchIcon: { tintColor: Colors.textFieldColor, resizeMode: 'contain' },
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
  scrollTopIcon: { tintColor: '#FFFFFF', resizeMode: 'contain' },
});
