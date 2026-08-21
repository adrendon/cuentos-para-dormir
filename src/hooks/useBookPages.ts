import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import { Book, BookPage, Gender } from '../types/book';

/**
 * Hook to load and manage pages for a specific book.
 * Pages are loaded based on the user's gender selection (boy/girl folder).
 */
export function useBookPages(book: Book | undefined, gender: Gender) {
  const [pages, setPages] = useState<BookPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      loadPages(book, gender);
    }
  }, [book?.id, gender]);

  const loadPages = async (bookData: Book, genderFolder: Gender) => {
    setIsLoading(true);
    setError(null);

    try {
      const bookBasePath = `${FileSystem.documentDirectory}books/${bookData.folderName}`;
      const pagesPath = `${bookBasePath}/Pages/${genderFolder}`;
      
      // Check if pages directory exists
      const dirInfo = await FileSystem.getInfoAsync(pagesPath);
      
      if (!dirInfo.exists) {
        // Try common pages folder as fallback
        const commonPath = `${bookBasePath}/Pages/common`;
        const commonInfo = await FileSystem.getInfoAsync(commonPath);
        
        if (commonInfo.exists) {
          const pageFiles = await loadPageFiles(commonPath, bookData.imageType);
          setPages(pageFiles);
        } else {
          // Generate page list based on AdditionalInfo
          const generatedPages = generatePageList(bookData, genderFolder);
          setPages(generatedPages);
        }
      } else {
        const pageFiles = await loadPageFiles(pagesPath, bookData.imageType);
        setPages(pageFiles);
      }
    } catch (err) {
      console.error('Error loading pages:', err);
      setError('No se pudieron cargar las páginas');
      // Fallback: generate from metadata
      if (book) {
        const generated = generatePageList(book, genderFolder);
        setPages(generated);
      }
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

/**
 * Load page files from a directory, sorted numerically.
 */
async function loadPageFiles(
  directoryPath: string,
  imageType: string
): Promise<BookPage[]> {
  try {
    const files = await FileSystem.readDirectoryAsync(directoryPath);
    
    // Filter for image files and sort numerically
    const imageFiles = files
      .filter(f => f.endsWith(`.${imageType}`) || f.endsWith('.webp') || f.endsWith('.png'))
      .sort((a, b) => {
        const numA = extractPageNumber(a);
        const numB = extractPageNumber(b);
        return numA - numB;
      });

    return imageFiles.map((file, index) => ({
      pageNumber: extractPageNumber(file),
      uri: `${directoryPath}/${file}`,
    }));
  } catch {
    return [];
  }
}

/**
 * Extract numeric page number from filename (e.g., "page_005.webp" → 5)
 */
function extractPageNumber(filename: string): number {
  const match = filename.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Generate a page list from book metadata when actual files aren't available.
 * Used as fallback during development or when assets aren't copied yet.
 */
function generatePageList(book: Book, gender: Gender): BookPage[] {
  const pages: BookPage[] = [];
  const basePath = `${FileSystem.documentDirectory}books/${book.folderName}/Pages/${gender}`;
  
  // Generate pages based on numberOfPages from metadata
  for (let i = 1; i <= book.numberOfPages; i++) {
    const paddedNum = i.toString().padStart(3, '0');
    pages.push({
      pageNumber: i,
      uri: `${basePath}/page_${paddedNum}.${book.imageType}`,
    });
  }

  return pages;
}

/**
 * Get the cover image URI for a book (typically page_005 or first available page)
 */
export function getBookCoverUri(book: Book, gender: Gender): string {
  const basePath = `${FileSystem.documentDirectory}books/${book.folderName}/Pages/${gender}`;
  return `${basePath}/page_005.${book.imageType}`;
}

/**
 * Get the audio file URI for a book's background music
 */
export function getBookAudioUri(book: Book): string {
  return `${FileSystem.documentDirectory}books/${book.folderName}/${book.folderName}.mp3`;
}
