import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  Pressable,
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
  onPageNavigationStart?: () => void;
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
  onPageNavigationStart,
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
    onPageNavigationStart?.();
    if (currentPage < pages.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      onFinish();
    }
  }, [currentPage, pages.length, onFinish, onPageNavigationStart]);

  const goPrev = useCallback(() => {
    onPageNavigationStart?.();
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
    } else if (currentPage === 0 && onBackFromFirstPage) {
      onBackFromFirstPage();
    }
  }, [currentPage, onBackFromFirstPage, onPageNavigationStart]);

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
        onPageScrollStateChanged={(event) => {
          if (event.nativeEvent.pageScrollState === 'dragging') onPageNavigationStart?.();
        }}
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
                  <View style={styles.textPageMark} pointerEvents="none">
                    <Image
                      source={require('../assets/ui/ic_page_mark.png')}
                      style={styles.textPageMarkImage}
                      resizeMode="stretch"
                    />
                    <Text style={styles.textPageNumber}>{page.pageNumber}</Text>
                  </View>
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
      <Pressable
        style={[styles.arrowBtn, styles.leftArrow]}
        onPress={goPrev}
        accessibilityLabel={currentPage === 0 ? 'Volver al menú' : 'Página anterior'}
      >
        {({ pressed }) => (
          <Image
            source={
              pressed
                ? require('../assets/ui/ic_left_arrow_pressed.png')
                : require('../assets/ui/ic_left_arrow.png')
            }
            style={styles.arrowIcon}
          />
        )}
      </Pressable>

      {/* Floating right arrow - vertically centered on the main image area */}
      <Pressable
        style={[styles.arrowBtn, styles.rightArrow]}
        onPress={goNext}
        accessibilityLabel={currentPage === pages.length - 1 ? 'Terminar cuento' : 'Página siguiente'}
      >
        {({ pressed }) => (
          <Image
            source={
              pressed
                ? require('../assets/ui/ic_right_arrow_pressed.png')
                : require('../assets/ui/ic_right_arrow.png')
            }
            style={styles.arrowIcon}
          />
        )}
      </Pressable>
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
    backgroundColor: 'rgba(239, 239, 224, 0.94)',
    paddingHorizontal: 96,
    paddingVertical: 14,
    minHeight: 86,
    justifyContent: 'center',
    maxHeight: SCREEN_HEIGHT * 0.25,
  },
  pageText: {
    color: Colors.tooltipText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  textPageMark: {
    position: 'absolute',
    top: 0,
    left: 22,
    width: 42,
    height: 68,
    alignItems: 'center',
    zIndex: 2,
  },
  textPageMarkImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  textPageNumber: {
    color: Colors.bookPagesText,
    fontSize: 18,
    fontFamily: 'Montserrat-ExtraBold',
    marginTop: 8,
  },
  arrowBtn: {
    position: 'absolute',
    top: '50%',
    marginTop: -42,
    width: 60,
    height: 84,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  leftArrow: { left: 2 },
  rightArrow: { right: 2 },
  arrowIcon: {
    width: 44,
    height: 62,
    resizeMode: 'contain',
  },
});
