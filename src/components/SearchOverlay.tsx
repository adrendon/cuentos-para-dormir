import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
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
  const closingRef = useRef(false);
  const scale = clamp(height / 407, 0.78, 1.08);
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    Keyboard.dismiss();
    Animated.timing(entrance, {
      toValue: 0,
      duration: 150,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      closingRef.current = false;
      onClose();
    });
  }, [entrance, onClose]);
  useEffect(() => {
    if (!visible) return;
    closingRef.current = false;
    setDraft(value);
    entrance.setValue(0);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 210,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => inputRef.current?.focus(), 90);
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      if (!closingRef.current) close();
    });
    return () => {
      clearTimeout(timer);
      hideSub.remove();
    };
  }, [visible, value, entrance, close]);
  const submit = () => {
    if (closingRef.current) return;
    onSubmit(draft.trim());
    close();
  };
  const top = clamp(height * 0.022, 12, 22);
  const barHeight = clamp(height * 0.09, 58, 72);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={close}
    >
      <Pressable style={styles.modalRoot} onPress={close}>
        <Pressable
          style={[
            styles.sheetHitArea,
            {
              left: clamp(width * 0.12, 110, 170),
              right: clamp(width * 0.22, 220, 320),
              top,
              height: barHeight,
              borderRadius: barHeight / 2,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.sheet,
              {
                borderRadius: barHeight / 2,
                opacity: entrance,
                transform: [
                  {
                    translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }),
                  },
                ],
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              placeholder="Escribe el texto que buscas…"
              placeholderTextColor="rgba(73,73,80,.55)"
              style={[styles.input, { fontSize: 22 * scale, paddingHorizontal: 28 * scale }]}
              returnKeyType="search"
              onSubmitEditing={submit}
              autoCorrect={false}
              autoCapitalize="sentences"
              selectTextOnFocus={false}
              disableFullscreenUI
            />
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalRoot: { flex: 1, backgroundColor: 'transparent' },
  sheetHitArea: { position: 'absolute', overflow: 'hidden' },
  sheet: { backgroundColor: '#F2F4DD' },
  input: { flex: 1, color: '#55565F', fontFamily: 'Montserrat-SemiBold', paddingVertical: 0 },
});
