import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

interface SearchOverlayProps {
  visible: boolean;
  value: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function SearchOverlay({ visible, value, onSubmit, onClose }: SearchOverlayProps) {
  const { width, height } = useWindowDimensions();
  const [draft, setDraft] = useState(value);
  const entrance = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const scale = clamp(height / 407, 0.78, 1.08);

  useEffect(() => {
    if (!visible) return;
    setDraft(value);
    entrance.setValue(0);
    Animated.timing(entrance, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [visible, value, entrance]);

  const close = () => {
    Keyboard.dismiss();
    Animated.timing(entrance, { toValue: 0, duration: 130, useNativeDriver: true }).start(onClose);
  };

  const submit = () => {
    Keyboard.dismiss();
    onSubmit(draft.trim());
    Animated.timing(entrance, { toValue: 0, duration: 130, useNativeDriver: true }).start(onClose);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      <Pressable style={styles.modalRoot} onPress={close}>
        <Pressable
          style={[
            styles.sheetHitArea,
            {
              left: clamp(width * 0.045, 34, 72),
              right: clamp(width * 0.055, 40, 86),
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              styles.sheet,
              {
                opacity: entrance,
                transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
              },
            ]}
          >
            <View style={[styles.searchArea, { paddingTop: 12 * scale, paddingHorizontal: 8 * scale }]}>
              <TextInput
                ref={inputRef}
                value={draft}
                onChangeText={setDraft}
                placeholder="Escribe el texto que buscas..."
                placeholderTextColor="rgba(255,255,255,0.58)"
                style={[styles.input, { fontSize: 22 * scale, paddingRight: 150 * scale }]}
                returnKeyType="search"
                onSubmitEditing={submit}
                autoCorrect={false}
                autoCapitalize="sentences"
                selectTextOnFocus={false}
              />

              <TouchableOpacity
                style={[
                  styles.searchButton,
                  {
                    right: 18 * scale,
                    top: 122 * scale,
                    paddingHorizontal: 19 * scale,
                    height: 54 * scale,
                    borderRadius: 2 * scale,
                  },
                ]}
                onPress={submit}
                accessibilityRole="button"
                accessibilityLabel="Buscar"
              >
                <Text style={[styles.searchButtonText, { fontSize: 17 * scale }]}>BUSCAR</Text>
              </TouchableOpacity>

              <View style={[styles.underline, { left: 8 * scale, right: 160 * scale, bottom: 10 * scale }]} />
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sheetHitArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: '#170D0E',
  },
  searchArea: {
    flex: 1,
  },
  input: {
    height: 60,
    color: 'rgba(255,255,255,0.74)',
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '400',
    paddingVertical: 0,
  },
  searchButton: {
    position: 'absolute',
    backgroundColor: '#777275',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '500',
  },
  underline: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#FFB4B0',
  },
});
