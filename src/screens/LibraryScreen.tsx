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
import { Book } from '../types/book';
import { setupEmbeddedBooks } from '../services/embeddedBooksService';

const LIBRARY_STARS = [
  [9, 65], [18, 91], [31, 73], [40, 54], [52, 89],
  [61, 63], [72, 78], [83, 57], [92, 88],
];

export default function LibraryScreen() {
  const { width: windowWidth } = useWindowDimensions();
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
  const sideRailWidth = 92;
  const gridLeftPadding = sideRailWidth + 28;
  const gridRightPadding = 20;
  const columnGap = 16;
  const cardWidth = Math.floor(
    (windowWidth - gridLeftPadding - gridRightPadding - columnGap * 2) / 3
  );

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useEffect(() => {
    // Never download and extract the bundled starter book during onboarding.
    // Wait until this screen has rendered, then refresh its metadata when done.
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

  const handleBookPress = useCallback((book: Book) => {
    router.push(`/book/${book.id}`);
  }, []);

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
    router.push('/settings');
  };

  const handleDownloadComplete = useCallback((bookId: string) => {
    markBookAsDownloaded(bookId);
    // Refresh to load the book metadata
    refreshBooks();
  }, [markBookAsDownloaded, refreshBooks]);

  const getCoverUri = (book: Book): string | undefined => {
    // Use bundled cover image from covers/ folder
    // These are bundled as assets in the app
    return undefined; // Will use Asset.fromModule in production
    // For now, covers show the placeholder with coverColor
  };

  const renderBookItem = ({ item, index }: { item: Book; index: number }) => {
    return (
      <BookCard
        book={item}
        coverUri={getCoverUri(item)}
        onPress={handleBookPress}
        onDownloadComplete={handleDownloadComplete}
        onToggleFavorite={toggleFavorite}
        onDelete={deleteBook}
        index={index}
        cardWidth={cardWidth}
      />
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar hidden />

      <LinearGradient
        colors={[...Gradients.background]}
        style={styles.gradient}
      >
        <View style={styles.stars} pointerEvents="none">
          {LIBRARY_STARS.map(([left, top], index) => (
            <View key={index} style={[styles.star, { left: `${left}%`, top: `${top}%` }]} />
          ))}
        </View>
        {/* Compact side rail, matching the reference landscape layout. */}
        <View style={styles.sideRail}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
            accessibilityLabel="Abrir ajustes"
            accessibilityRole="button"
          >
            <Image source={require('../assets/ui/ic_settings.png')} style={styles.settingsIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mailButton} accessibilityLabel="Novedades">
            <Image source={require('../assets/ui/ic_mail_to.png')} style={styles.mailIcon} />
          </TouchableOpacity>
        </View>

        {/* Search + filter bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Escribe el texto que buscas…"
              placeholderTextColor={Colors.textFieldColor}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Limpiar búsqueda">
                <Image source={require('../assets/ui/ic_close.png')} style={styles.clearSearchIcon} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Filtro"
          >
            <View style={styles.filterIcon}>
              <View style={styles.filterLineLong} />
              <View style={styles.filterLineMedium} />
              <View style={styles.filterLineShort} />
            </View>
            <Text style={styles.filterButtonText}>Filtro</Text>
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

        {/* Book grid */}
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
              { paddingLeft: gridLeftPadding, paddingRight: gridRightPadding },
            ]}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
        )}

        {/* Scroll-to-top floating button */}
        {showScrollTop && (
          <Animated.View style={[styles.scrollTopButton, { opacity: scrollTopAnim }]}>
            <TouchableOpacity onPress={scrollToTop} accessibilityLabel="Volver arriba" accessibilityRole="button">
              <Image source={require('../assets/ui/ic_arrow_up.png')} style={styles.scrollTopIcon} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  stars: {
    ...StyleSheet.absoluteFill,
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  sideRail: {
    position: 'absolute',
    left: 14,
    top: 18,
    width: 64,
    alignItems: 'center',
    gap: 16,
    zIndex: 20,
  },
  settingsButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#0AA36F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 31,
    height: 31,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  mailButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#267ECB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mailIcon: {
    width: 26,
    height: 26,
    tintColor: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 92,
    paddingTop: 18,
    paddingRight: 20,
    paddingBottom: 14,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.tooltipBackground,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.textFieldColor,
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    height: '100%',
  },
  clearSearchIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.textFieldColor,
    resizeMode: 'contain',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingHorizontal: 24,
    borderRadius: 27,
    backgroundColor: '#F2F4DD',
    gap: 6,
  },
  filterButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  filterIcon: {
    width: 20,
    height: 17,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLineLong: { width: 20, height: 2, backgroundColor: '#3E3E38' },
  filterLineMedium: { width: 14, height: 2, backgroundColor: '#3E3E38' },
  filterLineShort: { width: 7, height: 2, backgroundColor: '#3E3E38' },
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
  gridContent: {
    paddingBottom: 24,
    gap: 12,
  },
  gridRow: {
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textGrayLight,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.textGrayLight,
    fontSize: 16,
    textAlign: 'center',
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 18,
    left: -7,
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#34338B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollTopIcon: {
    width: 34,
    height: 34,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
  },
});
