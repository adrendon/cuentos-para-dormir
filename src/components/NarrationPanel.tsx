import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

interface NarrationPanelProps {
  narratorName: string;
  childName: string;
  coverColor: string;
  firstPageSource?: ImageSourcePropType;
  onSelectProfessional: () => void;
  onClose: () => void;
}

/**
 * Panel shown when the user taps "Escuchar" — displays available narrations
 * (professional and personal) before entering listening mode.
 */
export function NarrationPanel({
  narratorName,
  childName,
  coverColor,
  firstPageSource,
  onSelectProfessional,
  onClose,
}: NarrationPanelProps) {
  return (
    <View style={styles.container}>
      {/* Background image */}
      {firstPageSource && (
        <Image source={firstPageSource} style={styles.background} resizeMode="cover" />
      )}
      <View style={styles.shade} />

      {/* Small mode icons on the left */}
      <Animated.View entering={SlideInRight.duration(300)} style={styles.leftIcons}>
        <View style={styles.smallIconWrap}>
          <Image source={require('../assets/ui/ic_book_read.png')} style={styles.smallIcon} />
        </View>
        <View style={[styles.smallIconWrap, styles.smallIconActive]}>
          <Image source={require('../assets/ui/ic_book_listen.png')} style={styles.smallIcon} />
        </View>
        <View style={styles.smallIconWrap}>
          <View style={styles.micSmall}>
            <View style={styles.micHead} />
            <View style={styles.micStand} />
          </View>
        </View>
      </Animated.View>

      {/* Main content area */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.mainContent}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Cerrar">
          <Image source={require('../assets/ui/ic_close.png')} style={styles.closeIcon} />
        </TouchableOpacity>

        {/* Professional narrations section */}
        <Text style={styles.sectionTitle}>Narraciones profesionales</Text>

        <TouchableOpacity
          style={[styles.narrationCard, { borderColor: coverColor }]}
          onPress={onSelectProfessional}
          accessibilityLabel={`Escuchar narración de ${narratorName}`}
        >
          <Image source={require('../assets/ui/ic_book_listen.png')} style={styles.cardIcon} />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardNarrator}>{narratorName || 'Narrador profesional'}</Text>
            <Text style={styles.cardChild}>Para {childName || 'ti'}</Text>
          </View>
          <Image source={require('../assets/ui/ic_play.png')} style={styles.playIcon} />
        </TouchableOpacity>

        {/* Personal narrations section */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Narraciones personales</Text>
        <Text style={styles.emptyText}>El cuento no tiene tu narración</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  background: {
    ...(StyleSheet.absoluteFill as object),
    width: '100%',
    height: '100%',
  },
  shade: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(8, 4, 30, 0.78)',
  },
  leftIcons: {
    position: 'absolute',
    left: 18,
    top: '50%',
    marginTop: -80,
    gap: 12,
    zIndex: 10,
  },
  smallIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallIconActive: {
    backgroundColor: '#238FDD',
    borderWidth: 2,
    borderColor: '#25C8EE',
  },
  smallIcon: {
    width: 22,
    height: 22,
    tintColor: '#FFF',
    resizeMode: 'contain',
  },
  micSmall: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micHead: {
    width: 9,
    height: 14,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  micStand: {
    width: 14,
    height: 8,
    marginTop: -5,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFF',
    borderRadius: 7,
  },
  mainContent: {
    flex: 1,
    marginLeft: 80,
    paddingTop: 32,
    paddingRight: 32,
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  closeIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFF',
  },
  sectionTitle: {
    color: Colors.titleGold,
    fontSize: 16,
    fontFamily: 'Montserrat-ExtraBold',
    marginBottom: 12,
  },
  narrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  cardIcon: {
    width: 32,
    height: 32,
    tintColor: Colors.accentTurquoise,
    resizeMode: 'contain',
  },
  cardTextWrap: {
    flex: 1,
  },
  cardNarrator: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Montserrat-ExtraBold',
  },
  cardChild: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 2,
  },
  playIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFF',
    resizeMode: 'contain',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    fontStyle: 'italic',
  },
});
