import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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

export function PageIndexOverlay({ visible, pages, currentPage, onSelectPage, onClose }: PageIndexOverlayProps) {
  const listRef = useRef<FlatList<BookPage>>(null);
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.82, Math.min(1.25, Math.min(width / 904, height / 407)));
  const leftInset = 72 * scale;
  const rightInset = 18 * scale;
  const columnGap = 16 * scale;
  const thumbWidth = Math.max(120, (width - leftInset - rightInset - columnGap) / 2);
  const thumbHeight = thumbWidth / 1.475;
  const markWidth = 48 * scale;
  const markHeight = 64 * scale;
  const rowHeight = thumbHeight + 8 * scale;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      entrance.setValue(0);
      return;
    }
    entrance.setValue(0);
    Animated.timing(entrance, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [entrance, visible]);

  useEffect(() => {
    if (!visible || pages.length === 0) return;
    const row = Math.floor(currentPage / THUMB_COLUMNS);
    const viewport = height - 79 * scale;
    const offset = Math.max(0, row * rowHeight - (viewport - rowHeight) / 2);
    const timer = setTimeout(() => listRef.current?.scrollToOffset({ offset, animated: false }), 100);
    return () => clearTimeout(timer);
  }, [visible, currentPage, pages.length, height, rowHeight, scale]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: entrance }]}>
        <Animated.View style={[
          styles.content,
          {
            opacity: entrance,
            transform: [
              { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [22 * scale, 0] }) },
              { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) },
            ],
          },
        ]}>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { top: 12 * scale, left: 12 * scale, width: 52 * scale, height: 52 * scale, borderRadius: 26 * scale },
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar índice"
          >
            <Image
              source={require('../assets/ui/ic_close.png')}
              style={{ width: 29 * scale, height: 29 * scale }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <FlatList
            ref={listRef}
            data={pages}
            keyExtractor={(item) => `thumb-${item.pageNumber}`}
            numColumns={THUMB_COLUMNS}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ gap: columnGap }}
            contentContainerStyle={{
              paddingTop: 72 * scale,
              paddingLeft: leftInset,
              paddingRight: rightInset,
              paddingBottom: 30 * scale,
            }}
            renderItem={({ item, index }) => (
              <AnimatedThumb
                item={item}
                index={index}
                isActive={index === currentPage}
                scale={scale}
                width={thumbWidth}
                height={thumbHeight}
                markWidth={markWidth}
                markHeight={markHeight}
                onPress={() => onSelectPage(index)}
              />
            )}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function AnimatedThumb({ item, index, isActive, scale, width, height, markWidth, markHeight, onPress }: {
  item: BookPage;
  index: number;
  isActive: boolean;
  scale: number;
  width: number;
  height: number;
  markWidth: number;
  markHeight: number;
  onPress: () => void;
}) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entrance.setValue(0);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      delay: Math.min(index, 7) * 45,
      useNativeDriver: true,
    }).start();
  }, [entrance, index]);

  return (
    <Animated.View style={{
      opacity: entrance,
      transform: [
        { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [18 * scale, 0] }) },
        { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
      ],
    }}>
      <TouchableOpacity
        style={[
          styles.thumb,
          { width, height, marginBottom: 8 * scale, borderWidth: 4 * scale },
          isActive && styles.thumbActive,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Ir a la página ${item.pageNumber}`}
      >
        <Image source={{ uri: item.uri }} style={styles.thumbImage} resizeMode="cover" />
        <View
          style={[
            styles.pageNumberWrap,
            { left: 16 * scale, width: markWidth, height: markHeight },
          ]}
          pointerEvents="none"
        >
          <Image source={require('../assets/ui/ic_page_mark.png')} style={styles.pageMark} resizeMode="stretch" />
          <Text style={[styles.pageNumber, { fontSize: 19 * scale, marginTop: 7 * scale }]}>{item.pageNumber}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  content: { flex: 1 },
  closeButton: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: Colors.tooltipBackground,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 7,
  },
  thumb: { overflow: 'hidden', borderColor: 'transparent', backgroundColor: '#B9BAB3' },
  thumbActive: { borderColor: Colors.textWhite },
  thumbImage: { width: '100%', height: '100%' },
  pageNumberWrap: { position: 'absolute', top: 0, alignItems: 'center' },
  pageMark: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  pageNumber: { color: Colors.bookPagesText, fontFamily: 'Montserrat-ExtraBold' },
});
