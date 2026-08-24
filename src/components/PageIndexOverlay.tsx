import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Image } from 'react-native';
import { BookPage } from '../types/book';
import { Colors } from '../theme/colors';

interface PageIndexOverlayProps {
  visible: boolean;
  pages: BookPage[];
  currentPage: number;
  onSelectPage: (index: number) => void;
  onClose: () => void;
}

const THUMB_COLUMNS = 2;

export function PageIndexOverlay({
  visible,
  pages,
  currentPage,
  onSelectPage,
  onClose,
}: PageIndexOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar índice"
          >
            <Image
              source={require('../assets/ui/ic_close.png')}
              style={styles.closeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={pages}
          keyExtractor={(item) => `thumb-${item.pageNumber}`}
          numColumns={THUMB_COLUMNS}
          contentContainerStyle={styles.grid}
          renderItem={({ item, index }) => {
            const isActive = index === currentPage;
            return (
              <TouchableOpacity
                style={[styles.thumb, isActive && styles.thumbActive]}
                onPress={() => onSelectPage(index)}
                accessibilityRole="button"
                accessibilityLabel={`Ir a la página ${index + 1}`}
              >
                <Image source={{ uri: item.uri }} style={styles.thumbImage} resizeMode="cover" />
                {/* The page number is printed over the bookmark on the left. */}
                <View style={styles.pageNumberWrap} pointerEvents="none">
                  <Image
                    source={require('../assets/ui/ic_page_mark.png')}
                    style={styles.pageMark}
                    resizeMode="stretch"
                  />
                  <Text style={styles.pageNumber}>{index + 1}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.64)',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  closeButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.tooltipBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 30,
    height: 30,
    tintColor: Colors.bookPagesText,
  },
  grid: {
    paddingHorizontal: '12%',
    paddingBottom: 24,
  },
  thumb: {
    flex: 1 / THUMB_COLUMNS,
    aspectRatio: 1.61,
    marginHorizontal: 14,
    marginVertical: 8,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: Colors.accentYellow,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  pageNumberWrap: {
    position: 'absolute',
    top: 0,
    left: 18,
    width: 42,
    height: 70,
    alignItems: 'center',
  },
  pageMark: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  pageNumber: {
    color: Colors.bookPagesText,
    fontSize: 20,
    fontFamily: 'Montserrat-ExtraBold',
    marginTop: 9,
  },
});
