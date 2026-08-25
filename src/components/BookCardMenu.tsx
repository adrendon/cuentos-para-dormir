import React from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Book } from '../types/book';

interface BookCardMenuProps {
  visible: boolean;
  book: Book;
  anchor: { x: number; y: number };
  onToggleFavorite: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function BookCardMenu({ visible, book, anchor, onToggleFavorite, onDelete, onClose }: BookCardMenuProps) {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.78, Math.min(1.08, height / 407));
  const menuWidth = 260 * scale;
  const canDelete = book.isDownloaded && !book.isEmbedded;
  const left = Math.max(12, Math.min(width - menuWidth - 12, anchor.x - menuWidth + 30 * scale));
  const top = Math.max(12, Math.min(height - 124 * scale, anchor.y - 4 * scale));

  const handleDeletePress = () => {
    if (!canDelete) return;
    onClose();
    Alert.alert(
      book.title,
      '¿Quieres borrar la descarga? La portada seguirá en la biblioteca y podrás descargar el cuento otra vez.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar descarga', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.menu, { top, left, width: menuWidth, borderRadius: 14 * scale }]}
          onPress={(event) => event.stopPropagation()}
        >
          <TouchableOpacity
            style={[styles.item, { minHeight: 54 * scale, paddingHorizontal: 18 * scale, gap: 12 * scale }]}
            onPress={() => { onToggleFavorite(); onClose(); }}
            accessibilityLabel={book.isFavorite ? 'Sacar de favoritos' : 'Añadir a favoritos'}
          >
            <Text style={[styles.favoriteIcon, { width: 34 * scale, fontSize: 31 * scale }]}>{book.isFavorite ? '♥' : '♡'}</Text>
            <Text style={[styles.itemText, { fontSize: 16 * scale }]}>{book.isFavorite ? 'Sacar de favoritos' : 'Añadir a favoritos'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canDelete}
            style={[styles.item, styles.separator, { minHeight: 54 * scale, paddingHorizontal: 18 * scale, gap: 12 * scale }]}
            onPress={handleDeletePress}
            accessibilityLabel="Borrar el libro"
            accessibilityState={{ disabled: !canDelete }}
          >
            <Text style={[styles.deleteIcon, !canDelete && styles.disabled, { width: 34 * scale, fontSize: 27 * scale }]}>♜</Text>
            <Text style={[styles.itemText, !canDelete && styles.disabled, { fontSize: 16 * scale }]}>Borrar el libro</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8, 10, 35, 0.34)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#F3F4E8',
    overflow: 'hidden',
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.34,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C9CAC2',
  },
  favoriteIcon: {
    color: '#63697C',
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  deleteIcon: {
    color: '#63697C',
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  itemText: {
    flex: 1,
    color: '#63697C',
    fontFamily: 'Montserrat-SemiBold',
  },
  disabled: {
    color: '#B6B7B1',
  },
});
