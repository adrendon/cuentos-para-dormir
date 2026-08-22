import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Gender } from '../types/book';
import { Colors } from '../theme/colors';

interface GenderSelectorProps {
  selected: Gender;
  onSelect: (gender: Gender) => void;
  label?: string;
}

export function GenderSelector({ selected, onSelect, label }: GenderSelectorProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
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
          <Image
            source={require('../assets/onboarding/ic_boy.png')}
            style={styles.icon}
            resizeMode="contain"
          />
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
          <Image
            source={require('../assets/onboarding/ic_girl.png')}
            style={styles.icon}
            resizeMode="contain"
          />
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardSelected: {
    borderColor: Colors.accentTurquoise,
    backgroundColor: 'rgba(20, 207, 201, 0.18)',
  },
  icon: {
    width: 64,
    height: 64,
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
