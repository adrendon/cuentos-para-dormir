import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

interface ReaderControlsProps {
  animatedStyle: object;
  interactive: boolean;
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
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function ReaderControls(props: ReaderControlsProps) {
  const { width, height } = useWindowDimensions();
  const uiScale = clamp(height / 407, 0.78, 1.08);
  const edgeX = clamp(width * 0.02, 14, 28);
  const edgeY = 14 * uiScale;
  const buttonSize = 50 * uiScale;
  const homeSize = 54 * uiScale;
  const voiceWidth = Math.min(width * 0.21, 220 * uiScale);
  const voiceHeight = 44 * uiScale;
  const counterWidth = 54 * uiScale;
  const counterHeight = 28 * uiScale;
  const rightGap = 8 * uiScale;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, props.animatedStyle]}
      pointerEvents={props.interactive ? 'box-none' : 'none'}
    >
      <TouchableOpacity
        style={[
          styles.roundButton,
          styles.homeButton,
          {
            width: homeSize,
            height: homeSize,
            borderRadius: homeSize / 2,
            top: edgeY,
            left: edgeX,
          },
        ]}
        onPress={props.onHome}
        accessibilityLabel="Volver a la biblioteca"
      >
        <Image
          source={require('../assets/ui/ic_home.png')}
          style={{ width: homeSize * 0.56, height: homeSize * 0.56 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View
        style={[
          styles.pageCounter,
          {
            top: edgeY + homeSize + 6 * uiScale,
            left: edgeX + (homeSize - counterWidth) / 2,
            width: counterWidth,
            height: counterHeight,
            borderRadius: counterHeight / 2,
          },
        ]}
      >
        <Text style={[styles.pageCounterText, { fontSize: 12.5 * uiScale }]}>
          {props.currentPage + 1}/{props.totalPages}
        </Text>
      </View>

      {(props.listenMode || props.isNarrating) && (
        <View
          style={[
            styles.voiceBar,
            {
              top: edgeY,
              width: voiceWidth,
              height: voiceHeight,
              borderRadius: voiceHeight / 2,
              marginLeft: -voiceWidth / 2,
              paddingHorizontal: 7 * uiScale,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.voiceButton,
              { width: voiceHeight * 0.72, height: voiceHeight * 0.72, borderRadius: voiceHeight },
            ]}
            onPress={
              props.isNarrating
                ? props.isNarrationPaused
                  ? props.onResumeNarration
                  : props.onPauseNarration
                : props.onToggleNarration
            }
            accessibilityLabel={
              props.isNarrationPaused ? 'Continuar narración' : 'Pausar narración'
            }
          >
            <Image
              source={
                props.isNarrationPaused || !props.isNarrating
                  ? require('../assets/ui/ic_play.png')
                  : require('../assets/ui/ic_pause.png')
              }
              style={{ width: voiceHeight * 0.31, height: voiceHeight * 0.31 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Slider
            style={styles.voiceSlider}
            minimumValue={0}
            maximumValue={1}
            value={props.narrationVolume}
            onValueChange={props.onNarrationVolumeChange}
            minimumTrackTintColor="#E9F5FA"
            maximumTrackTintColor="#78CDF1"
            thumbTintColor="#F3F4EA"
            accessibilityLabel="Volumen de la narración"
          />
          <Image
            source={require('../assets/ui/ic_book_listen.png')}
            style={{ width: 19 * uiScale, height: 19 * uiScale, tintColor: '#FFFFFF' }}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={[styles.rightActions, { top: edgeY, right: edgeX, gap: rightGap }]}>
        <TouchableOpacity
          style={[
            styles.roundButton,
            { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          ]}
          onPress={props.onToggleMusic}
          accessibilityLabel={props.musicEnabled ? 'Silenciar música' : 'Activar música'}
        >
          <Image
            source={
              props.musicEnabled
                ? require('../assets/ui/ic_music_on.png')
                : require('../assets/ui/ic_music_off.png')
            }
            style={{ width: buttonSize * 0.52, height: buttonSize * 0.52, tintColor: '#168FD1' }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuPill,
            { width: buttonSize * 0.94, height: 31 * uiScale, borderRadius: 16 * uiScale },
          ]}
          onPress={props.onOpenMenu}
          accessibilityLabel="Abrir opciones"
        >
          <View style={[styles.hamburger, { width: 20 * uiScale, height: 14 * uiScale }]}>
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
  roundButton: {
    backgroundColor: '#F3F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.26,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  homeButton: { position: 'absolute' },
  pageCounter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4EA',
    elevation: 4,
  },
  pageCounterText: { color: '#168FD1', fontFamily: 'Montserrat-ExtraBold' },
  voiceBar: {
    position: 'absolute',
    left: '50%',
    backgroundColor: '#20A9E0',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },
  voiceButton: { backgroundColor: '#F3F4EA', justifyContent: 'center', alignItems: 'center' },
  voiceSlider: { flex: 1, height: 38 },
  rightActions: { position: 'absolute', alignItems: 'center' },
  menuPill: {
    backgroundColor: '#F3F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  hamburger: { justifyContent: 'space-between', paddingVertical: 1 },
  hamburgerLine: { width: '100%', height: 2.6, borderRadius: 2, backgroundColor: '#168FD1' },
});
