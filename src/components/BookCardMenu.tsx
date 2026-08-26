import React, { useCallback, useEffect, useRef } from 'react';
import { Alert, Animated, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      entrance.setValue(0);
      return;
    }
    entrance.setValue(0);
    Animated.spring(entrance, {
      toValue: 1,
      speed: 20,
      bounciness: 3,
      useNativeDriver: true,
    }).start();
  }, [entrance, visible]);

  const closeAnimated = useCallback(() => {
    Animated.timing(entrance, { toValue: 0, duration: 150, useNativeDriver: true }).start(onClose);
  }, [entrance, onClose]);

  const handleDeletePress = () => {
    if (!canDelete) return;
    closeAnimated();
    setTimeout(() => {
      Alert.alert(
        book.title,
        '¿Quieres borrar la descarga? La portada seguirá en la biblioteca y podrás descargar el cuento otra vez.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Borrar descarga', style: 'destructive', onPress: onDelete },
        ]
      );
    }, 170);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeAnimated} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: entrance.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeAnimated} />
        <Animated.View
          style={[
            styles.menu,
            {
              top,
              left,
              width: menuWidth,
              borderRadius: 14 * scale,
              opacity: entrance,
              transform: [
                { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [-12 * scale, 0] }) },
                { translateX: entrance.interpolate({ inputRange: [0, 1], outputRange: [10 * scale, 0] }) },
                { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.item, { minHeight: 54 * scale, paddingHorizontal: 18 * scale, gap: 12 * scale }]}
            onPress={() => { onToggleFavorite(); closeAnimated(); }}
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
            <TrashIcon scale={scale} disabled={!canDelete} />
            <Text style={[styles.itemText, !canDelete && styles.disabled, { fontSize: 16 * scale }]}>Borrar el libro</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function TrashIcon({ scale, disabled }: { scale: number; disabled: boolean }) {
  const color = disabled ? '#B6B7B1' : '#63697C';
  return (
    <View style={[styles.trashSlot, { width: 34 * scale, height: 28 * scale }]}>
      <View style={[styles.trashLid, { width: 18 * scale, height: 2.5 * scale, backgroundColor: color, top: 3 * scale }]} />
      <View style={[styles.trashHandle, { width: 7 * scale, height: 3 * scale, borderColor: color, top: 0 }]} />
      <View style={[styles.trashCan, { width: 15 * scale, height: 17 * scale, borderColor: color, borderRadius: 2 * scale, top: 7 * scale }]}>
        <View style={[styles.trashLine, { backgroundColor: color, left: 4 * scale }]} />
        <View style={[styles.trashLine, { backgroundColor: color, right: 4 * scale }]} />
      </View>
    </View>
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
  itemText: {
    flex: 1,
    color: '#63697C',
    fontFamily: 'Montserrat-SemiBold',
  },
  disabled: {
    color: '#B6B7B1',
  },
  trashSlot: {
    position: 'relative',
    alignItems: 'center',
  },
  trashLid: {
    position: 'absolute',
    borderRadius: 2,
  },
  trashHandle: {
    position: 'absolute',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  trashCan: {
    position: 'absolute',
    borderWidth: 2,
  },
  trashLine: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: 1.5,
    borderRadius: 1,
  },
});
