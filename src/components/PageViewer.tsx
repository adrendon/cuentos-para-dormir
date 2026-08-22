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
  FlatList,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { BookPage } from '../types/book';
import { Colors } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const THUMB_W = 90;
const THUMB_H = 56;

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
  const thumbListRef = useRef<FlatList>(null);

  // PagerView only uses initialPage during mount. Keep its native page in sync
  // when narration or the page index changes currentPage programmatically.
  useEffect(() => {
    pagerRef.current?.setPageWithoutAnimation(currentPage);
    thumbListRef.current?.scrollToIndex({
      index: currentPage,
      animated: true,
      viewPosition: 0.5,
    });
  }, [currentPage]);

  const handlePageSelected = useCallback(
    (event: any) => {
      const position = event.nativeEvent.position;
      onPageChange(position);
      // Auto-scroll thumb strip to keep current page visible
      thumbListRef.current?.scrollToIndex({ index: position, animated: true, viewPosition: 0.5 });
    },
    [onPageChange]
  );

  const goNext = useCallback(() => {
    if (currentPage < pages.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    }
  }, [currentPage, pages.length]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      pagerRef.current?.setPage(currentPage - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((idx: number) => {
    pagerRef.current?.setPage(idx);
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
                    <Text style={styles.pageText}>{textForPage}</Text>
                  </ScrollView>
                </View>
              )}
            </View>
          );
        })}
      </PagerView>

      {/* Bottom bar: ← arrow | thumbnails with page index | → arrow */}
      <View style={styles.bottomBar}>
        {/* Left arrow */}
        <TouchableOpacity
          style={[styles.arrowBtn, currentPage === 0 && styles.arrowBtnDisabled]}
          onPress={goPrev}
          disabled={currentPage === 0}
        >
          <Image
            source={require('../assets/ui/ic_left_arrow.png')}
            style={[styles.arrowIcon, currentPage === 0 && styles.arrowIconDisabled]}
          />
        </TouchableOpacity>

        {/* Thumbnail strip with page numbers */}
        <FlatList
          ref={thumbListRef}
          data={pages}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbList}
          contentContainerStyle={styles.thumbListContent}
          keyExtractor={(item) => `t-${item.pageNumber}`}
          getItemLayout={(_, index) => ({ length: THUMB_W + 6, offset: (THUMB_W + 6) * index, index })}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.thumbCard, index === currentPage && styles.thumbCardActive]}
              onPress={() => goToPage(index)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.uri }} style={styles.thumbImage} resizeMode="cover" />
              <View style={styles.thumbNumberBadge}>
                <Text style={[styles.thumbNumber, index === currentPage && styles.thumbNumberActive]}>
                  {index + 1}
                </Text>
              </View>
              {/* Bookmark ribbon */}
              <View style={styles.thumbRibbon} />
            </TouchableOpacity>
          )}
        />

        {/* Right arrow */}
        <TouchableOpacity
          style={[styles.arrowBtn, currentPage === pages.length - 1 && styles.arrowBtnDisabled]}
          onPress={goNext}
          disabled={currentPage === pages.length - 1}
        >
          <Image
            source={require('../assets/ui/ic_right_arrow.png')}
            style={[styles.arrowIcon, currentPage === pages.length - 1 && styles.arrowIconDisabled]}
          />
        </TouchableOpacity>
      </View>
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
    bottom: 76,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: SCREEN_HEIGHT * 0.25,
  },
  pageText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: 'Montserrat-SemiBold',
  },
  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
    backgroundColor: 'rgba(23, 18, 84, 0.92)',
    paddingHorizontal: 6,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBtnDisabled: {
    opacity: 0.3,
  },
  arrowIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFF',
  },
  arrowIconDisabled: {
    tintColor: 'rgba(255,255,255,0.3)',
  },
  thumbList: {
    flex: 1,
  },
  thumbListContent: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  thumbCard: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#222',
  },
  thumbCardActive: {
    borderColor: Colors.accentCyan,
    borderWidth: 2.5,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbNumberBadge: {
    position: 'absolute',
    top: 2,
    left: 4,
  },
  thumbNumber: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Montserrat-ExtraBold',
  },
  thumbNumberActive: {
    color: Colors.accentCyan,
  },
  thumbRibbon: {
    position: 'absolute',
    top: 0,
    right: 6,
    width: 10,
    height: 16,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
