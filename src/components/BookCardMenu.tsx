import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { Book } from '../types/book';
import { Colors } from '../theme/colors';

interface BookCardMenuProps {
  visible: boolean;
  book: Book;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function BookCardMenu({ visible, book, onToggleFavorite, onDelete, onClose }: BookCardMenuProps) {
  const canDelete = book.isDownloaded && !book.isEmbedded;

  const handleDeletePress = () => {
    onClose();
    Alert.alert(
      book.title,
      '¿Quieres borrar el libro?\nTus grabaciones no se verán afectadas',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onToggleFavorite();
              onClose();
            }}
            accessibilityRole="button"
          >
            <Text style={styles.menuItemText}>
              {book.isFavorite ? 'Sacar de favoritos' : 'Añadir a favoritos'}
            </Text>
          </TouchableOpacity>

          {canDelete && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeletePress}
              accessibilityRole="button"
            >
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Borrar el libro</Text>
            </TouchableOpacity>
          )}

          {!canDelete && book.isEmbedded && (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemDisabled}>
                No es posible eliminar los libros integrados.
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menu: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.backgroundGradientEnd,
    borderRadius: 18,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItemText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuItemDanger: {
    color: Colors.error,
  },
  menuItemDisabled: {
    color: Colors.subtitleGray,
    fontSize: 13,
    textAlign: 'center',
  },
});
