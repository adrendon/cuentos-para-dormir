import React, { useEffect, useRef, useCallback } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { BookPage } from '../types/book';
import { Colors } from '../theme/colors';

interface PageViewerProps { pages: BookPage[]; currentPage: number; onPageChange: (pageIndex: number) => void; onPageNavigationStart?: () => void; onFinish: () => void; onBackFromFirstPage?: () => void; coverColor: string; pageTexts?: Map<number, string>; showText: boolean; textSize?: number; }
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function PageViewer({ pages, currentPage, onPageChange, onPageNavigationStart, onFinish, onBackFromFirstPage, coverColor, pageTexts, showText, textSize = 14 }: PageViewerProps) {
  const pagerRef = useRef<PagerView>(null);
  const { width, height } = useWindowDimensions();
  const uiScale = clamp(height / 407, 0.78, 1.08);
  const sideInset = clamp(width * 0.064, 70, 100);
  const textMinHeight = 102 * uiScale;
  const textMaxHeight = Math.min(height * 0.29, 126 * uiScale);
  const arrowWidth = 44 * uiScale;
  const arrowHeight = 66 * uiScale;
  const arrowBottom = 24 * uiScale;
  const horizontalPadding = clamp(width * 0.032, 30, 46);
  const verticalPadding = 10 * uiScale;
  useEffect(() => { pagerRef.current?.setPageWithoutAnimation(currentPage); }, [currentPage]);
  const handlePageSelected = useCallback((event: any) => onPageChange(event.nativeEvent.position), [onPageChange]);
  const goNext = useCallback(() => { onPageNavigationStart?.(); currentPage < pages.length - 1 ? pagerRef.current?.setPage(currentPage + 1) : onFinish(); }, [currentPage, pages.length, onFinish, onPageNavigationStart]);
  const goPrev = useCallback(() => { onPageNavigationStart?.(); if (currentPage > 0) pagerRef.current?.setPage(currentPage - 1); else onBackFromFirstPage?.(); }, [currentPage, onBackFromFirstPage, onPageNavigationStart]);
  if (pages.length === 0) return <View style={[styles.emptyContainer, { backgroundColor: coverColor }]}><ActivityIndicator size="large" color={Colors.textWhite} /><Text style={styles.loadingText}>Cargando páginas...</Text></View>;

  return <View style={styles.container}>
    <PagerView ref={pagerRef} style={StyleSheet.absoluteFill} initialPage={currentPage} onPageSelected={handlePageSelected} onPageScrollStateChanged={(event) => { if (event.nativeEvent.pageScrollState === 'dragging') onPageNavigationStart?.(); }} orientation="horizontal">
      {pages.map((page) => {
        const textForPage = pageTexts?.get(page.pageNumber);
        return <View key={`page-${page.pageNumber}`} style={styles.pageContainer} collapsable={false}>
          <Image source={{ uri: page.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          {showText && textForPage && <View style={[styles.textOverlay, { left: sideInset, right: sideInset, minHeight: textMinHeight, maxHeight: textMaxHeight, borderTopLeftRadius: 10 * uiScale, borderTopRightRadius: 10 * uiScale, paddingHorizontal: horizontalPadding, paddingVertical: verticalPadding }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.textScrollContent}><Text style={[styles.pageText, { fontSize: clamp(textSize * uiScale, 14, 22), lineHeight: clamp(textSize * uiScale * 1.38, 20, 31) }]}>{textForPage}</Text></ScrollView>
          </View>}
        </View>;
      })}
    </PagerView>
    <Pressable style={[styles.arrowBtn, styles.leftArrow, { bottom: arrowBottom, width: arrowWidth, height: arrowHeight }]} onPress={goPrev} accessibilityLabel={currentPage === 0 ? 'Volver al menú' : 'Página anterior'}>{({ pressed }) => <Image source={pressed ? require('../assets/ui/ic_left_arrow_pressed.png') : require('../assets/ui/ic_left_arrow.png')} style={{ width: arrowWidth * 0.70, height: arrowHeight * 0.66, resizeMode: 'contain' }} />}</Pressable>
    <Pressable style={[styles.arrowBtn, styles.rightArrow, { bottom: arrowBottom, width: arrowWidth, height: arrowHeight }]} onPress={goNext} accessibilityLabel={currentPage === pages.length - 1 ? 'Terminar cuento' : 'Página siguiente'}>{({ pressed }) => <Image source={pressed ? require('../assets/ui/ic_right_arrow_pressed.png') : require('../assets/ui/ic_right_arrow.png')} style={{ width: arrowWidth * 0.70, height: arrowHeight * 0.66, resizeMode: 'contain' }} />}</Pressable>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignSelf: 'stretch', backgroundColor: '#000', overflow: 'hidden' },
  pageContainer: { flex: 1, width: '100%', height: '100%', backgroundColor: '#000', overflow: 'hidden' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }, loadingText: { color: '#FFF', fontSize: 16, marginTop: 12 },
  textOverlay: { position: 'absolute', bottom: 0, backgroundColor: 'rgba(239, 239, 224, 0.96)', justifyContent: 'center' }, textScrollContent: { flexGrow: 1, justifyContent: 'center' }, pageText: { color: Colors.tooltipText, textAlign: 'center', fontFamily: 'Montserrat-SemiBold', flexShrink: 1 },
  arrowBtn: { position: 'absolute', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', zIndex: 20 }, leftArrow: { left: 7 }, rightArrow: { right: 7 },
});
