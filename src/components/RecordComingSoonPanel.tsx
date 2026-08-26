import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

const BLUE_GRADIENT: [string, string] = ['#28D4EB', '#278BEC'];
const ORANGE_GRADIENT: [string, string] = ['#F6BD35', '#FF8E3B'];
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function RecordComingSoonPanel({ firstPageUri, onClose }: { firstPageUri?: string; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const uiScale = clamp(height / 407, 0.78, 1.08);
  const buttonWidth = Math.min(width * 0.22, 245 * uiScale);
  const buttonHeight = 52 * uiScale;
  const leftX = clamp(width * 0.154, 96, 225);
  const dividerLeft = leftX + buttonWidth + 30 * uiScale;
  const panelWidth = Math.min(width * 0.39, 430 * uiScale);
  const panelRight = clamp(width * 0.15, 90, 230);
  const menuTranslateY = -92 * uiScale;
  const panelTranslateY = -104 * uiScale;

  return (
    <View style={styles.container}>
      {!!firstPageUri && <Image source={{ uri: firstPageUri }} style={styles.background} resizeMode="cover" />}
      <View style={styles.shade} />

      <View style={[styles.modeMenu, { left: leftX, gap: 14 * uiScale, transform: [{ translateY: menuTranslateY }] }]}>
        <ModeButton label="Leer" icon={require('../assets/ui/ic_book_read.png')} width={buttonWidth} height={buttonHeight} scale={uiScale} onPress={onClose} colors={BLUE_GRADIENT} />
        <ModeButton label="Escuchar" icon={require('../assets/ui/ic_book_listen.png')} width={buttonWidth} height={buttonHeight} scale={uiScale} onPress={onClose} colors={BLUE_GRADIENT} />
        <TouchableOpacity style={{ width: buttonWidth, height: buttonHeight, borderRadius: buttonHeight / 2 }} disabled>
          <LinearGradient colors={ORANGE_GRADIENT} style={[styles.modeButton, { borderRadius: buttonHeight / 2, paddingHorizontal: 24 * uiScale }]}>
            <View style={[styles.microphoneIcon, { width: 32 * uiScale, height: 32 * uiScale }]}>
              <View style={[styles.microphoneHead, { width: 14 * uiScale, height: 23 * uiScale, borderRadius: 7 * uiScale, borderWidth: 2.5 * uiScale }]} />
              <View style={[styles.microphoneStand, { width: 21 * uiScale, height: 13 * uiScale, marginTop: -9 * uiScale, borderBottomWidth: 2.5 * uiScale, borderLeftWidth: 2.5 * uiScale, borderRightWidth: 2.5 * uiScale, borderRadius: 10 * uiScale }]} />
            </View>
            <Text style={[styles.modeLabel, { fontSize: 18 * uiScale }]}>Grabar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { left: dividerLeft, height: 190 * uiScale, marginTop: -95 * uiScale }]} />

      <Animated.View
        entering={SlideInRight.duration(430).springify().damping(18)}
        style={[
          styles.panel,
          {
            width: panelWidth,
            right: panelRight,
            borderRadius: 16 * uiScale,
            paddingHorizontal: 20 * uiScale,
            paddingVertical: 18 * uiScale,
            transform: [{ translateY: panelTranslateY }],
          },
        ]}
      >
        <TouchableOpacity style={[styles.closeButton, { width: 30 * uiScale, height: 30 * uiScale, borderRadius: 15 * uiScale }]} onPress={onClose} accessibilityLabel="Cerrar">
          <Image source={require('../assets/ui/ic_close.png')} style={{ width: 14 * uiScale, height: 14 * uiScale, tintColor: '#20A9E0' }} />
        </TouchableOpacity>
        <Text style={[styles.sectionTitle, { fontSize: 16 * uiScale }]}>Narraciones personales</Text>
        <Text style={[styles.description, { fontSize: 12.5 * uiScale }]}>Graba tu propia narración para este cuento</Text>
        <TouchableOpacity style={[styles.recordButton, { borderRadius: 24 * uiScale, paddingHorizontal: 20 * uiScale, paddingVertical: 11 * uiScale }]} disabled accessibilityLabel="Grabar (próximamente)">
          <View style={[styles.recordCircle, { width: 32 * uiScale, height: 32 * uiScale, borderRadius: 16 * uiScale }]}>
            <View style={[styles.recordDot, { width: 12 * uiScale, height: 12 * uiScale, borderRadius: 6 * uiScale }]} />
          </View>
          <Text style={[styles.recordText, { fontSize: 13 * uiScale }]}>Próximamente</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function ModeButton({ label, icon, width, height, scale, onPress, colors }: { label: string; icon: number; width: number; height: number; scale: number; onPress: () => void; colors: [string, string] }) {
  return (
    <TouchableOpacity style={{ width, height, borderRadius: height / 2 }} onPress={onPress}>
      <LinearGradient colors={colors} style={[styles.modeButton, { borderRadius: height / 2, paddingHorizontal: 24 * scale }]}>
        <Image source={icon} style={{ width: 32 * scale, height: 32 * scale }} resizeMode="contain" />
        <Text style={[styles.modeLabel, { fontSize: 18 * scale }]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  background: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  shade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8, 4, 30, 0.72)' },
  modeMenu: { position: 'absolute', top: '50%', alignItems: 'center' },
  modeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, borderWidth: 1.5, borderColor: '#25C8EE', elevation: 5 },
  modeLabel: { color: '#FFF', fontFamily: 'Montserrat-ExtraBold' },
  microphoneIcon: { alignItems: 'center', justifyContent: 'center' },
  microphoneHead: { borderColor: '#FFF' },
  microphoneStand: { borderColor: '#FFF' },
  divider: { position: 'absolute', top: '50%', width: 2, backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: 1 },
  panel: { position: 'absolute', top: '50%', backgroundColor: '#F3F4E4', elevation: 8, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  closeButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  sectionTitle: { color: '#20A9E0', fontFamily: 'Montserrat-ExtraBold', textAlign: 'center', marginBottom: 12 },
  description: { color: '#5F6578', fontFamily: 'Montserrat-SemiBold', textAlign: 'center', marginBottom: 20 },
  recordButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: 'rgba(95,101,120,0.12)', gap: 12, opacity: 0.62 },
  recordCircle: { borderWidth: 3, borderColor: '#FF8E3B', justifyContent: 'center', alignItems: 'center' },
  recordDot: { backgroundColor: '#FF8E3B' },
  recordText: { color: '#5F6578', fontFamily: 'Montserrat-SemiBold' },
});