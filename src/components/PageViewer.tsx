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

const { width, height } = Dimensions.get('window');

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
      onPageChange(next);
    }
  }, [currentPage, pages.length, onPageChange]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      const prev = currentPage - 1;
      pagerRef.current?.setPage(prev);
      onPageChange(prev);
    }
  }, [currentPage, onPageChange]);

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
        overdrag={false}
      >
        {pages.map((page, index) => {
          const textForPage = pageTexts?.get(page.pageNumber);

          return (
            <View
              key={`page-${page.pageNumber}`}
              style={[styles.pageContainer, { backgroundColor: coverColor }]}
            >
              <Image
                source={{ uri: page.uri }}
                style={styles.pageImage}
                resizeMode="contain"
              />

              {/* Text overlay */}
              {showText && textForPage && (
                <View style={styles.textOverlay}>
                  <ScrollView
                    style={styles.textScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.pageText}>{textForPage}</Text>
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </PagerView>

      {/* Navigation arrows */}
      {currentPage > 0 && (
        <TouchableOpacity
          style={[styles.arrow, styles.arrowLeft]}
          onPress={goPrev}
          accessibilityLabel="Página anterior"
        >
          <Image
            source={require('../assets/ui/ic_left_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      )}

      {currentPage < pages.length - 1 && (
        <TouchableOpacity
          style={[styles.arrow, styles.arrowRight]}
          onPress={goNext}
          accessibilityLabel="Página siguiente"
        >
          <Image
            source={require('../assets/ui/ic_right_arrow.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      )}

      {/* Page indicator */}
      <View style={styles.pageIndicator}>
        <Text style={styles.pageNumber}>
          {currentPage + 1} / {pages.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: Colors.textWhite,
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    maxHeight: '35%',
  },
  textScroll: {
    maxHeight: 120,
  },
  pageText: {
    color: Colors.textWhite,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    top: '45%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  pageIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pageNumber: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '600',
  },
});
