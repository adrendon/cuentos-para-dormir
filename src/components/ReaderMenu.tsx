import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Slider from '@react-native-community/slider';

interface ReaderMenuProps {
  visible: boolean; textSize: number; onClose: () => void; onOpenIndex: () => void;
  onLock: () => void; onTextSizeChange: (size: number) => void;
}

export function ReaderMenu({ visible, textSize, onClose, onOpenIndex, onLock, onTextSizeChange }: ReaderMenuProps) {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.82, Math.min(1.25, Math.min(width / 904, height / 407)));
  const [showTextSize, setShowTextSize] = useState(false);
  useEffect(() => { if (!visible) setShowTextSize(false); }, [visible]);
  if (!visible) return null;
  if (showTextSize) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.overlay]}>
        <TouchableOpacity style={[styles.closeButton, { top: 12 * scale, left: 12 * scale, width: 50 * scale, height: 50 * scale, borderRadius: 25 * scale }]} onPress={onClose} accessibilityLabel="Cerrar tamaño de texto">
          <Image source={require('../assets/ui/ic_close.png')} style={{ width: 28 * scale, height: 28 * scale }} resizeMode="contain" />
        </TouchableOpacity>
        <View style={[styles.preview, { width: Math.min(width - 150 * scale, 560 * scale), height: 235 * scale, borderRadius: 14 * scale, padding: 25 * scale }]}>
          <View style={styles.sizeSliderRow}>
            <Text style={[styles.tLabel, { fontSize: 22 * scale }]}>T</Text>
            <Slider style={{ width: Math.min(width * 0.42, 380 * scale), height: 45 * scale }} minimumValue={12} maximumValue={24} step={1} value={textSize} onValueChange={onTextSizeChange} minimumTrackTintColor="#168FD1" maximumTrackTintColor="#8FD0EC" thumbTintColor="#FFFFFF" accessibilityLabel="Tamaño del texto" />
            <Text style={[styles.tLabel, { fontSize: 36 * scale }]}>T</Text>
          </View>
          <Text style={[styles.previewText, { fontSize: textSize * scale, lineHeight: textSize * scale * 1.38 }]}>A primera vista era como cualquier otro gato - con orejas, bigotes y una larga cola. Pero tenía algo especial.</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableOpacity style={[styles.popoverClose, { right: 12 * scale, bottom: 158 * scale, width: 36 * scale, height: 36 * scale, borderRadius: 18 * scale }]} onPress={onClose} accessibilityLabel="Cerrar opciones"><Text style={[styles.popoverCloseText, { fontSize: 22 * scale }]}>×</Text></TouchableOpacity>
      <View style={[styles.popover, { right: 14 * scale, bottom: 66 * scale, width: 205 * scale, borderRadius: 12 * scale }]}>
        <MenuItem image={require('../assets/ui/ic_content_burger.png')} label="Índice" scale={scale} onPress={() => { onClose(); onOpenIndex(); }} />
        <MenuItem image={require('../assets/ui/ic_font_burger.png')} label="Tamaño del texto" scale={scale} onPress={() => setShowTextSize(true)} />
        <MenuItem image={require('../assets/ui/ic_lock.png')} label="Bloquear controles" scale={scale} onPress={onLock} last />
      </View>
    </View>
  );
}

function MenuItem({ image, label, scale, onPress, last = false }: { image: number; label: string; scale: number; onPress: () => void; last?: boolean }) {
  return <TouchableOpacity style={[styles.item, { height: 45 * scale, paddingHorizontal: 14 * scale }, !last && styles.itemBorder]} onPress={onPress} accessibilityLabel={label}><Image source={image} style={{ width: 22 * scale, height: 22 * scale, tintColor: '#168FD1' }} resizeMode="contain" /><Text style={[styles.itemText, { fontSize: 14 * scale }]}>{label}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  overlay: { zIndex: 220, backgroundColor: 'rgba(0,0,0,0.70)' },
  closeButton: { position: 'absolute', zIndex: 4, backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  preview: { position: 'absolute', alignSelf: 'center', top: '50%', marginTop: -117, backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center' },
  sizeSliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  tLabel: { color: '#168FD1', fontFamily: 'Montserrat-ExtraBold' },
  previewText: { color: '#303037', fontFamily: 'Montserrat-SemiBold', textAlign: 'center' },
  popover: { position: 'absolute', zIndex: 210, backgroundColor: '#F3F4EA', overflow: 'hidden', elevation: 8 },
  popoverClose: { position: 'absolute', zIndex: 211, backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center', elevation: 9 },
  popoverCloseText: { color: '#168FD1', fontFamily: 'Montserrat-ExtraBold', marginTop: -3 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  itemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C9CAC2' },
  itemText: { color: '#168FD1', fontFamily: 'Montserrat-SemiBold' },
});
