import React, { useEffect, useRef, useCallback } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { BookPage } from '../types/book';
import { Colors } from '../theme/colors';

interface PageViewerProps {
  pages: BookPage[]; currentPage: number; onPageChange: (pageIndex: number) => void;
  onPageNavigationStart?: () => void; onFinish: () => void; onBackFromFirstPage?: () => void;
  coverColor: string; pageTexts?: Map<number, string>; showText: boolean; textSize?: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function PageViewer({ pages, currentPage, onPageChange, onPageNavigationStart, onFinish, onBackFromFirstPage, coverColor, pageTexts, showText, textSize = 14 }: PageViewerProps) {
  const pagerRef = useRef<PagerView>(null);
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const uiScale = clamp(shortSide / 407, 0.76, 1.18);
  const sideInset = clamp(width * 0.065, 48, 104);
  const textMinHeight = clamp(height * 0.22, 82, 142);
  const arrowWidth = clamp(shortSide * 0.128, 48, 64);
  const arrowHeight = clamp(shortSide * 0.187, 70, 92);
  // Reference places navigation arrows vertically centered against the text panel,
  // not touching the physical bottom edge of the screen.
  const arrowBottom = clamp(height * 0.075, 28, 54);

  useEffect(() => { pagerRef.current?.setPageWithoutAnimation(currentPage); }, [currentPage]);
  const handlePageSelected = useCallback((event: any) => onPageChange(event.nativeEvent.position), [onPageChange]);
  const goNext = useCallback(() => { onPageNavigationStart?.(); currentPage < pages.length - 1 ? pagerRef.current?.setPage(currentPage + 1) : onFinish(); }, [currentPage, pages.length, onFinish, onPageNavigationStart]);
  const goPrev = useCallback(() => { onPageNavigationStart?.(); if (currentPage > 0) pagerRef.current?.setPage(currentPage - 1); else onBackFromFirstPage?.(); }, [currentPage, onBackFromFirstPage, onPageNavigationStart]);

  if (pages.length === 0) return <View style={[styles.emptyContainer, { backgroundColor: coverColor }]}><ActivityIndicator size="large" color={Colors.textWhite} /><Text style={styles.loadingText}>Cargando páginas...</Text></View>;

  return (
    <View style={styles.container}>
      <PagerView ref={pagerRef} style={styles.pager} initialPage={currentPage} onPageSelected={handlePageSelected} onPageScrollStateChanged={(event) => { if (event.nativeEvent.pageScrollState === 'dragging') onPageNavigationStart?.(); }} orientation="horizontal">
        {pages.map((page) => {
          const textForPage = pageTexts?.get(page.pageNumber);
          return (
            <View key={`page-${page.pageNumber}`} style={styles.pageContainer}>
              <Image source={{ uri: page.uri }} style={styles.pageImage} resizeMode="cover" />
              {showText && textForPage && (
                <View style={[styles.textOverlay, { left: sideInset, right: sideInset, minHeight: textMinHeight, maxHeight: height * 0.32, borderTopLeftRadius: 12 * uiScale, borderTopRightRadius: 12 * uiScale, paddingHorizontal: clamp(width * 0.035, 28, 54), paddingVertical: clamp(height * 0.026, 9, 18) }]}>
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.textScrollContent}>
                    <Text style={[styles.pageText, { fontSize: clamp(textSize * uiScale, 13, 25), lineHeight: clamp(textSize * uiScale * 1.48, 20, 36) }]}>{textForPage}</Text>
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </PagerView>

      <Pressable style={[styles.arrowBtn, styles.leftArrow, { bottom: arrowBottom, width: arrowWidth, height: arrowHeight }]} onPress={goPrev} accessibilityLabel={currentPage === 0 ? 'Volver al menú' : 'Página anterior'}>
        {({ pressed }) => <Image source={pressed ? require('../assets/ui/ic_left_arrow_pressed.png') : require('../assets/ui/ic_left_arrow.png')} style={{ width: arrowWidth * 0.66, height: arrowHeight * 0.64, resizeMode: 'contain' }} />}
      </Pressable>
      <Pressable style={[styles.arrowBtn, styles.rightArrow, { bottom: arrowBottom, width: arrowWidth, height: arrowHeight }]} onPress={goNext} accessibilityLabel={currentPage === pages.length - 1 ? 'Terminar cuento' : 'Página siguiente'}>
        {({ pressed }) => <Image source={pressed ? require('../assets/ui/ic_right_arrow_pressed.png') : require('../assets/ui/ic_right_arrow.png')} style={{ width: arrowWidth * 0.66, height: arrowHeight * 0.64, resizeMode: 'contain' }} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' }, pager: { flex: 1 }, pageContainer: { flex: 1, backgroundColor: '#000' }, pageImage: { width: '100%', height: '100%' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, loadingText: { color: '#FFF', fontSize: 16, marginTop: 12 },
  textOverlay: { position: 'absolute', bottom: 0, backgroundColor: 'rgba(239, 239, 224, 0.96)', justifyContent: 'center' },
  textScrollContent: { flexGrow: 1, justifyContent: 'center' },
  pageText: { color: Colors.tooltipText, textAlign: 'center', fontFamily: 'Montserrat-SemiBold' },
  arrowBtn: { position: 'absolute', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', zIndex: 20 }, leftArrow: { left: 3 }, rightArrow: { right: 3 },
});
