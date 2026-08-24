import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';

interface ReaderMenuProps {
  visible: boolean;
  textSize: number;
  onClose: () => void;
  onOpenIndex: () => void;
  onIncrementTextSize: () => void;
  onDecrementTextSize: () => void;
}

/**
 * Hamburger menu that slides in from the right.
 * Contains text size controls, page index access, and report placeholder.
 */
export function ReaderMenu({
  visible,
  textSize,
  onClose,
  onOpenIndex,
  onIncrementTextSize,
  onDecrementTextSize,
}: ReaderMenuProps) {
  const translateX = useSharedValue(300);
  const backdropOpacity = useSharedValue(0);
  const [showTextPanel, setShowTextPanel] = React.useState(false);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateX.value = withTiming(300, { duration: 220, easing: Easing.in(Easing.cubic) });
      backdropOpacity.value = withTiming(0, { duration: 200 });
      setShowTextPanel(false);
    }
  }, [visible]);

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dark backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Slide-in panel */}
      <Animated.View style={[styles.panel, menuStyle]}>
        {!showTextPanel ? (
          <>
            {/* Text size option */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowTextPanel(true)}
              accessibilityLabel="Tamaño de texto"
            >
              <Image
                source={require('../assets/ui/ic_font_burger.png')}
                style={styles.menuIcon}
              />
              <Text style={styles.menuLabel}>Tamaño de texto</Text>
            </TouchableOpacity>

            {/* Page index option */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                onOpenIndex();
              }}
              accessibilityLabel="Índice de páginas"
            >
              <Image
                source={require('../assets/ui/ic_content_burger.png')}
                style={styles.menuIcon}
              />
              <Text style={styles.menuLabel}>Índice</Text>
            </TouchableOpacity>

            {/* Report option (placeholder) */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {}}
              accessibilityLabel="Reportar"
            >
              <Image
                source={require('../assets/ui/ic_flag_burger.png')}
                style={styles.menuIcon}
              />
              <Text style={styles.menuLabel}>Reportar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Text size sub-panel */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowTextPanel(false)}
              accessibilityLabel="Volver"
            >
              <Image
                source={require('../assets/ui/ic_left_arrow.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>

            <Text style={styles.subPanelTitle}>Tamaño de texto</Text>
            <Text style={styles.sizePreview}>Aa ({textSize})</Text>

            <View style={styles.sizeControls}>
              <TouchableOpacity
                style={[styles.sizeBtn, textSize <= 10 && styles.sizeBtnDisabled]}
                onPress={onDecrementTextSize}
                disabled={textSize <= 10}
                accessibilityLabel="Reducir texto"
              >
                <Text style={styles.sizeBtnText}>A-</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sizeBtn, textSize >= 24 && styles.sizeBtnDisabled]}
                onPress={onIncrementTextSize}
                disabled={textSize >= 24}
                accessibilityLabel="Aumentar texto"
              >
                <Text style={styles.sizeBtnText}>A+</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 240,
    backgroundColor: 'rgba(15, 12, 50, 0.96)',
    paddingTop: 28,
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  menuIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.textWhite,
    resizeMode: 'contain',
  },
  menuLabel: {
    color: Colors.textWhite,
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  backIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFF',
    resizeMode: 'contain',
  },
  subPanelTitle: {
    color: Colors.titleGold,
    fontSize: 16,
    fontFamily: 'Montserrat-ExtraBold',
    marginBottom: 16,
  },
  sizePreview: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sizeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  sizeBtn: {
    width: 64,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#238FDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBtnDisabled: {
    opacity: 0.35,
  },
  sizeBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Montserrat-ExtraBold',
  },
});
