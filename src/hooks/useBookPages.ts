import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Book, BookPage, Gender } from '../types/book';
import { BOOKS_LOCAL_DIR } from '../services/downloadService';

/**
 * Hook to load and manage pages for a specific book.
 * Reads pages from documentDirectory/books/{folderName}/Pages/{gender}/
 */
export function useBookPages(book: Book | undefined, gender: Gender) {
  const [pages, setPages] = useState<BookPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (book && book.isDownloaded) {
      loadPages(book, gender);
    } else {
      setPages([]);
      setIsLoading(false);
    }
  }, [book?.id, book?.isDownloaded, gender]);

  const loadPages = async (bookData: Book, genderFolder: Gender) => {
    setIsLoading(true);
    setError(null);

    try {
      const bookBasePath = `${BOOKS_LOCAL_DIR}${bookData.folderName}`;
      const genderPath = `${bookBasePath}/Pages/${genderFolder}`;
      const otherGender = genderFolder === 'boy' ? 'girl' : 'boy';
      const otherGenderPath = `${bookBasePath}/Pages/${otherGender}`;
      const commonPath = `${bookBasePath}/Pages/common`;
      const [genderInfo, otherGenderInfo, commonInfo] = await Promise.all([
        FileSystem.getInfoAsync(genderPath),
        FileSystem.getInfoAsync(otherGenderPath),
        FileSystem.getInfoAsync(commonPath),
      ]);

      const primaryPath = genderInfo.exists
        ? genderPath
        : otherGenderInfo.exists
          ? otherGenderPath
          : undefined;
      const sourcePaths = [primaryPath, commonInfo.exists ? commonPath : undefined].filter(
        (path): path is string => Boolean(path)
      );

      if (sourcePaths.length === 0) {
        setError('No se encontraron páginas');
        return;
      }

      // Gender-specific and common pages complement each other. Merge them by
      // page number instead of treating the common directory as a global fallback.
      const directoryContents = await Promise.all(
        sourcePaths.map(async path => ({
          path,
          files: await FileSystem.readDirectoryAsync(path),
        }))
      );
      const pagesByNumber = new Map<number, BookPage>();
      for (const { path, files } of directoryContents) {
        for (const file of files) {
          if (!/\.(webp|png|jpe?g)$/i.test(file)) continue;
          const pageNumber = extractPageNumber(file);
          pagesByNumber.set(pageNumber, { pageNumber, uri: `${path}/${file}` });
        }
      }
      const loadedPages = [...pagesByNumber.values()].sort(
        (a, b) => a.pageNumber - b.pageNumber
      );

      setPages(loadedPages);
    } catch (err) {
      console.error('Error loading pages:', err);
      setError('No se pudieron cargar las páginas');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const isLastPage = currentPage === pages.length - 1;
  const isFirstPage = currentPage === 0;

  return {
    pages,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    goToPage,
    nextPage,
    previousPage,
    isLastPage,
    isFirstPage,
    totalPages: pages.length,
  };
}

function extractPageNumber(filename: string): number {
  const match = filename.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get the audio file URI for a book's background music.
 */
export function getBookAudioUri(book: Book): string {
  return `${BOOKS_LOCAL_DIR}${book.folderName}/${book.folderName}.mp3`;
}

/**
 * Get cover image URI for a book (first page).
 */
export function getBookCoverUri(book: Book, gender: Gender): string {
  return `${BOOKS_LOCAL_DIR}${book.folderName}/Pages/${gender}/page_001.${book.imageType}`;
}
