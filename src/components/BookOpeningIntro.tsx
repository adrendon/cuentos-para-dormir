import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { Colors } from '../theme/colors';

interface BookOpeningIntroProps {
  coverColor: string;
  title: string;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onClose: () => void;
  onSelectMode: (mode: 'read' | 'listen') => void;
}

/** Book-opening intro shown before entering a story: pick Leer or Escuchar. */
export function BookOpeningIntro({
  coverColor,
  title,
  musicEnabled,
  onToggleMusic,
  onClose,
  onSelectMode,
}: BookOpeningIntroProps) {
  const bookScale = useRef(new Animated.Value(0.3)).current;
  const bookOpacity = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(bookScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(bookOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(menuOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: coverColor }]}>
      <View style={styles.darkOverlay} />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Volver a la biblioteca"
        >
          <Image
            source={require('../assets/ui/ic_home.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onToggleMusic}
          accessibilityRole="button"
          accessibilityLabel={musicEnabled ? 'Silenciar música' : 'Activar música'}
        >
          <Image
            source={
              musicEnabled
                ? require('../assets/onboarding/ic_music_on.png')
                : require('../assets/onboarding/ic_music_off.png')
            }
            style={styles.musicIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.bookWrapper,
          { opacity: bookOpacity, transform: [{ scale: bookScale }] },
        ]}
      >
        <Text style={styles.bookEmoji}>📖</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </Animated.View>

      <Animated.View style={[styles.menu, { opacity: menuOpacity }]}>
        <TouchableOpacity
          style={[styles.modeCard, styles.modeCardRead]}
          onPress={() => onSelectMode('read')}
          accessibilityRole="button"
          accessibilityLabel="Leer"
        >
          <Image
            source={require('../assets/ui/ic_book_read.png')}
            style={styles.modeIcon}
            resizeMode="contain"
          />
          <Text style={styles.modeLabel}>Leer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, styles.modeCardListen]}
          onPress={() => onSelectMode('listen')}
          accessibilityRole="button"
          accessibilityLabel="Escuchar"
        >
          <Image
            source={require('../assets/ui/ic_book_listen.png')}
            style={styles.modeIcon}
            resizeMode="contain"
          />
          <Text style={styles.modeLabel}>Escuchar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  topBar: {
    position: 'absolute',
    top: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 22,
    height: 22,
    tintColor: Colors.textWhite,
  },
  musicIconImage: {
    width: 20,
    height: 20,
  },
  bookWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  bookEmoji: {
    fontSize: 96,
    marginBottom: 12,
  },
  title: {
    color: Colors.textWhite,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  menu: {
    flexDirection: 'row',
    gap: 24,
  },
  modeCard: {
    width: 120,
    height: 130,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  modeCardRead: {
    backgroundColor: 'rgba(62, 112, 220, 0.85)',
  },
  modeCardListen: {
    backgroundColor: 'rgba(37, 200, 238, 0.85)',
  },
  modeIcon: {
    width: 44,
    height: 44,
  },
  modeLabel: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
});
