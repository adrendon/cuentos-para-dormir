import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Book } from '../types/book';
import { Colors } from '../theme/colors';
import { DownloadButton } from './DownloadButton';
import { getBookCover } from '../assets/books/coverRegistry';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface BookCardProps {
  book: Book;
  coverUri?: string;
  onPress: (book: Book) => void;
  onDownloadComplete: (bookId: string) => void;
  index?: number;
}

export function BookCard({ book, coverUri, onPress, onDownloadComplete, index = 0 }: BookCardProps) {
  const isAvailable = book.isDownloaded || book.isEmbedded;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    if (isAvailable) {
      onPress(book);
    }
    // If not available, do nothing — user must download first
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: book.coverColor }]}
        onPress={handlePress}
        activeOpacity={isAvailable ? 0.85 : 1}
        accessibilityRole="button"
        accessibilityLabel={`${isAvailable ? 'Abrir' : 'Descargar'} cuento: ${book.title}`}
      >
      {/* Cover Image */}
      <View style={styles.imageContainer}>
        {(() => {
          const coverSource = getBookCover(book.folderName);
          if (coverSource) {
            return (
              <Image
                source={coverSource}
                style={styles.coverImage}
                resizeMode="cover"
              />
            );
          }
          return (
            <View style={[styles.placeholder, { backgroundColor: book.coverColor }]}>
              <Text style={styles.placeholderEmoji}>📖</Text>
            </View>
          );
        })()}

        {/* Overlay for not-downloaded books */}
        {!isAvailable && (
          <View style={styles.notDownloadedOverlay}>
            <Text style={styles.cloudIcon}>☁️</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
      </View>

      {/* Download button for non-available books */}
      {!isAvailable && (
        <View style={styles.downloadContainer}>
          <DownloadButton
            folderName={book.folderName}
            onDownloadComplete={() => onDownloadComplete(book.id)}
          />
        </View>
      )}

      {/* Read indicator */}
      {isAvailable && book.isRead && (
        <View style={styles.readBadge}>
          <Text style={styles.readBadgeText}>✓</Text>
        </View>
      )}

      {/* Favorite indicator */}
      {book.isFavorite && (
        <View style={styles.favoriteBadge}>
          <Text style={styles.favoriteText}>★</Text>
        </View>
      )}
    </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  imageContainer: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  notDownloadedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cloudIcon: {
    fontSize: 32,
  },
  titleContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  downloadContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  readBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readBadgeText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.chipOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    color: Colors.textWhite,
    fontSize: 14,
  },
});
