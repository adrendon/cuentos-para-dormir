import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Gender } from '../types/book';
import { Colors } from '../theme/colors';

interface GenderSelectorProps {
  selected: Gender;
  onSelect: (gender: Gender) => void;
}

export function GenderSelector({ selected, onSelect }: GenderSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>¿Quién va a leer?</Text>
      <View style={styles.cardsRow}>
        {/* Boy card */}
        <TouchableOpacity
          style={[
            styles.card,
            selected === 'boy' && styles.cardSelected,
          ]}
          onPress={() => onSelect('boy')}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === 'boy' }}
          accessibilityLabel="Niño"
        >
          <Text style={styles.emoji}>👦</Text>
          <Text style={[styles.cardText, selected === 'boy' && styles.cardTextSelected]}>
            Niño
          </Text>
        </TouchableOpacity>

        {/* Girl card */}
        <TouchableOpacity
          style={[
            styles.card,
            selected === 'girl' && styles.cardSelected,
          ]}
          onPress={() => onSelect('girl')}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === 'girl' }}
          accessibilityLabel="Niña"
        >
          <Text style={styles.emoji}>👧</Text>
          <Text style={[styles.cardText, selected === 'girl' && styles.cardTextSelected]}>
            Niña
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  label: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  card: {
    width: 130,
    height: 150,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.buttonBlueStart,
    backgroundColor: 'rgba(54, 91, 237, 0.15)',
  },
  emoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  cardText: {
    color: Colors.textGrayLight,
    fontSize: 16,
    fontWeight: '600',
  },
  cardTextSelected: {
    color: Colors.textWhite,
  },
});
