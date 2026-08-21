import React, { useRef, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
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
}

export function PageViewer({
  pages,
  currentPage,
  onPageChange,
  coverColor,
}: PageViewerProps) {
  const pagerRef = useRef<PagerView>(null);

  const handlePageSelected = useCallback(
    (event: any) => {
      const position = event.nativeEvent.position;
      onPageChange(position);
    },
    [onPageChange]
  );

  // Navigate to a specific page programmatically
  const goToPage = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

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
      {pages.map((page, index) => (
        <View
          key={`page-${page.pageNumber}`}
          style={[styles.pageContainer, { backgroundColor: coverColor }]}
        >
          <Image
            source={{ uri: page.uri }}
            style={styles.pageImage}
            resizeMode="contain"
            onError={() => {
              // Silently handle missing images
            }}
          />
          {/* Page number indicator */}
          <View style={styles.pageIndicator}>
            <Text style={styles.pageNumber}>
              {index + 1} / {pages.length}
            </Text>
          </View>
        </View>
      ))}
    </PagerView>
  );
}

const styles = StyleSheet.create({
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
  pageIndicator: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pageNumber: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '600',
  },
});
