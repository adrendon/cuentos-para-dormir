import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Slider from '@react-native-community/slider';

interface ReaderMenuProps {
  visible: boolean; textSize: number; onClose: () => void; onOpenIndex: () => void;
  onLock: () => void; onTextSizeChange: (size: number) => void; showLock: boolean;
}

export function ReaderMenu({ visible, textSize, onClose, onOpenIndex, onLock, onTextSizeChange, showLock }: ReaderMenuProps) {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.76, Math.min(1.08, height / 407));
  const horizontalScale = Math.max(0.78, Math.min(1.2, width / 904));
  const verticalScale = Math.max(0.78, Math.min(1.08, height / 407));
  const [showTextSize, setShowTextSize] = useState(false);
  const [mounted, setMounted] = useState(visible);
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      entrance.stopAnimation();
      Animated.timing(entrance, { toValue: 1, duration: 230, useNativeDriver: true }).start();
      return;
    }
    if (!mounted) return;
    entrance.stopAnimation();
    Animated.timing(entrance, { toValue: 0, duration: 170, useNativeDriver: true }).start(() => {
      setShowTextSize(false);
      setMounted(false);
    });
  }, [visible, entrance, mounted]);

  if (!mounted) return null;

  if (showTextSize) {
    const previewWidth = Math.min(width * 0.62, 610 * horizontalScale);
    const previewHeight = Math.min(height * 0.58, 250 * verticalScale);
    return (
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: entrance }]}>
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
          <Image source={require('../assets/ui/ic_close.png')} style={{ width: 28 * scale, height: 28 * scale, tintColor: '#168FD1' }} resizeMode="contain" />
        </TouchableOpacity>
        <Animated.View style={[styles.preview, {
          width: previewWidth,
          height: previewHeight,
          borderRadius: 14 * scale,
          paddingHorizontal: 34 * horizontalScale,
          paddingVertical: 24 * verticalScale,
          opacity: entrance,
          transform: [
            { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [18 * verticalScale, 0] }) },
            { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
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
      </Animated.View>
    );
  }

  const menuWidth = Math.min(width * 0.25, 220 * horizontalScale);
  const topAnchor = 112 * verticalScale;
  const rightAnchor = 16 * horizontalScale;
  const closeSize = 38 * scale;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.popover, {
        right: rightAnchor,
        top: topAnchor,
        width: menuWidth,
        borderRadius: 12 * scale,
        opacity: entrance,
        transform: [
          { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [-12 * verticalScale, 0] }) },
          { translateX: entrance.interpolate({ inputRange: [0, 1], outputRange: [10 * horizontalScale, 0] }) },
          { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
        ],
      }]}>
        <View style={{ height: 18 * scale }} />
        <MenuItem image={require('../assets/ui/ic_content_burger.png')} label="Índice" scale={scale} onPress={() => { onClose(); setTimeout(onOpenIndex, 180); }} />
        <MenuItem image={require('../assets/ui/ic_font_burger.png')} label="Tamaño del texto" scale={scale} onPress={() => setShowTextSize(true)} last={!showLock} />
        {showLock && <MenuItem image={require('../assets/ui/ic_lock.png')} label="Bloquear controles" scale={scale} onPress={onLock} last />}
      </Animated.View>

      <Animated.View
        style={[
          styles.closeFloatingWrap,
          {
            right: rightAnchor - closeSize * 0.22,
            top: topAnchor - closeSize * 0.42,
            opacity: entrance,
            transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[styles.popoverClose, { width: closeSize, height: closeSize, borderRadius: closeSize / 2 }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar opciones"
        >
          <Text style={[styles.popoverCloseText, { fontSize: 25 * scale }]}>×</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function MenuItem({ image, label, scale, onPress, last = false }: { image: number; label: string; scale: number; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.item, { minHeight: 42 * scale, paddingHorizontal: 13 * scale, paddingVertical: 8 * scale }, !last && styles.itemBorder]} onPress={onPress} accessibilityLabel={label}>
      <Image source={image} style={{ width: 20 * scale, height: 20 * scale, tintColor: '#168FD1' }} resizeMode="contain" />
      <Text style={[styles.itemText, { fontSize: 13 * scale }]}>{label}</Text>
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
  closeFloatingWrap: { position: 'absolute', zIndex: 240, elevation: 20 },
  popoverClose: { backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 14, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, borderWidth: 2, borderColor: '#168FD1' },
  popoverCloseText: { color: '#168FD1', fontFamily: 'Montserrat-ExtraBold', lineHeight: 28 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  itemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C9CAC2' },
  itemText: { color: '#168FD1', fontFamily: 'Montserrat-SemiBold', flexShrink: 1 },
});
