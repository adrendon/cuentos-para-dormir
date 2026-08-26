import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

interface BookEndScreenProps {
  color: string;
  title: string;
  author?: string;
  illustrator?: string;
  isFavorite: boolean;
  onReadAgain: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onClose: () => void;
}

export function BookEndScreen({ color, title, author, illustrator, isFavorite, onReadAgain, onToggleFavorite, onShare, onClose }: BookEndScreenProps) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entrance.setValue(0);
    Animated.timing(entrance, { toValue: 1, duration: 650, useNativeDriver: true }).start();
  }, [entrance]);

  const motion = (start: number) => ({
    opacity: entrance.interpolate({ inputRange: [start, Math.min(1, start + 0.35)], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [{ translateY: entrance.interpolate({ inputRange: [start, Math.min(1, start + 0.35)], outputRange: [18, 0], extrapolate: 'clamp' }) }],
  });

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Animated.View style={motion(0)}><Text style={styles.fin}>FIN</Text></Animated.View>
      <Animated.View style={[styles.copy, motion(0.10)]}>
        <Text style={styles.title}>{title}</Text>
        {!!author && <Text style={styles.credits}>Escrito por: {author}</Text>}
        {!!illustrator && <Text style={styles.credits}>Ilustrado por: {illustrator}</Text>}
        <Text style={styles.message}>~ Fin ~</Text>
      </Animated.View>

      <Animated.View style={[styles.actions, motion(0.28)]}>
        <EndAction label="Leer otra vez" onPress={onReadAgain} />
        <EndAction label={isFavorite ? 'En favoritos' : 'Agregar a favoritos'} onPress={onToggleFavorite} accessibilityLabel={isFavorite ? 'Sacar de favoritos' : 'Agregar a favoritos'} />
        <EndAction label="Compartir" onPress={onShare} />
      </Animated.View>

      <Animated.View style={motion(0.46)}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Volver a la biblioteca">
          <LinearGradient colors={[Colors.buttonGreenStart, Colors.buttonGreenEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.closeGradient}>
            <Text style={styles.closeText}>Volver a la biblioteca</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function EndAction({ label, onPress, accessibilityLabel = label }: { label: string; onPress: () => void; accessibilityLabel?: string }) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  copy: { alignItems: 'center' },
  fin: { color: Colors.titleGold, fontSize: 32, fontFamily: 'Montserrat-ExtraBold', marginBottom: 20 },
  title: { color: Colors.textWhite, fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  credits: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginBottom: 4 },
  message: { color: Colors.titleGold, fontSize: 22, fontWeight: '700', marginTop: 20, marginBottom: 32 },
  actions: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  actionButton: { alignItems: 'center', width: 90 },
  actionText: { color: Colors.textWhite, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  closeButton: { borderRadius: 28, overflow: 'hidden' },
  closeGradient: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 28 },
  closeText: { color: Colors.textWhite, fontSize: 16, fontWeight: '700' },
});
