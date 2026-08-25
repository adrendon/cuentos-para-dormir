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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function ReaderControls(props: ReaderControlsProps) {
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const uiScale = clamp(shortSide / 407, 0.76, 1.18);
  const edgeX = clamp(width * 0.022, 12, 34);
  const edgeY = clamp(height * 0.03, 10, 24);
  const buttonSize = clamp(shortSide * 0.123, 46, 62);
  const homeSize = clamp(shortSide * 0.133, 50, 66);
  const voiceWidth = clamp(width * 0.20, 170, 250);
  const voiceHeight = clamp(height * 0.11, 42, 58);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, props.animatedStyle]} pointerEvents={props.interactive ? 'box-none' : 'none'}>
      <TouchableOpacity style={[styles.roundButton, styles.homeButton, { width: homeSize, height: homeSize, borderRadius: homeSize / 2, top: edgeY, left: edgeX }]} onPress={props.onHome} accessibilityLabel="Volver a la biblioteca">
        <Image source={require('../assets/ui/ic_home.png')} style={{ width: homeSize * 0.57, height: homeSize * 0.57 }} resizeMode="contain" />
      </TouchableOpacity>

      <View style={[styles.pageCounter, { top: edgeY, right: edgeX, minWidth: clamp(width * 0.068, 60, 88), height: clamp(height * 0.086, 34, 46), borderRadius: 24 }]}>
        <Text style={[styles.pageCounterText, { fontSize: clamp(shortSide * 0.037, 14, 19) }]}>{props.currentPage + 1}/{props.totalPages}</Text>
      </View>

      {(props.listenMode || props.isNarrating) && (
        <View style={[styles.voiceBar, { top: edgeY, width: voiceWidth, height: voiceHeight, borderRadius: voiceHeight / 2, marginLeft: -voiceWidth / 2, paddingHorizontal: 8 * uiScale }]}>
          <TouchableOpacity style={[styles.voiceButton, { width: voiceHeight * 0.76, height: voiceHeight * 0.76, borderRadius: voiceHeight }]} onPress={props.isNarrating ? (props.isNarrationPaused ? props.onResumeNarration : props.onPauseNarration) : props.onToggleNarration} accessibilityLabel={props.isNarrationPaused ? 'Continuar narración' : 'Pausar narración'}>
            <Image source={props.isNarrationPaused || !props.isNarrating ? require('../assets/ui/ic_play.png') : require('../assets/ui/ic_pause.png')} style={{ width: voiceHeight * 0.34, height: voiceHeight * 0.34 }} resizeMode="contain" />
          </TouchableOpacity>
          <Slider style={styles.voiceSlider} minimumValue={0} maximumValue={1} value={props.narrationVolume} onValueChange={props.onNarrationVolumeChange} minimumTrackTintColor="#E9F5FA" maximumTrackTintColor="#78CDF1" thumbTintColor="#F3F4EA" accessibilityLabel="Volumen de la narración" />
          <Image source={require('../assets/ui/ic_book_listen.png')} style={{ width: 21 * uiScale, height: 21 * uiScale, tintColor: '#FFFFFF' }} resizeMode="contain" />
        </View>
      )}

      <View style={[styles.bottomActions, { right: edgeX, bottom: edgeY, gap: clamp(width * 0.008, 7, 13) }]}>
        <TouchableOpacity style={[styles.roundButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={props.onToggleMusic} accessibilityLabel={props.musicEnabled ? 'Silenciar música' : 'Activar música'}>
          <Image source={props.musicEnabled ? require('../assets/ui/ic_music_on.png') : require('../assets/ui/ic_music_off.png')} style={{ width: buttonSize * 0.54, height: buttonSize * 0.54, tintColor: '#168FD1' }} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roundButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={props.onOpenMenu} accessibilityLabel="Abrir opciones">
          <View style={[styles.hamburger, { width: buttonSize * 0.50, height: buttonSize * 0.40 }]}><View style={styles.hamburgerLine} /><View style={styles.hamburgerLine} /><View style={styles.hamburgerLine} /></View>
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
  voiceBar: { position: 'absolute', left: '50%', backgroundColor: '#20A9E0', flexDirection: 'row', alignItems: 'center', elevation: 6 },
  voiceButton: { backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center' },
  voiceSlider: { flex: 1, height: 44 },
  bottomActions: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  hamburger: { justifyContent: 'space-between', paddingVertical: 2 },
  hamburgerLine: { width: '100%', height: 3, borderRadius: 2, backgroundColor: '#168FD1' },
});
