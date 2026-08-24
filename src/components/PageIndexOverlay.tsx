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
          <Text style={styles.headerTitle}>Índice</Text>
          <View style={styles.closeButton} />
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
                {/* Page number in top-left */}
                <View style={styles.pageNumberWrap}>
                  <Text style={styles.pageNumber}>{index + 1}</Text>
                </View>
                {/* White bookmark ribbon in top-right */}
                <View style={styles.thumbRibbonContainer}>
                  <View style={styles.thumbRibbon} />
                  <View style={styles.thumbRibbonTail} />
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
    backgroundColor: 'rgba(23, 18, 84, 0.97)',
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.textWhite,
  },
  headerTitle: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: '800',
  },
  grid: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  thumb: {
    flex: 1 / THUMB_COLUMNS,
    aspectRatio: 0.72,
    margin: 8,
    borderRadius: 10,
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
    top: 6,
    left: 8,
  },
  pageNumber: {
    color: Colors.chipBlue,
    fontSize: 14,
    fontWeight: '800',
  },
  thumbRibbonContainer: {
    position: 'absolute',
    top: 0,
    right: 10,
    width: 14,
    height: 20,
    alignItems: 'center',
  },
  thumbRibbon: {
    width: 14,
    height: 16,
    backgroundColor: '#FFFFFF',
  },
  thumbRibbonTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 5,
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#FFFFFF',
    borderBottomColor: 'transparent',
  },
});
