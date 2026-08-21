import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Book, BookAdditionalInfo, BookTexts, FilterType } from '../types/book';
import { bookCatalog, getCoverColor, isBookEmbedded } from '../assets/books/bookAssets';
import { isBookDownloaded, BOOKS_LOCAL_DIR } from '../services/downloadService';

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
    if (key) result[key] = value;
  }

  return {
    title: result['title'] ?? '',
    author: result['author'] ?? '',
    illustrator: result['illustrator'] ?? '',
    description: result['boy.description'] ?? result['description'] ?? '',
  };
}

/**
 * Hook to load and manage the list of books.
 * Checks both embedded assets and locally downloaded books.
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
      const [readStored, favStored] = await Promise.all([
        AsyncStorage.getItem(READ_BOOKS_KEY),
        AsyncStorage.getItem(FAVORITE_BOOKS_KEY),
      ]);

      const readSet = readStored ? new Set<string>(JSON.parse(readStored)) : new Set<string>();
      const favSet = favStored ? new Set<string>(JSON.parse(favStored)) : new Set<string>();
      setReadBooks(readSet);
      setFavoriteBooks(favSet);

      const loadedBooks: Book[] = [];

      for (const entry of bookCatalog) {
        const { folderName, coverColor, embedded } = entry;

        // Determine if this book is available (embedded or downloaded)
        let isAvailable = false;
        let bookBasePath = '';

        if (embedded) {
          // Embedded book — always available
          isAvailable = true;
          bookBasePath = `${BOOKS_LOCAL_DIR}${folderName}`;
          // For embedded, also check asset directory
        } else {
          // Check if downloaded
          isAvailable = await isBookDownloaded(folderName);
          bookBasePath = `${BOOKS_LOCAL_DIR}${folderName}`;
        }

        // Load metadata if available
        let texts: BookTexts = {
          title: folderName.replace(/([A-Z])/g, ' $1').trim(),
          author: '',
          illustrator: '',
          description: '',
        };

        let additionalInfo: BookAdditionalInfo = {
          commonPages: [],
          imageType: 'webp',
          numberOfPages: 20,
          resolution: 'h1080xr1610',
        };

        if (isAvailable) {
          try {
            const textsContent = await FileSystem.readAsStringAsync(
              `${bookBasePath}/Texts.csv`
            );
            texts = parseTextsCSV(textsContent);
          } catch {}

          try {
            const infoContent = await FileSystem.readAsStringAsync(
              `${bookBasePath}/AdditionalInfo.json`
            );
            additionalInfo = JSON.parse(infoContent);
          } catch {}
        }

        // Check voicework
        let hasVoicework = false;
        if (isAvailable) {
          try {
            const voiceDir = await FileSystem.getInfoAsync(`${bookBasePath}/voicework_es`);
            hasVoicework = voiceDir.exists;
          } catch {}
        }

        loadedBooks.push({
          id: folderName,
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
          isRead: readSet.has(folderName),
          isFavorite: favSet.has(folderName),
          isDownloaded: isAvailable,
          isEmbedded: embedded,
        });
      }

      setBooks(loadedBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBooks = useCallback(() => {
    setIsLoading(true);
    loadBooksData();
  }, []);

  const markBookAsDownloaded = useCallback((bookId: string) => {
    setBooks(prev =>
      prev.map(b => (b.id === bookId ? { ...b, isDownloaded: true } : b))
    );
  }, []);

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

  return {
    books,
    isLoading,
    filter,
    setFilter,
    filteredBooks: getFilteredBooks(books, filter),
    markAsRead,
    toggleFavorite,
    getBookById,
    refreshBooks,
    markBookAsDownloaded,
  };
}
