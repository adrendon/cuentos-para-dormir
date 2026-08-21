import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Book, BookAdditionalInfo, BookTexts, FilterType } from '../types/book';
import { bookCatalog, getCoverColor } from '../assets/books/bookAssets';

const READ_BOOKS_KEY = '@cuentos_read_books';
const FAVORITE_BOOKS_KEY = '@cuentos_favorite_books';

/**
 * Parse TSV-formatted Texts.csv content and extract ES column values.
 */
function parseTextsCSV(content: string): BookTexts {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { title: '', author: '', illustrator: '', description: '' };
  }

  // Find column index for ES
  const headers = lines[0].split('\t');
  const esIndex = headers.findIndex(h => h.trim().toUpperCase() === 'ES');

  if (esIndex === -1) {
    return { title: '', author: '', illustrator: '', description: '' };
  }

  const result: Record<string, string> = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const key = cols[0]?.trim();
    const value = cols[esIndex]?.trim() ?? '';
    if (key) {
      result[key] = value;
    }
  }

  return {
    title: result['title'] ?? '',
    author: result['author'] ?? '',
    illustrator: result['illustrator'] ?? '',
    description: result['boy.description'] ?? result['description'] ?? '',
  };
}

/**
 * Hook to load and manage the list of books from assets.
 */
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [readBooks, setReadBooks] = useState<Set<string>>(new Set());
  const [favoriteBooks, setFavoriteBooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadBooksData();
  }, []);

  const loadBooksData = async () => {
    try {
      // Load read/favorite state
      const [readStored, favStored] = await Promise.all([
        AsyncStorage.getItem(READ_BOOKS_KEY),
        AsyncStorage.getItem(FAVORITE_BOOKS_KEY),
      ]);

      const readSet = readStored ? new Set<string>(JSON.parse(readStored)) : new Set<string>();
      const favSet = favStored ? new Set<string>(JSON.parse(favStored)) : new Set<string>();
      setReadBooks(readSet);
      setFavoriteBooks(favSet);

      // Load book metadata from available folders
      const loadedBooks = await loadBooksFromAssets(readSet, favSet);
      setBooks(loadedBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBooksFromAssets = async (
    readSet: Set<string>,
    favSet: Set<string>
  ): Promise<Book[]> => {
    const loadedBooks: Book[] = [];

    for (const entry of bookCatalog) {
      try {
        // Try to load AdditionalInfo.json and Texts.csv for this book
        const bookData = await loadSingleBook(entry.folderName, entry.coverColor, readSet, favSet);
        if (bookData) {
          loadedBooks.push(bookData);
        }
      } catch {
        // Book folder might not exist yet, skip silently
      }
    }

    return loadedBooks;
  };

  return {
    books,
    isLoading,
    filter,
    setFilter,
    filteredBooks: getFilteredBooks(books, filter),
    markAsRead,
    toggleFavorite,
    getBookById,
    refreshBooks: loadBooksData,
  };

  function getFilteredBooks(allBooks: Book[], currentFilter: FilterType): Book[] {
    switch (currentFilter) {
      case 'favorites':
        return allBooks.filter(b => b.isFavorite);
      case 'unread':
        return allBooks.filter(b => !b.isRead);
      case 'all':
      default:
        return allBooks;
    }
  }

  async function markAsRead(bookId: string) {
    const newReadBooks = new Set(readBooks);
    newReadBooks.add(bookId);
    setReadBooks(newReadBooks);
    await AsyncStorage.setItem(READ_BOOKS_KEY, JSON.stringify([...newReadBooks]));

    setBooks(prev =>
      prev.map(b => (b.id === bookId ? { ...b, isRead: true } : b))
    );
  }

  async function toggleFavorite(bookId: string) {
    const newFavorites = new Set(favoriteBooks);
    if (newFavorites.has(bookId)) {
      newFavorites.delete(bookId);
    } else {
      newFavorites.add(bookId);
    }
    setFavoriteBooks(newFavorites);
    await AsyncStorage.setItem(FAVORITE_BOOKS_KEY, JSON.stringify([...newFavorites]));

    setBooks(prev =>
      prev.map(b =>
        b.id === bookId ? { ...b, isFavorite: newFavorites.has(bookId) } : b
      )
    );
  }

  function getBookById(bookId: string): Book | undefined {
    return books.find(b => b.id === bookId);
  }
}

/**
 * Load a single book's metadata from its asset folder.
 * Returns null if the book folder doesn't have required files.
 */
async function loadSingleBook(
  folderName: string,
  coverColor: string,
  readSet: Set<string>,
  favSet: Set<string>
): Promise<Book | null> {
  try {
    // For bundled assets, we need to use require() or Asset API
    // In a real production app, books would be loaded via expo-asset
    // For now, we use a simplified approach with the file system

    const bookBasePath = `${FileSystem.documentDirectory}books/${folderName}`;
    
    // Check if the book directory exists in document storage
    const dirInfo = await FileSystem.getInfoAsync(bookBasePath);
    
    let additionalInfo: BookAdditionalInfo = {
      commonPages: [],
      imageType: 'webp',
      numberOfPages: 20,
      resolution: 'h1080xr1610',
    };
    
    let texts: BookTexts = {
      title: folderName.replace(/([A-Z])/g, ' $1').trim(),
      author: '',
      illustrator: '',
      description: '',
    };

    if (dirInfo.exists) {
      // Load from document directory (real books copied here)
      try {
        const infoContent = await FileSystem.readAsStringAsync(
          `${bookBasePath}/AdditionalInfo.json`
        );
        additionalInfo = JSON.parse(infoContent);
      } catch {}

      try {
        const textsContent = await FileSystem.readAsStringAsync(
          `${bookBasePath}/Texts.csv`
        );
        texts = parseTextsCSV(textsContent);
      } catch {}
    }

    // Check if voicework exists
    let hasVoicework = false;
    try {
      const voiceDir = await FileSystem.getInfoAsync(
        `${bookBasePath}/voicework_es`
      );
      hasVoicework = voiceDir.exists;
    } catch {}

    const bookId = folderName;

    return {
      id: bookId,
      folderName,
      title: texts.title || folderName.replace(/([A-Z])/g, ' $1').trim(),
      author: texts.author,
      illustrator: texts.illustrator,
      description: texts.description,
      coverColor,
      numberOfPages: additionalInfo.numberOfPages,
      imageType: additionalInfo.imageType,
      resolution: additionalInfo.resolution,
      commonPages: additionalInfo.commonPages,
      hasVoicework,
      isRead: readSet.has(bookId),
      isFavorite: favSet.has(bookId),
    };
  } catch {
    return null;
  }
}

/**
 * Copy bundled book assets to document directory for runtime access.
 * Call this on first launch or when new books are added.
 */
export async function copyBooksToDocuments(): Promise<void> {
  const booksDir = `${FileSystem.documentDirectory}books`;
  const dirInfo = await FileSystem.getInfoAsync(booksDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
  }
  // In production, this would copy from the asset bundle
  // For development, books are accessed directly from the bundle
}
