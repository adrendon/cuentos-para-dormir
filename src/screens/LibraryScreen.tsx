import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Gradients } from '../theme/colors';
import { useProfile } from '../hooks/useProfile';
import { useBooks } from '../hooks/useBooks';
import { BookCard } from '../components/BookCard';
import { FilterBar } from '../components/FilterBar';
import { Book } from '../types/book';
import { Asset } from 'expo-asset';

export default function LibraryScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { filteredBooks, isLoading, filter, setFilter, markBookAsDownloaded, refreshBooks } = useBooks();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBookPress = useCallback((book: Book) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      router.push(`/book/${book.id}`);
    });
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
      />
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundDark} />

      <LinearGradient
        colors={[...Gradients.background]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              ¡Hola, {profile.name || 'amiguito'}! 👋
            </Text>
            <Text style={styles.subtitle}>
              ¿Qué cuento quieres leer hoy?
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
            accessibilityLabel="Abrir ajustes"
            accessibilityRole="button"
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Filter bar */}
        <FilterBar activeFilter={filter} onFilterChange={setFilter} />

        {/* Book grid */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando cuentos...</Text>
          </View>
        ) : filteredBooks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyText}>
              {filter === 'favorites'
                ? 'Aún no tienes cuentos favoritos'
                : filter === 'unread'
                ? '¡Has leído todos los cuentos!'
                : 'No hay cuentos disponibles'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredBooks}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: Colors.titleGold,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.subtitleGray,
    fontSize: 14,
    marginTop: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 22,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
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
});
