import React, { useRef, useCallback } from 'react';
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
  coverColor: string;
  pageTexts?: Map<number, string>;
  showText: boolean;
}

export function PageViewer({
  pages,
  currentPage,
  onPageChange,
  coverColor,
  pageTexts,
  showText,
}: PageViewerProps) {
  const pagerRef = useRef<PagerView>(null);

  const handlePageSelected = useCallback(
    (event: any) => {
      const position = event.nativeEvent.position;
      onPageChange(position);
    },
    [onPageChange]
  );

  const goNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      const next = currentPage + 1;
      pagerRef.current?.setPage(next);
    }
  }, [currentPage, pages.length]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      const prev = currentPage - 1;
      pagerRef.current?.setPage(prev);
    }
  }, [currentPage]);

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
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={currentPage}
        onPageSelected={handlePageSelected}
        orientation="horizontal"
      >
        {pages.map((page, index) => {
          const textForPage = pageTexts?.get(page.pageNumber);

          return (
            <View
              key={`page-${page.pageNumber}`}
              style={styles.pageContainer}
            >
              {/* Fullscreen image - cover entire screen */}
              <Image
                source={{ uri: page.uri }}
                style={styles.pageImage}
                resizeMode="cover"
              />

              {/* Text overlay at bottom */}
              {showText && textForPage && (
                <View style={styles.textOverlay}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.pageText}>{textForPage}</Text>
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </PagerView>

      {/* Left arrow */}
      {currentPage > 0 && (
        <TouchableOpacity
          style={[styles.arrow, styles.arrowLeft]}
          onPress={goPrev}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/ui/ic_left_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      )}

      {/* Right arrow */}
      {currentPage < pages.length - 1 && (
        <TouchableOpacity
          style={[styles.arrow, styles.arrowRight]}
          onPress={goNext}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/ui/ic_right_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      )}

      {/* Page counter */}
      <View style={styles.pageIndicator}>
        <Text style={styles.pageNumber}>
          {currentPage + 1} / {pages.length}
        </Text>
      </View>

      {/* Bottom thumbnail strip */}
      <ScrollView
        horizontal
        style={styles.thumbStrip}
        contentContainerStyle={styles.thumbStripContent}
        showsHorizontalScrollIndicator={false}
      >
        {pages.map((page, idx) => (
          <TouchableOpacity
            key={`thumb-${idx}`}
            style={[styles.thumbCard, idx === currentPage && styles.thumbCardActive]}
            onPress={() => {
              pagerRef.current?.setPage(idx);
              onPageChange(idx);
            }}
          >
            <Image
              source={{ uri: page.uri }}
              style={styles.thumbImage}
              resizeMode="cover"
            />
            <Text style={styles.thumbNumber}>{idx + 1}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textWhite,
    fontSize: 16,
    marginTop: 12,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: SCREEN_HEIGHT * 0.3,
  },
  pageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  arrowLeft: {
    left: 4,
  },
  arrowRight: {
    right: 4,
  },
  arrowIcon: {
    width: 40,
    height: 40,
    tintColor: 'rgba(255, 255, 255, 0.8)',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 20,
  },
  pageNumber: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  thumbStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  thumbStripContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  thumbCard: {
    width: 80,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#333',
  },
  thumbCardActive: {
    borderColor: '#25C8EE',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbNumber: {
    position: 'absolute',
    top: 2,
    left: 6,
    color: '#25C8EE',
    fontSize: 12,
    fontWeight: '800',
  },
});
