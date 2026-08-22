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

const THUMB_COLUMNS = 5;

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
                <View style={styles.pageMarkWrap}>
                  <Image
                    source={require('../assets/ui/ic_page_mark.png')}
                    style={styles.pageMark}
                    resizeMode="contain"
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  thumb: {
    flex: 1 / THUMB_COLUMNS,
    aspectRatio: 0.75,
    margin: 6,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: Colors.accentYellow,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  pageMarkWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageMark: {
    ...StyleSheet.absoluteFill,
    width: 24,
    height: 28,
  },
  pageNumber: {
    color: Colors.backgroundDark,
    fontSize: 11,
    fontWeight: '800',
    marginTop: -6,
  },
});
