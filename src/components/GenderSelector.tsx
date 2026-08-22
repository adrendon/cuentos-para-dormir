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
            source={
              selected === 'boy'
                ? require('../assets/onboarding/ic_boy_on.png')
                : require('../assets/onboarding/ic_boy.png')
            }
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
            source={
              selected === 'girl'
                ? require('../assets/onboarding/ic_girl_on.png')
                : require('../assets/onboarding/ic_girl.png')
            }
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
    fontFamily: 'BalooBhaijaan',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  card: {
    width: 140,
    height: 160,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardSelected: {
    borderColor: Colors.accentTurquoise,
    backgroundColor: 'rgba(20, 207, 201, 0.15)',
  },
  icon: {
    width: 72,
    height: 72,
    marginBottom: 10,
  },
  cardText: {
    color: Colors.textGrayLight,
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  cardTextSelected: {
    color: Colors.textWhite,
  },
});
