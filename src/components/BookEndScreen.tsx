import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

export function BookEndScreen({
  color,
  title,
  author,
  illustrator,
  isFavorite,
  onReadAgain,
  onToggleFavorite,
  onShare,
  onClose,
}: BookEndScreenProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.fin}>FIN</Text>
      <Text style={styles.title}>{title}</Text>
      {!!author && <Text style={styles.credits}>Escrito por: {author}</Text>}
      {!!illustrator && <Text style={styles.credits}>Ilustrado por: {illustrator}</Text>}
      <Text style={styles.message}>~ Fin ~</Text>

      <View style={styles.actions}>
        <EndAction label="Leer otra vez" onPress={onReadAgain} />
        <EndAction
          label={isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
          onPress={onToggleFavorite}
          accessibilityLabel={isFavorite ? 'Sacar de favoritos' : 'Agregar a favoritos'}
        />
        <EndAction label="Compartir" onPress={onShare} />
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Volver a la biblioteca">
        <LinearGradient
          colors={[Colors.buttonGreenStart, Colors.buttonGreenEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.closeGradient}
        >
          <Text style={styles.closeText}>Volver a la biblioteca</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function EndAction({
  label,
  onPress,
  accessibilityLabel = label,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
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
