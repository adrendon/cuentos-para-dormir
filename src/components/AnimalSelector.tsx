import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AVAILABLE_AVATARS, AvatarType } from '../types/book';
import { Colors } from '../theme/colors';

// Emoji mapping for each animal avatar
const ANIMAL_EMOJIS: Record<AvatarType, string> = {
  bear: '🐻',
  bunny: '🐰',
  cat: '🐱',
  dog: '🐶',
  elephant: '🐘',
  fox: '🦊',
  giraffe: '🦒',
  koala: '🐨',
  lion: '🦁',
  owl: '🦉',
  panda: '🐼',
  penguin: '🐧',
};

const ANIMAL_NAMES: Record<AvatarType, string> = {
  bear: 'Oso',
  bunny: 'Conejo',
  cat: 'Gato',
  dog: 'Perro',
  elephant: 'Elefante',
  fox: 'Zorro',
  giraffe: 'Jirafa',
  koala: 'Koala',
  lion: 'León',
  owl: 'Búho',
  panda: 'Panda',
  penguin: 'Pingüino',
};

interface AnimalSelectorProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

export function AnimalSelector({ selected, onSelect }: AnimalSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Elige tu animal favorito</Text>
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {AVAILABLE_AVATARS.map((animal) => (
          <TouchableOpacity
            key={animal}
            style={[styles.animalCard, selected === animal && styles.animalCardSelected]}
            onPress={() => onSelect(animal)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === animal }}
            accessibilityLabel={`Seleccionar ${ANIMAL_NAMES[animal]}`}
          >
            <Text style={styles.animalEmoji}>{ANIMAL_EMOJIS[animal]}</Text>
            <Text style={[styles.animalName, selected === animal && styles.animalNameSelected]}>
              {ANIMAL_NAMES[animal]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    flex: 1,
  },
  label: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 20,
  },
  animalCard: {
    width: 85,
    height: 95,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  animalCardSelected: {
    borderColor: Colors.chipOrange,
    backgroundColor: 'rgba(248, 153, 0, 0.15)',
  },
  animalEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  animalName: {
    color: Colors.textGrayLight,
    fontSize: 11,
    fontWeight: '600',
  },
  animalNameSelected: {
    color: Colors.textWhite,
  },
});
