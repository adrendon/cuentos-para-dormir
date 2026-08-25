import React from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
  const scale = Math.max(0.82, Math.min(1.25, Math.min(width / 904, height / 407)));
  const menuWidth = 285 * scale;
  const canDelete = book.isDownloaded && !book.isEmbedded;
  const left = Math.max(12, Math.min(width - menuWidth - 12, anchor.x - menuWidth + 34 * scale));
  const top = Math.max(12, Math.min(height - 145 * scale, anchor.y + 12 * scale));

  const handleDeletePress = () => {
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
        <Pressable style={[styles.menu, { top, left, width: menuWidth, borderRadius: 16 * scale }]} onPress={(event) => event.stopPropagation()}>
          <TouchableOpacity style={[styles.item, { minHeight: 62 * scale, paddingHorizontal: 18 * scale }]} onPress={() => { onToggleFavorite(); onClose(); }} accessibilityLabel={book.isFavorite ? 'Sacar de favoritos' : 'Añadir a favoritos'}>
            <Text style={[styles.favoriteIcon, { fontSize: 29 * scale }]}>{book.isFavorite ? '★' : '☆'}</Text>
            <Text style={[styles.itemText, { fontSize: 17 * scale }]}>{book.isFavorite ? 'Sacar de favoritos' : 'Añadir a favoritos'}</Text>
          </TouchableOpacity>
          {canDelete && (
            <TouchableOpacity style={[styles.item, styles.separator, { minHeight: 62 * scale, paddingHorizontal: 18 * scale }]} onPress={handleDeletePress} accessibilityLabel="Borrar descarga">
              <Text style={[styles.deleteIcon, { fontSize: 27 * scale }]}>⌫</Text>
              <Text style={[styles.itemText, { fontSize: 17 * scale }]}>Borrar descarga</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.20)' },
  menu: { position: 'absolute', backgroundColor: '#F3F4EA', overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.26, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  item: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#C9CAC2' },
  favoriteIcon: { width: 36, color: '#F3A91F', textAlign: 'center', fontFamily: 'Montserrat-ExtraBold' },
  deleteIcon: { width: 36, color: '#168FD1', textAlign: 'center', fontFamily: 'Montserrat-ExtraBold' },
  itemText: { flex: 1, color: '#168FD1', fontFamily: 'Montserrat-SemiBold' },
});
