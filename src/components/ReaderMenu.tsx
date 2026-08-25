import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Slider from '@react-native-community/slider';

interface ReaderMenuProps {
  visible: boolean; textSize: number; onClose: () => void; onOpenIndex: () => void;
  onLock: () => void; onTextSizeChange: (size: number) => void;
}

export function ReaderMenu({ visible, textSize, onClose, onOpenIndex, onLock, onTextSizeChange }: ReaderMenuProps) {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.76, Math.min(1.3, Math.min(width / 904, height / 407)));
  const horizontalScale = Math.max(0.78, Math.min(1.35, width / 904));
  const verticalScale = Math.max(0.78, Math.min(1.3, height / 407));
  const [showTextSize, setShowTextSize] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setShowTextSize(false);
      entrance.setValue(0);
      return;
    }
    entrance.setValue(0);
    Animated.timing(entrance, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [visible, entrance]);

  if (!visible) return null;

  if (showTextSize) {
    const previewWidth = Math.min(width * 0.62, 610 * horizontalScale);
    const previewHeight = Math.min(height * 0.58, 250 * verticalScale);
    return (
      <View style={[StyleSheet.absoluteFill, styles.overlay]}>
        <TouchableOpacity
          style={[styles.closeButton, {
            top: 12 * verticalScale,
            left: 12 * horizontalScale,
            width: 50 * scale,
            height: 50 * scale,
            borderRadius: 25 * scale,
          }]}
          onPress={onClose}
          accessibilityLabel="Cerrar tamaño de texto"
        >
          <Image source={require('../assets/ui/ic_close.png')} style={{ width: 28 * scale, height: 28 * scale }} resizeMode="contain" />
        </TouchableOpacity>
        <Animated.View style={[styles.preview, {
          width: previewWidth,
          height: previewHeight,
          borderRadius: 14 * scale,
          paddingHorizontal: 34 * horizontalScale,
          paddingVertical: 24 * verticalScale,
          opacity: entrance,
          transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
        }]}>
          <View style={[styles.sizeSliderRow, { marginBottom: 20 * verticalScale }]}>
            <Text style={[styles.tLabel, { fontSize: 22 * scale }]}>T</Text>
            <Slider
              style={{ width: Math.min(previewWidth * 0.72, 430 * horizontalScale), height: 45 * verticalScale }}
              minimumValue={12}
              maximumValue={26}
              step={1}
              value={textSize}
              onValueChange={onTextSizeChange}
              minimumTrackTintColor="#168FD1"
              maximumTrackTintColor="#CFEAF4"
              thumbTintColor="#FFFFFF"
              accessibilityLabel="Tamaño del texto"
            />
            <Text style={[styles.tLabel, { fontSize: 38 * scale }]}>T</Text>
          </View>
          <Text style={[styles.previewText, { fontSize: textSize * scale, lineHeight: textSize * scale * 1.36 }]}>A primera vista era como cualquier otro gato - con orejas, bigotes y una larga cola. Pero tenía algo especial.</Text>
        </Animated.View>
      </View>
    );
  }

  const menuWidth = Math.min(width * 0.25, 220 * horizontalScale);
  const menuBottom = 72 * verticalScale;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.popover, {
        right: 16 * horizontalScale,
        bottom: menuBottom,
        width: menuWidth,
        borderRadius: 12 * scale,
        opacity: entrance,
        transform: [
          { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [14 * verticalScale, 0] }) },
          { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
        ],
      }]}>
        <MenuItem image={require('../assets/ui/ic_content_burger.png')} label="Índice" scale={scale} onPress={() => { onClose(); onOpenIndex(); }} />
        <MenuItem image={require('../assets/ui/ic_font_burger.png')} label="Tamaño del texto" scale={scale} onPress={() => setShowTextSize(true)} />
        <MenuItem image={require('../assets/ui/ic_lock.png')} label="Bloquear controles" scale={scale} onPress={onLock} last />
      </Animated.View>
      <TouchableOpacity
        style={[styles.popoverClose, {
          right: 18 * horizontalScale,
          bottom: menuBottom + 3 * verticalScale,
          width: 34 * scale,
          height: 34 * scale,
          borderRadius: 17 * scale,
        }]}
        onPress={onClose}
        accessibilityLabel="Cerrar opciones"
      >
        <Text style={[styles.popoverCloseText, { fontSize: 22 * scale }]}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

function MenuItem({ image, label, scale, onPress, last = false }: { image: number; label: string; scale: number; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.item, { minHeight: 45 * scale, paddingHorizontal: 14 * scale, paddingVertical: 9 * scale }, !last && styles.itemBorder]} onPress={onPress} accessibilityLabel={label}>
      <Image source={image} style={{ width: 22 * scale, height: 22 * scale, tintColor: '#168FD1' }} resizeMode="contain" />
      <Text style={[styles.itemText, { fontSize: 14 * scale }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: { zIndex: 220, backgroundColor: 'rgba(0,0,0,0.70)', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', zIndex: 4, backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  preview: { backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  sizeSliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  tLabel: { color: '#168FD1', fontFamily: 'Montserrat-ExtraBold' },
  previewText: { color: '#303037', fontFamily: 'Montserrat-SemiBold', textAlign: 'center' },
  popover: { position: 'absolute', zIndex: 210, backgroundColor: '#F3F4EA', overflow: 'hidden', elevation: 8 },
  popoverClose: { position: 'absolute', zIndex: 211, backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center', elevation: 9 },
  popoverCloseText: { color: '#168FD1', fontFamily: 'Montserrat-ExtraBold', marginTop: -3 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  itemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C9CAC2' },
  itemText: { color: '#168FD1', fontFamily: 'Montserrat-SemiBold', flexShrink: 1 },
});
