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

const CHIPS: { key: keyof LibraryFilters; label: string }[] = [
  { key: 'unread', label: 'No leídos aún' },
  { key: 'favorites', label: 'Predilectos' },
  { key: 'withVoice', label: 'Cuentos con narración' },
  { key: 'withoutVoice', label: 'Cuentos sin narración' },
  { key: 'short', label: 'Cuentos cortos' },
  { key: 'long', label: 'Cuentos largos' },
];

export function FilterModal({ visible, filters, onChange, onClear, onClose }: FilterModalProps) {
  const toggleChip = (key: keyof LibraryFilters) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtro</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Salir"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsWrap}>
            {CHIPS.map(({ key, label }) => {
              const isSelected = filters[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.chip, isSelected && styles.chipSelected]}
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
            >
              <LinearGradient
                colors={[...Gradients.primaryButton]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </LinearGradient>
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
    backgroundColor: '#F2F4DD',
    borderRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: Colors.backgroundDark,
    fontSize: 20,
    fontWeight: '800',
  },
  closeIcon: {
    color: Colors.backgroundDark,
    fontSize: 18,
    fontWeight: '700',
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
    backgroundColor: 'rgba(23, 18, 84, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(23, 18, 84, 0.15)',
  },
  chipSelected: {
    backgroundColor: Colors.accentCyan,
    borderColor: Colors.accentCyan,
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
    borderWidth: 1.5,
    borderColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.backgroundDark,
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
  applyButtonText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
});
