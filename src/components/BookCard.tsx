import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function BookCard({ book, onPress, onDownloadComplete, onToggleFavorite, onDelete, index = 0, cardWidth }: BookCardProps) {
  const isAvailable = book.isDownloaded;
  const isIncluded = book.isEmbedded;
  const displayScale = cardWidth / 361;
  const uiScale = clamp(displayScale, 0.72, 1.16);
  const titleSize = clamp(cardWidth * 0.078, 20, 31);
  const [showMenu, setShowMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const cardRef = useRef<any>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 350, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    if (!isAvailable && !isIncluded) return;
    Animated.sequence([
      Animated.spring(pressScale, { toValue: 1.045, speed: 28, bounciness: 7, useNativeDriver: true }),
      Animated.timing(pressScale, { toValue: 0.96, duration: 120, useNativeDriver: true }),
      Animated.timing(pressScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      cardRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => onPress(book, { x, y, width, height }));
    });
  };

  return (
    <Animated.View style={{ width: cardWidth, opacity: fadeAnim, transform: [{ scale: Animated.multiply(scaleAnim, pressScale) }] }}>
      <TouchableOpacity
        ref={cardRef}
        style={[styles.container, { width: cardWidth, height: cardWidth * (402 / 361), borderRadius: 12 * uiScale, backgroundColor: book.coverColor }]}
        onPress={handlePress}
        activeOpacity={isAvailable || isIncluded ? 0.85 : 1}
        accessibilityRole="button"
        accessibilityLabel={`${isIncluded ? 'Cuento incluido' : isAvailable ? 'Abrir' : 'Descargar'}: ${book.title}`}
      >
        <View style={styles.imageContainer}>
          {(() => {
            const coverSource = getBookCover(book.folderName);
            return coverSource
              ? <Image source={coverSource} style={styles.coverImage} resizeMode="cover" />
              : <View style={[styles.placeholder, { backgroundColor: book.coverColor }]}><Text style={styles.placeholderEmoji}>📖</Text></View>;
          })()}
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.82)']}
          locations={[0, 0.68]}
          style={[styles.titleGradient, { minHeight: cardWidth * 0.30, paddingBottom: 16 * uiScale, paddingHorizontal: 14 * uiScale }]}
        >
          <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.12 }]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>
            {book.title}
          </Text>
        </LinearGradient>

        {!isAvailable && !book.isEmbedded && (
          <View style={styles.downloadContainer} pointerEvents="box-none">
            <DownloadButton folderName={book.folderName} sizeMB={book.sizeMB} accentColor={book.coverColor} displayScale={uiScale} onDownloadComplete={() => onDownloadComplete(book.id)} />
          </View>
        )}

        <Image source={require('../assets/ui/ic_page_mark.png')} style={[styles.ribbon, { top: -2 * uiScale, right: 28 * uiScale, width: 46 * uiScale, height: 63 * uiScale }]} />
        <TouchableOpacity
          style={[styles.menuButton, { top: 4 * uiScale, right: 39 * uiScale, width: 24 * uiScale, height: 42 * uiScale }]}
          onPress={(event) => { setMenuAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY }); setShowMenu(true); }}
          accessibilityRole="button"
          accessibilityLabel="Más opciones"
        >
          <Text style={[styles.menuButtonText, { fontSize: 30 * uiScale, lineHeight: 33 * uiScale }]}>⋮</Text>
        </TouchableOpacity>

        {isAvailable && book.isRead && <View style={[styles.readBadge, { bottom: 10 * uiScale, left: 8 * uiScale }]}><Text style={styles.readBadgeText}>✓</Text></View>}
        {book.isFavorite && <View style={[styles.favoriteBadge, { top: 7 * uiScale, left: 8 * uiScale }]}><Text style={styles.favoriteText}>★</Text></View>}
      </TouchableOpacity>

      <BookCardMenu visible={showMenu} book={book} anchor={menuAnchor} onToggleFavorite={() => onToggleFavorite(book.id)} onDelete={() => onDelete(book.id)} onClose={() => setShowMenu(false)} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  imageContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  coverImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderEmoji: { fontSize: 48 },
  titleGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, justifyContent: 'flex-end' },
  title: { color: Colors.textWhite, fontFamily: 'Montserrat-SemiBold', fontWeight: '700', textAlign: 'center' },
  downloadContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  ribbon: { position: 'absolute', tintColor: '#FFFFFF' },
  menuButton: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  menuButtonText: { color: '#34343A', fontWeight: 'bold' },
  readBadge: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.success, justifyContent: 'center', alignItems: 'center' },
  readBadgeText: { color: Colors.textWhite, fontSize: 12, fontWeight: 'bold' },
  favoriteBadge: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.chipOrange, justifyContent: 'center', alignItems: 'center' },
  favoriteText: { color: Colors.textWhite, fontSize: 13 },
});
