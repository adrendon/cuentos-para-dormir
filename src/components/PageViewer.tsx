import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { BookPage } from '../types/book';
import { Colors } from '../theme/colors';

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
  const { width, height } = useWindowDimensions();
  const scale = Math.max(0.82, Math.min(1.25, Math.min(width / 904, height / 407)));

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
                <View
                  style={[styles.textOverlay, {
                    left: 58 * scale,
                    right: 58 * scale,
                    minHeight: 90 * scale,
                    maxHeight: height * 0.30,
                    borderTopLeftRadius: 12 * scale,
                    borderTopRightRadius: 12 * scale,
                    paddingHorizontal: 38 * scale,
                    paddingVertical: 12 * scale,
                  }]}
                >
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={[styles.pageText, { fontSize: textSize * scale, lineHeight: textSize * scale * 1.5 }]}>{textForPage}</Text>
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </PagerView>

      {/* Navigation sits against the lower text strip, like the original reader. */}
      <Pressable
        style={[
          styles.arrowBtn,
          styles.leftArrow,
          { bottom: 10 * scale, width: 52 * scale, height: 76 * scale },
        ]}
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
            style={{ width: 34 * scale, height: 48 * scale, resizeMode: 'contain' }}
          />
        )}
      </Pressable>

      <Pressable
        style={[
          styles.arrowBtn,
          styles.rightArrow,
          { bottom: 10 * scale, width: 52 * scale, height: 76 * scale },
        ]}
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
            style={{ width: 34 * scale, height: 48 * scale, resizeMode: 'contain' }}
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
    backgroundColor: 'rgba(239, 239, 224, 0.94)',
    justifyContent: 'center',
  },
  pageText: {
    color: Colors.tooltipText,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  arrowBtn: {
    position: 'absolute',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  leftArrow: { left: 3 },
  rightArrow: { right: 3 },
});
