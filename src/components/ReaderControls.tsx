import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

interface ReaderControlsProps {
  animatedStyle: object; interactive: boolean; currentPage: number; totalPages: number;
  listenMode: boolean; isNarrating: boolean; isNarrationPaused: boolean; narrationVolume: number;
  musicEnabled: boolean; musicVolume: number; showText: boolean;
  onHome: () => void; onOpenMenu: () => void; onToggleNarration: () => void;
  onPauseNarration: () => void; onResumeNarration: () => void;
  onNarrationVolumeChange: (volume: number) => void; onToggleText: () => void;
  onToggleMusic: () => void; onMusicVolumeChange: (volume: number) => void;
}

export function ReaderControls(props: ReaderControlsProps) {
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.82, Math.min(1.25, Math.min(width / 904, height / 407)));
  const buttonSize = 50 * scale;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, props.animatedStyle]} pointerEvents={props.interactive ? 'box-none' : 'none'}>
      <TouchableOpacity style={[styles.roundButton, styles.homeButton, { width: 54 * scale, height: 54 * scale, borderRadius: 27 * scale, top: 12 * scale, left: 12 * scale }]} onPress={props.onHome} accessibilityLabel="Volver a la biblioteca">
        <Image source={require('../assets/ui/ic_home.png')} style={{ width: 31 * scale, height: 31 * scale }} resizeMode="contain" />
      </TouchableOpacity>
      <View style={[styles.pageCounter, { top: 13 * scale, right: 13 * scale, minWidth: 62 * scale, height: 35 * scale, borderRadius: 18 * scale }]}>
        <Text style={[styles.pageCounterText, { fontSize: 15 * scale }]}>{props.currentPage + 1}/{props.totalPages}</Text>
      </View>
      {(props.listenMode || props.isNarrating) && (
        <View style={[styles.voiceBar, { top: 13 * scale, width: 180 * scale, height: 45 * scale, borderRadius: 23 * scale, marginLeft: -90 * scale }]}>
          <TouchableOpacity style={[styles.voiceButton, { width: 34 * scale, height: 34 * scale, borderRadius: 17 * scale }]} onPress={props.isNarrating ? (props.isNarrationPaused ? props.onResumeNarration : props.onPauseNarration) : props.onToggleNarration} accessibilityLabel={props.isNarrationPaused ? 'Continuar narración' : 'Pausar narración'}>
            <Image source={props.isNarrationPaused || !props.isNarrating ? require('../assets/ui/ic_play.png') : require('../assets/ui/ic_pause.png')} style={{ width: 16 * scale, height: 16 * scale }} resizeMode="contain" />
          </TouchableOpacity>
          <Slider style={styles.voiceSlider} minimumValue={0} maximumValue={1} value={props.narrationVolume} onValueChange={props.onNarrationVolumeChange} minimumTrackTintColor="#E9F5FA" maximumTrackTintColor="#78CDF1" thumbTintColor="#F3F4EA" accessibilityLabel="Volumen de la narración" />
          <Image source={require('../assets/ui/ic_book_listen.png')} style={{ width: 20 * scale, height: 20 * scale, tintColor: '#FFFFFF' }} resizeMode="contain" />
        </View>
      )}
      <View style={[styles.bottomActions, { right: 12 * scale, bottom: 12 * scale, gap: 9 * scale }]}>
        <TouchableOpacity style={[styles.roundButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={props.onToggleMusic} accessibilityLabel={props.musicEnabled ? 'Silenciar música' : 'Activar música'}>
          <Image source={props.musicEnabled ? require('../assets/ui/ic_music_on.png') : require('../assets/ui/ic_music_off.png')} style={{ width: 27 * scale, height: 27 * scale, tintColor: '#168FD1' }} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roundButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={props.onOpenMenu} accessibilityLabel="Abrir opciones">
          <View style={[styles.hamburger, { width: 25 * scale, height: 20 * scale }]}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { zIndex: 100 },
  roundButton: { position: 'relative', backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.26, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  homeButton: { position: 'absolute' },
  pageCounter: { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4EA', elevation: 4 },
  pageCounterText: { color: '#168FD1', fontFamily: 'Montserrat-ExtraBold' },
  voiceBar: { position: 'absolute', left: '50%', backgroundColor: '#20A9E0', paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', elevation: 6 },
  voiceButton: { backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center' },
  voiceSlider: { flex: 1, height: 44 },
  bottomActions: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  hamburger: { justifyContent: 'space-between', paddingVertical: 2 },
  hamburgerLine: { width: '100%', height: 3, borderRadius: 2, backgroundColor: '#168FD1' },
});
