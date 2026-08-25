import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, BookCardLayout } from '../types/book';
import { Colors } from '../theme/colors';
import { DownloadButton } from './DownloadButton';
import { BookCardMenu } from './BookCardMenu';
import { getBookCover } from '../assets/books/coverRegistry';

interface BookCardProps {
  book: Book;
  onPress: (book: Book, layout: BookCardLayout) => void;
  onDownloadComplete: (bookId: string) => void;
  onToggleFavorite: (bookId: string) => void;
  onDelete: (bookId: string) => void;
  index?: number;
  cardWidth: number;
}

export function BookCard({
  book,
  onPress,
  onDownloadComplete,
  onToggleFavorite,
  onDelete,
  index = 0,
  cardWidth,
}: BookCardProps) {
  const isAvailable = book.isDownloaded;
  const isIncluded = book.isEmbedded;
  const displayScale = cardWidth / 361;
  const [showMenu, setShowMenu] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const cardRef = useRef<any>(null);

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
    if (isAvailable || isIncluded) {
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
        Animated.timing(pressScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        cardRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
          onPress(book, { x, y, width, height });
        });
      });
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
        ref={cardRef}
        style={[
          styles.container,
          { width: cardWidth, height: cardWidth * (402 / 361), backgroundColor: book.coverColor },
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

        {/* Title bar with gradient at bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={[styles.titleGradient, {
            paddingVertical: 18 * displayScale,
            paddingHorizontal: 16 * displayScale,
          }]}
        >
          <Text style={[styles.title, {
            fontSize: 30 * displayScale,
            lineHeight: 36 * displayScale,
          }]} numberOfLines={2}>
            {book.title}
          </Text>
        </LinearGradient>

        {/* Download overlay for non-available books */}
        {!isAvailable && !book.isEmbedded && (
          <View style={styles.downloadContainer} pointerEvents="box-none">
            <DownloadButton
              folderName={book.folderName}
              sizeMB={book.sizeMB}
              accentColor={book.coverColor}
              displayScale={displayScale}
              onDownloadComplete={() => onDownloadComplete(book.id)}
            />
          </View>
        )}

        {/* White ribbon/bookmark at top-right */}
        <Image source={require('../assets/ui/ic_page_mark.png')} style={[styles.ribbon, {
          top: -2 * displayScale,
          right: 32 * displayScale,
          width: 46 * displayScale,
          height: 63 * displayScale,
        }]} />

        {/* Three dots menu - white, no background */}
        <TouchableOpacity
          style={[styles.menuButton, {
            top: 5 * displayScale,
            right: 43 * displayScale,
            width: 24 * displayScale,
            height: 42 * displayScale,
          }]}
          onPress={() => setShowMenu(true)}
          accessibilityRole="button"
          accessibilityLabel="Más opciones"
        >
          <Text style={[styles.menuButtonText, {
            fontSize: 31 * displayScale,
            lineHeight: 34 * displayScale,
          }]}>⋮</Text>
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
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  titleGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  title: {
    color: Colors.textWhite,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '700',
    textAlign: 'center',
  },
  downloadContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ribbon: {
    position: 'absolute',
    tintColor: '#FFFFFF',
  },
  menuButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#34343A',
    fontWeight: 'bold',
  },
  readBadge: {
    position: 'absolute',
    bottom: 40,
    left: 8,
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
    left: 8,
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
});
