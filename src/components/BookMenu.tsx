import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { BookPage } from '../types/book';
import { Colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface BookMenuProps {
  visible: boolean;
  isPlaying: boolean;
  volume: number;
  pages: BookPage[];
  currentPage: number;
  bookTitle: string;
  onClose: () => void;
  onGoBack: () => void;
  onTogglePlay: () => void;
  onVolumeChange: (volume: number) => void;
  onPageSelect: (pageIndex: number) => void;
}

export function BookMenu({
  visible,
  isPlaying,
  volume,
  pages,
  currentPage,
  bookTitle,
  onClose,
  onGoBack,
  onTogglePlay,
  onVolumeChange,
  onPageSelect,
}: BookMenuProps) {
  const [showThumbnails, setShowThumbnails] = useState(false);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      <View style={styles.menuContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {bookTitle}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Cerrar menú"
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Back to library */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onGoBack}
            accessibilityLabel="Volver a la biblioteca"
          >
            <Text style={styles.controlIcon}>←</Text>
            <Text style={styles.controlLabel}>Biblioteca</Text>
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onTogglePlay}
            accessibilityLabel={isPlaying ? 'Pausar música' : 'Reanudar música'}
          >
            <Text style={styles.controlIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            <Text style={styles.controlLabel}>
              {isPlaying ? 'Pausar' : 'Reanudar'}
            </Text>
          </TouchableOpacity>

          {/* Thumbnail view */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowThumbnails(!showThumbnails)}
            accessibilityLabel="Ver todas las páginas"
          >
            <Text style={styles.controlIcon}>▦</Text>
            <Text style={styles.controlLabel}>Páginas</Text>
          </TouchableOpacity>
        </View>

        {/* Volume control */}
        <View style={styles.volumeContainer}>
          <Text style={styles.volumeLabel}>🔊 Volumen</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.volumeValue}>
              {Math.round(volume * 100)}%
            </Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={onVolumeChange}
                minimumTrackTintColor={Colors.buttonGreenEnd}
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor={Colors.textWhite}
              />
            </View>
          </View>
        </View>

        {/* Thumbnail grid */}
        {showThumbnails && (
          <ScrollView style={styles.thumbnailScroll} horizontal={false}>
            <View style={styles.thumbnailGrid}>
              {pages.map((page, index) => (
                <TouchableOpacity
                  key={`thumb-${page.pageNumber}`}
                  style={[
                    styles.thumbnail,
                    index === currentPage && styles.thumbnailActive,
                  ]}
                  onPress={() => {
                    onPageSelect(index);
                    setShowThumbnails(false);
                    onClose();
                  }}
                  accessibilityLabel={`Ir a página ${index + 1}`}
                >
                  <Image
                    source={{ uri: page.uri }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.thumbnailNumber}>{index + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlayBlack,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 30, 15, 0.95)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookTitle: {
    color: Colors.titleGold,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  controlIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  controlLabel: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '500',
  },
  volumeContainer: {
    marginBottom: 12,
  },
  volumeLabel: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeValue: {
    color: Colors.textGrayLight,
    fontSize: 12,
    width: 40,
  },
  sliderContainer: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  thumbnailScroll: {
    maxHeight: height * 0.4,
    marginTop: 8,
  },
  thumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  thumbnail: {
    width: 70,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: Colors.titleGold,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailNumber: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
});
