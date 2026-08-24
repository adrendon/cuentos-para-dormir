import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { LibraryFilters } from '../types/book';
import { Colors, Gradients } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface FilterModalProps {
  visible: boolean;
  filters: LibraryFilters;
  onChange: (filters: LibraryFilters) => void;
  onClear: () => void;
  onClose: () => void;
}

type ChipCategory = 'purple' | 'cyan' | 'orange';

const CHIPS: { key: keyof LibraryFilters; label: string; category: ChipCategory }[] = [
  { key: 'unread', label: 'No leídos aún', category: 'purple' },
  { key: 'favorites', label: 'Predilectos', category: 'purple' },
  { key: 'withVoice', label: 'Cuentos con narración', category: 'cyan' },
  { key: 'withoutVoice', label: 'Cuentos sin narración', category: 'cyan' },
  { key: 'short', label: 'Cuentos cortos', category: 'orange' },
  { key: 'long', label: 'Cuentos largos', category: 'orange' },
];

const CHIP_BORDER_COLORS: Record<ChipCategory, string> = {
  purple: Colors.chipPurple,
  cyan: Colors.chipBlue,
  orange: Colors.chipOrange,
};

export function FilterModal({ visible, filters, onChange, onClear, onClose }: FilterModalProps) {
  const toggleChip = (key: keyof LibraryFilters) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const hasActiveFilter = Object.values(filters).some(Boolean);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClear}
              accessibilityRole="button"
              accessibilityLabel="Restablecer filtros"
            >
              <Text style={styles.resetText}>Restablecer</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Filtro</Text>
          </View>

          <View style={styles.chipsWrap}>
            {CHIPS.map(({ key, label, category }) => {
              const isSelected = filters[key];
              const borderColor = CHIP_BORDER_COLORS[category];
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.chip,
                    { borderColor },
                    isSelected && { backgroundColor: borderColor },
                  ]}
                  onPress={() => toggleChip(key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClear}
              accessibilityRole="button"
              accessibilityLabel="Anular"
            >
              <Text style={styles.clearButtonText}>Anular</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButtonWrapper}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Aplicar"
              disabled={!hasActiveFilter}
            >
              {hasActiveFilter ? (
                <LinearGradient
                  colors={[...Gradients.blue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.applyButton}
                >
                  <Text style={styles.applyButtonText}>Aplicar</Text>
                </LinearGradient>
              ) : (
                <View style={styles.applyButtonDisabled}>
                  <Text style={styles.applyButtonTextDisabled}>Aplicar</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: Colors.tooltipBackground,
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resetText: {
    color: Colors.chipBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: Colors.backgroundDark,
    fontSize: 20,
    fontWeight: '800',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  chipText: {
    color: Colors.backgroundDark,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.textWhite,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2E80ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  applyButtonWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  applyButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B0B0B0',
    borderRadius: 24,
  },
  applyButtonText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  applyButtonTextDisabled: {
    color: '#E0E0E0',
    fontSize: 15,
    fontWeight: '700',
  },
});
