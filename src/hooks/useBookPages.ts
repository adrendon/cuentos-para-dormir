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
      const pagesPath = `${bookBasePath}/Pages/${genderFolder}`;

      // Check if gender-specific pages exist
      const dirInfo = await FileSystem.getInfoAsync(pagesPath);

      let targetPath = pagesPath;
      if (!dirInfo.exists) {
        // Try common pages folder
        const commonPath = `${bookBasePath}/Pages/common`;
        const commonInfo = await FileSystem.getInfoAsync(commonPath);
        if (commonInfo.exists) {
          targetPath = commonPath;
        } else {
          // Try the other gender
          const otherGender = genderFolder === 'boy' ? 'girl' : 'boy';
          const otherPath = `${bookBasePath}/Pages/${otherGender}`;
          const otherInfo = await FileSystem.getInfoAsync(otherPath);
          if (otherInfo.exists) {
            targetPath = otherPath;
          } else {
            setError('No se encontraron páginas');
            setIsLoading(false);
            return;
          }
        }
      }

      // Read directory and sort
      const files = await FileSystem.readDirectoryAsync(targetPath);
      const imageFiles = files
        .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
        .sort((a, b) => {
          const numA = extractPageNumber(a);
          const numB = extractPageNumber(b);
          return numA - numB;
        });

      const loadedPages: BookPage[] = imageFiles.map(file => ({
        pageNumber: extractPageNumber(file),
        uri: `${targetPath}/${file}`,
      }));

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
