import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { Book } from '../types/book';
import { Colors } from '../theme/colors';
import { DownloadButton } from './DownloadButton';
import { BookCardMenu } from './BookCardMenu';
import { getBookCover } from '../assets/books/coverRegistry';

interface BookCardProps {
  book: Book;
  coverUri?: string;
  onPress: (book: Book) => void;
  onDownloadComplete: (bookId: string) => void;
  onToggleFavorite: (bookId: string) => void;
  onDelete: (bookId: string) => void;
  index?: number;
  cardWidth: number;
}

export function BookCard({
  book,
  coverUri,
  onPress,
  onDownloadComplete,
  onToggleFavorite,
  onDelete,
  index = 0,
  cardWidth,
}: BookCardProps) {
  const isAvailable = book.isDownloaded || book.isEmbedded;
  const [showMenu, setShowMenu] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

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
      Animated.sequence([
        Animated.spring(pressScale, {
          toValue: 1.045,
          speed: 28,
          bounciness: 7,
          useNativeDriver: true,
        }),
        Animated.timing(pressScale, {
          toValue: 0.96,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => onPress(book));
    }
    // If not available, do nothing — user must download first
  };

  return (
    <Animated.View
      style={{
        width: cardWidth,
        opacity: fadeAnim,
        transform: [{ scale: Animated.multiply(scaleAnim, pressScale) }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.container,
          { width: cardWidth, height: cardWidth, backgroundColor: book.coverColor },
        ]}
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
            <View style={styles.downloadCircle}>
              <Text style={styles.downloadArrow}>↓</Text>
            </View>
            <Text style={styles.sizeText}>{book.sizeMB} MB</Text>
          </View>
        )}
      </View>

      <View style={styles.bookSpine} pointerEvents="none" />

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

      {/* The original library uses a white bookmark tab, not a floating dot. */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setShowMenu(true)}
        accessibilityRole="button"
        accessibilityLabel="Más opciones"
      >
        <Text style={styles.menuButtonText}>⋮</Text>
      </TouchableOpacity>
    </TouchableOpacity>

      <BookCardMenu
        visible={showMenu}
        book={book}
        onToggleFavorite={() => onToggleFavorite(book.id)}
        onDelete={() => onDelete(book.id)}
        onClose={() => setShowMenu(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    borderWidth: 0,
  },
  imageContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  bookSpine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 9,
    backgroundColor: 'rgba(20, 207, 201, 0.78)',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.5)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  downloadArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sizeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 9,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  title: {
    color: Colors.textWhite,
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  downloadContainer: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    paddingHorizontal: 6,
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
  menuButton: {
    position: 'absolute',
    top: 0,
    right: 18,
    width: 30,
    height: 48,
    borderRadius: 0,
    backgroundColor: '#F7F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#3D3B43',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});
