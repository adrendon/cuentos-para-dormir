import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Book } from '../types/book';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface BookCardProps {
  book: Book;
  coverUri?: string;
  onPress: (book: Book) => void;
  animationDelay?: number;
}

export function BookCard({ book, coverUri, onPress, animationDelay = 0 }: BookCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: book.coverColor }]}
      onPress={() => onPress(book)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Abrir cuento: ${book.title}`}
    >
      {/* Cover Image */}
      <View style={styles.imageContainer}>
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: book.coverColor }]}>
            <Text style={styles.placeholderEmoji}>📖</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
      </View>

      {/* Read indicator */}
      {book.isRead && (
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
  titleContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
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
