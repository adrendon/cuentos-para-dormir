import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FilterType } from '../types/book';
import { Colors } from '../theme/colors';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'favorites', label: '★ Favoritos' },
  { key: 'unread', label: 'No leídos' },
];

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <View style={styles.container}>
      {FILTERS.map(({ key, label }) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.chip,
            activeFilter === key && styles.chipActive,
          ]}
          onPress={() => onFilterChange(key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeFilter === key }}
          accessibilityLabel={`Filtro: ${label}`}
        >
          <Text
            style={[
              styles.chipText,
              activeFilter === key && styles.chipTextActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipActive: {
    backgroundColor: Colors.chipGreen,
    borderColor: Colors.chipGreen,
  },
  chipText: {
    color: Colors.textGrayLight,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.textWhite,
  },
});
