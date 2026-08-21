import React, { useRef, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
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

  if (pages.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: coverColor }]}>
        <ActivityIndicator size="large" color={Colors.textWhite} />
        <Text style={styles.loadingText}>Cargando páginas...</Text>
      </View>
    );
  }

  return (
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
            {/* Fullscreen image */}
            <Image
              source={{ uri: page.uri }}
              style={styles.pageImage}
              resizeMode="cover"
            />

            {/* Text overlay at bottom */}
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

            {/* Page number */}
            <View style={styles.pageIndicator}>
              <Text style={styles.pageNumber}>
                {index + 1} / {pages.length}
              </Text>
            </View>
          </View>
        );
      })}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  pageImage: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    maxHeight: height * 0.35,
  },
  textScroll: {
    maxHeight: height * 0.3,
  },
  pageText: {
    color: Colors.textWhite,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    textAlign: 'center',
  },
  pageIndicator: {
    position: 'absolute',
    top: 12,
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
