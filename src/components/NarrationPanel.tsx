import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { useVirtualCanvas } from '../theme/virtualCanvas';

interface NarrationPanelProps {
  narratorName: string;
  childName: string;
  coverColor: string;
  firstPageSource?: ImageSourcePropType;
  musicEnabled?: boolean;
  onToggleMusic?: () => void;
  onHome?: () => void;
  onSelectProfessional: () => void;
  onClose: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function NarrationPanel({
  narratorName,
  childName,
  coverColor,
  firstPageSource,
  musicEnabled = true,
  onToggleMusic,
  onHome,
  onSelectProfessional,
  onClose,
}: NarrationPanelProps) {
  const { width, height } = useVirtualCanvas();
  const uiScale = clamp(height / 407, 0.78, 1.08);
  const roundSize = 54 * uiScale;
  const buttonWidth = Math.min(width * 0.22, 245 * uiScale);
  const buttonHeight = 52 * uiScale;
  const leftX = clamp(width * 0.154, 96, 225);
  const menuTranslateY = -92 * uiScale;
  const dividerLeft = leftX + buttonWidth + 30 * uiScale;
  const panelWidth = Math.min(width * 0.39, 430 * uiScale);
  const panelRight = clamp(width * 0.15, 90, 230);
  const panelTranslateY = -104 * uiScale;

  return (
    <View style={styles.container}>
      {firstPageSource && (
        <Image source={firstPageSource} style={styles.background} resizeMode="cover" />
      )}
      <View style={styles.shade} />

      <TouchableOpacity
        style={[
          styles.roundButton,
          {
            width: roundSize,
            height: roundSize,
            borderRadius: roundSize / 2,
            top: 14 * uiScale,
            left: 14 * uiScale,
          },
        ]}
        onPress={onHome ?? onClose}
        accessibilityLabel="Biblioteca"
      >
        <Image
          source={require('../assets/ui/ic_home.png')}
          style={{ width: 34 * uiScale, height: 34 * uiScale }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.roundButton,
          {
            width: roundSize,
            height: roundSize,
            borderRadius: roundSize / 2,
            top: 14 * uiScale,
            right: 14 * uiScale,
          },
        ]}
        onPress={onToggleMusic}
        accessibilityLabel="Música"
      >
        <Image
          source={
            musicEnabled
              ? require('../assets/onboarding/ic_music_on.png')
              : require('../assets/onboarding/ic_music_off.png')
          }
          style={{ width: 28 * uiScale, height: 28 * uiScale, tintColor: '#168FD1' }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Animated.View
        entering={FadeIn.duration(260)}
        style={[
          styles.modeMenu,
          { left: leftX, gap: 14 * uiScale, transform: [{ translateY: menuTranslateY }] },
        ]}
      >
        <ModeButton
          label="Leer"
          icon={require('../assets/ui/ic_book_read.png')}
          width={buttonWidth}
          height={buttonHeight}
          scale={uiScale}
          onPress={onClose}
        />
        <ModeButton
          label="Escuchar"
          icon={require('../assets/ui/ic_book_listen.png')}
          width={buttonWidth}
          height={buttonHeight}
          scale={uiScale}
          onPress={() => {}}
          colors={['#F6BD35', '#FF8E3B']}
        />
        <TouchableOpacity
          style={{ width: buttonWidth, height: buttonHeight, borderRadius: buttonHeight / 2 }}
          onPress={onClose}
        >
          <LinearGradient
            colors={['#28D4EB', '#278BEC']}
            style={[
              styles.modeButton,
              { borderRadius: buttonHeight / 2, paddingHorizontal: 24 * uiScale },
            ]}
          >
            <View style={[styles.microphoneIcon, { width: 32 * uiScale, height: 32 * uiScale }]}>
              <View
                style={[
                  styles.microphoneHead,
                  {
                    width: 14 * uiScale,
                    height: 23 * uiScale,
                    borderRadius: 7 * uiScale,
                    borderWidth: 2.5 * uiScale,
                  },
                ]}
              />
              <View
                style={[
                  styles.microphoneStand,
                  {
                    width: 21 * uiScale,
                    height: 13 * uiScale,
                    marginTop: -9 * uiScale,
                    borderBottomWidth: 2.5 * uiScale,
                    borderLeftWidth: 2.5 * uiScale,
                    borderRightWidth: 2.5 * uiScale,
                    borderRadius: 10 * uiScale,
                  },
                ]}
              />
            </View>
            <Text style={[styles.modeLabel, { fontSize: 18 * uiScale }]}>Grabar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <View
        style={[
          styles.divider,
          { left: dividerLeft, height: 190 * uiScale, marginTop: -95 * uiScale },
        ]}
      />

      <Animated.View
        entering={SlideInRight.duration(430).springify().damping(18)}
        style={[
          styles.panel,
          {
            width: panelWidth,
            right: panelRight,
            borderRadius: 16 * uiScale,
            paddingHorizontal: 18 * uiScale,
            paddingVertical: 14 * uiScale,
            transform: [{ translateY: panelTranslateY }],
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { fontSize: 16 * uiScale }]}>
          Narraciones profesionales
        </Text>

        <TouchableOpacity
          style={[
            styles.narrationCard,
            {
              borderColor: coverColor,
              borderRadius: 11 * uiScale,
              paddingHorizontal: 14 * uiScale,
              paddingVertical: 10 * uiScale,
            },
          ]}
          onPress={onSelectProfessional}
          accessibilityLabel={`Escuchar narración de ${narratorName}`}
        >
          <Image
            source={require('../assets/ui/ic_book_listen.png')}
            style={[styles.cardIcon, { width: 27 * uiScale, height: 27 * uiScale }]}
          />
          <View style={styles.cardTextWrap}>
            <Text style={[styles.cardNarrator, { fontSize: 13.5 * uiScale }]}>
              {narratorName || 'Narrador profesional'}
            </Text>
            <Text style={[styles.cardChild, { fontSize: 11.5 * uiScale }]}>
              Para {childName || 'ti'}
            </Text>
          </View>
          <Image
            source={require('../assets/ui/ic_play.png')}
            style={[styles.playIcon, { width: 24 * uiScale, height: 24 * uiScale }]}
          />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { fontSize: 16 * uiScale, marginTop: 12 * uiScale }]}>
          Narraciones personales
        </Text>
        <Text style={[styles.emptyText, { fontSize: 12.5 * uiScale }]}>
          El cuento no tiene tu narración
        </Text>
      </Animated.View>
    </View>
  );
}

function ModeButton({
  label,
  icon,
  width,
  height,
  scale,
  onPress,
  colors = ['#28D4EB', '#278BEC'],
}: {
  label: string;
  icon: number;
  width: number;
  height: number;
  scale: number;
  onPress: () => void;
  colors?: [string, string];
}) {
  return (
    <TouchableOpacity style={{ width, height, borderRadius: height / 2 }} onPress={onPress}>
      <LinearGradient
        colors={colors}
        style={[styles.modeButton, { borderRadius: height / 2, paddingHorizontal: 24 * scale }]}
      >
        <Image
          source={icon}
          style={{ width: 32 * scale, height: 32 * scale }}
          resizeMode="contain"
        />
        <Text style={[styles.modeLabel, { fontSize: 18 * scale }]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  shade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8, 4, 30, 0.72)',
  },
  roundButton: {
    position: 'absolute',
    zIndex: 20,
    backgroundColor: '#F6F4E8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modeMenu: { position: 'absolute', top: '50%', alignItems: 'center' },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#25C8EE',
    elevation: 5,
  },
  modeLabel: { color: '#FFF', fontFamily: 'Montserrat-ExtraBold' },
  microphoneIcon: { alignItems: 'center', justifyContent: 'center' },
  microphoneHead: { borderColor: '#FFF' },
  microphoneStand: { borderColor: '#FFF' },
  divider: {
    position: 'absolute',
    top: '50%',
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 1,
  },
  panel: {
    position: 'absolute',
    top: '50%',
    backgroundColor: '#F3F4E4',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  sectionTitle: {
    color: '#20A9E0',
    fontFamily: 'Montserrat-ExtraBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  narrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B8F0A8',
    borderWidth: 2,
    gap: 10,
  },
  cardIcon: { tintColor: '#20A9E0', resizeMode: 'contain' },
  cardTextWrap: { flex: 1 },
  cardNarrator: { color: '#4D536A', fontFamily: 'Montserrat-ExtraBold' },
  cardChild: { color: '#5F6578', fontFamily: 'Montserrat-SemiBold', marginTop: 2 },
  playIcon: { tintColor: '#FFFFFF', resizeMode: 'contain' },
  emptyText: { color: '#5F6578', fontFamily: 'Montserrat-SemiBold', textAlign: 'center' },
});
