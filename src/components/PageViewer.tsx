import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { BookPage } from '../types/book';
import { Colors } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

interface PageViewerProps {
  pages: BookPage[];
  currentPage: number;
  onPageChange: (pageIndex: number) => void;
  onFinish: () => void;
  onBackFromFirstPage?: () => void;
  coverColor: string;
  pageTexts?: Map<number, string>;
  showText: boolean;
  textSize?: number;
}

export function PageViewer({
  pages,
  currentPage,
  onPageChange,
  onFinish,
  onBackFromFirstPage,
  coverColor,
  pageTexts,
  showText,
  textSize = 14,
}: PageViewerProps) {
  const pagerRef = useRef<PagerView>(null);

  // PagerView only uses initialPage during mount. Keep its native page in sync
  // when narration or the page index changes currentPage programmatically.
  useEffect(() => {
    pagerRef.current?.setPageWithoutAnimation(currentPage);
  }, [currentPage]);

  const handlePageSelected = useCallback(
    (event: any) => {
      const position = event.nativeEvent.position;
      onPageChange(position);
    },
    [onPageChange]
  );

  const goNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      onFinish();
    }
  }, [currentPage, pages.length, onFinish]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
    } else if (currentPage === 0 && onBackFromFirstPage) {
      onBackFromFirstPage();
    }
  }, [currentPage, onBackFromFirstPage]);

  if (pages.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: coverColor }]}>
        <ActivityIndicator size="large" color={Colors.textWhite} />
        <Text style={styles.loadingText}>Cargando páginas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main pager - fullscreen */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={currentPage}
        onPageSelected={handlePageSelected}
        orientation="horizontal"
      >
        {pages.map((page) => {
          const textForPage = pageTexts?.get(page.pageNumber);
          return (
            <View key={`page-${page.pageNumber}`} style={styles.pageContainer}>
              <Image
                source={{ uri: page.uri }}
                style={styles.pageImage}
                resizeMode="cover"
              />
              {/* Text overlay above bottom bar */}
              {showText && textForPage && (
                <View style={styles.textOverlay}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={[styles.pageText, { fontSize: textSize, lineHeight: textSize * 1.5 }]}>
                      {textForPage}
                    </Text>
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </PagerView>

      {/* Floating left arrow - vertically centered on the main image area */}
      <TouchableOpacity
        style={[styles.arrowBtn, styles.leftArrow]}
        onPress={goPrev}
        accessibilityLabel={currentPage === 0 ? 'Volver al menú' : 'Página anterior'}
      >
        <Image source={require('../assets/ui/ic_left_arrow.png')} style={styles.arrowIcon} />
      </TouchableOpacity>

      {/* Floating right arrow - vertically centered on the main image area */}
      <TouchableOpacity
        style={[styles.arrowBtn, styles.rightArrow]}
        onPress={goNext}
        accessibilityLabel={currentPage === pages.length - 1 ? 'Terminar cuento' : 'Página siguiente'}
      >
        <Image source={require('../assets/ui/ic_right_arrow.png')} style={styles.arrowIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pager: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 12,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 82,
    paddingVertical: 16,
    minHeight: 92,
    justifyContent: 'center',
    maxHeight: SCREEN_HEIGHT * 0.25,
  },
  pageText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -29,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 8, 38, 0.68)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  leftArrow: { left: 14 },
  rightArrow: { right: 14 },
  arrowIcon: {
    width: 32,
    height: 32,
    tintColor: '#FFF',
  },
});
