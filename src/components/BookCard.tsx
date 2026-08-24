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
  const isAvailable = book.isDownloaded;
  const isIncluded = book.isEmbedded;
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
        activeOpacity={isAvailable || isIncluded ? 0.85 : 1}
        accessibilityRole="button"
        accessibilityLabel={`${isIncluded ? 'Cuento incluido' : isAvailable ? 'Abrir' : 'Descargar'}: ${book.title}`}
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
        </View>

        {/* Turquoise LEFT spine (book binding) */}
        <View style={styles.bookSpine} pointerEvents="none" />

        {/* Inward shadow/depth effect */}
        <View style={styles.innerShadow} pointerEvents="none" />

        {/* Title at bottom with dark overlay */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
        </View>

        {/* Download button for non-available books */}
        {!isAvailable && !book.isEmbedded && (
          <View style={styles.downloadContainer} pointerEvents="box-none">
            <DownloadButton
              folderName={book.folderName}
              sizeMB={book.sizeMB}
              accentColor={book.coverColor}
              onDownloadComplete={() => onDownloadComplete(book.id)}
            />
          </View>
        )}

        {/* White bookmark ribbon at top-right */}
        <View style={styles.ribbonContainer} pointerEvents="none">
          <View style={styles.ribbon} />
          <View style={styles.ribbonTail} />
        </View>

        {/* ⋮ menu at top-right */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
          accessibilityRole="button"
          accessibilityLabel="Más opciones"
        >
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>

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
    borderRadius: 4,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
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
    left: 0,
    width: 12,
    backgroundColor: 'rgba(20, 207, 201, 0.85)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.4)',
  },
  innerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 4,
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
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  title: {
    color: Colors.textWhite,
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '700',
    textAlign: 'center',
  },
  downloadContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 12,
    right: 0,
  },
  ribbonContainer: {
    position: 'absolute',
    top: 0,
    right: 14,
    width: 12,
    height: 26,
    alignItems: 'center',
  },
  ribbon: {
    width: 12,
    height: 20,
    backgroundColor: '#FFFFFF',
  },
  ribbonTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 5,
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
    borderBottomColor: 'transparent',
  },
  readBadge: {
    position: 'absolute',
    bottom: 40,
    left: 18,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readBadgeText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 6,
    left: 18,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.chipOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    color: Colors.textWhite,
    fontSize: 13,
  },
  menuButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#3D3B43',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});
