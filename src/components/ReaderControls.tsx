import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { Colors } from '../theme/colors';

interface ReaderControlsProps {
  animatedStyle: object;
  interactive: boolean;
  title: string;
  currentPage: number;
  totalPages: number;
  listenMode: boolean;
  isNarrating: boolean;
  isNarrationPaused: boolean;
  narrationVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  showText: boolean;
  onHome: () => void;
  onOpenMenu: () => void;
  onToggleNarration: () => void;
  onPauseNarration: () => void;
  onResumeNarration: () => void;
  onNarrationVolumeChange: (volume: number) => void;
  onToggleText: () => void;
  onToggleMusic: () => void;
  onMusicVolumeChange: (volume: number) => void;
  onLock: () => void;
}

export function ReaderControls(props: ReaderControlsProps) {
  return (
    <Animated.View style={[styles.container, props.animatedStyle]} pointerEvents={props.interactive ? 'auto' : 'none'}>
      <View style={styles.titleGroup}>
        <View style={styles.homeColumn}>
          <TouchableOpacity style={styles.homeButton} onPress={props.onHome} accessibilityLabel="Biblioteca">
            <Image source={require('../assets/ui/ic_home.png')} style={styles.homeIcon} />
          </TouchableOpacity>
          <Text style={styles.pageCounter}>{props.currentPage + 1}/{props.totalPages}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>{props.title}</Text>
      </View>

      {props.listenMode && props.isNarrating && (
        <View style={styles.voiceBar}>
          <TouchableOpacity
            style={styles.voicePauseButton}
            onPress={props.isNarrationPaused ? props.onResumeNarration : props.onPauseNarration}
            accessibilityLabel={props.isNarrationPaused ? 'Continuar narración' : 'Pausar narración'}
          >
            <Text style={styles.voicePauseIcon}>{props.isNarrationPaused ? '▶' : 'Ⅱ'}</Text>
          </TouchableOpacity>
          <Text style={styles.voiceLabel}>Voz</Text>
          <Slider
            style={styles.voiceSlider}
            minimumValue={0}
            maximumValue={1}
            value={props.narrationVolume}
            onValueChange={props.onNarrationVolumeChange}
            minimumTrackTintColor={Colors.accentTurquoise}
            maximumTrackTintColor="rgba(255,255,255,0.35)"
            thumbTintColor={Colors.textWhite}
            accessibilityLabel="Volumen de la narración"
          />
        </View>
      )}

      <View style={styles.rightControls}>
        <LabeledControl label="Menú" accessibilityLabel="Menú" onPress={props.onOpenMenu} image={require('../assets/ui/ic_content_burger.png')} />
        <LabeledControl
          label={props.isNarrating ? 'Detener' : 'Narrar'}
          accessibilityLabel={props.isNarrating ? 'Detener narración' : 'Escuchar narración'}
          onPress={props.onToggleNarration}
          image={require('../assets/ui/ic_book_listen.png')}
          active={props.isNarrating}
        />
        <LabeledControl
          label={props.showText ? 'Ocultar' : 'Texto'}
          accessibilityLabel={props.showText ? 'Ocultar texto' : 'Mostrar texto'}
          onPress={props.onToggleText}
          content={<Text style={styles.aaIcon}>Aa</Text>}
        />
        <LabeledControl
          label="Música"
          accessibilityLabel={props.musicEnabled ? 'Silenciar música' : 'Activar música'}
          onPress={props.onToggleMusic}
          image={props.musicEnabled ? require('../assets/onboarding/ic_music_on.png') : require('../assets/onboarding/ic_music_off.png')}
        />
        {props.musicEnabled && (
          <View style={styles.musicSliderWrap}>
            <Slider
              style={styles.musicSlider}
              minimumValue={0}
              maximumValue={1}
              value={props.musicVolume}
              onValueChange={props.onMusicVolumeChange}
              minimumTrackTintColor={Colors.accentYellow}
              maximumTrackTintColor="rgba(255,255,255,0.25)"
              thumbTintColor={Colors.accentYellow}
              accessibilityLabel="Volumen de la música"
            />
          </View>
        )}
        <LabeledControl label="Bloquear" accessibilityLabel="Bloquear pantalla" onPress={props.onLock} content={<View style={styles.lockShape} />} />
      </View>
    </Animated.View>
  );
}

function LabeledControl({ label, accessibilityLabel, onPress, image, content, active = false }: {
  label: string; accessibilityLabel: string; onPress: () => void; image?: number; content?: React.ReactNode; active?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.control, active && styles.controlActive]} onPress={onPress} accessibilityLabel={accessibilityLabel}>
      {image ? <Image source={image} style={styles.controlIcon} /> : content}
      <Text style={styles.controlLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 14, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 },
  titleGroup: { maxWidth: '34%', minHeight: 48, flexDirection: 'row', alignItems: 'center', borderRadius: 24, backgroundColor: 'rgba(10, 8, 38, 0.78)', paddingRight: 18 },
  homeColumn: { alignItems: 'center' },
  homeButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F6F4E8', justifyContent: 'center', alignItems: 'center' },
  homeIcon: { width: 27, height: 27, resizeMode: 'contain' },
  pageCounter: { color: Colors.textWhite, fontSize: 10, fontFamily: 'Montserrat-ExtraBold', marginTop: 3 },
  title: { flex: 1, color: Colors.titleGold, fontSize: 15, fontFamily: 'Montserrat-ExtraBold', marginLeft: 12 },
  rightControls: { flexDirection: 'row', gap: 6 },
  control: { minWidth: 68, height: 52, paddingHorizontal: 9, borderRadius: 16, backgroundColor: 'rgba(10, 8, 38, 0.78)', justifyContent: 'center', alignItems: 'center', gap: 2 },
  controlActive: { backgroundColor: Colors.chipOrange },
  controlIcon: { width: 21, height: 21, tintColor: Colors.textWhite, resizeMode: 'contain' },
  controlLabel: { color: Colors.textWhite, fontSize: 9, fontFamily: 'Montserrat-SemiBold' },
  aaIcon: { height: 21, color: Colors.textWhite, fontSize: 16, fontFamily: 'Montserrat-ExtraBold' },
  voiceBar: { height: 52, width: 210, paddingHorizontal: 8, borderRadius: 16, backgroundColor: 'rgba(10, 8, 38, 0.88)', flexDirection: 'row', alignItems: 'center' },
  voicePauseButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.accentTurquoise, justifyContent: 'center', alignItems: 'center' },
  voicePauseIcon: { color: '#FFF', fontSize: 15, fontFamily: 'Montserrat-ExtraBold' },
  voiceLabel: { color: '#FFF', fontSize: 10, marginLeft: 8 },
  voiceSlider: { flex: 1, height: 40 },
  musicSliderWrap: { width: 100, justifyContent: 'center' },
  musicSlider: { width: 100, height: 36 },
  lockShape: { width: 17, height: 15, marginTop: 3, borderRadius: 3, borderWidth: 3, borderColor: Colors.textWhite },
});
