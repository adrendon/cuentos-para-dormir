import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import {
  Book,
  BookAdditionalInfo,
  BookTexts,
  LibraryFilters,
  DEFAULT_LIBRARY_FILTERS,
  SHORT_STORY_MAX_PAGES,
} from '../types/book';
import { bookCatalog } from '../assets/books/bookAssets';
import { isBookDownloaded, deleteDownloadedBook, BOOKS_LOCAL_DIR } from '../services/downloadService';
import { setupEmbeddedBooks } from '../services/embeddedBooksService';

const READ_BOOKS_KEY = '@cuentos_read_books';
const FAVORITE_BOOKS_KEY = '@cuentos_favorite_books';

function parseTextsCSV(content: string): BookTexts {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  if (lines.length < 2) return { title: '', author: '', illustrator: '', description: '' };
  const headers = lines[0].split('\t');
  const esIndex = headers.findIndex(h => h.trim().toUpperCase() === 'ES');
  if (esIndex === -1) return { title: '', author: '', illustrator: '', description: '' };
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

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<LibraryFilters>(DEFAULT_LIBRARY_FILTERS);
  const [readBooks, setReadBooks] = useState<Set<string>>(new Set());
  const [favoriteBooks, setFavoriteBooks] = useState<Set<string>>(new Set());

  const loadBooksData = useCallback(async () => {
    try {
      const booksDir = await FileSystem.getInfoAsync(BOOKS_LOCAL_DIR);
      if (!booksDir.exists) await FileSystem.makeDirectoryAsync(BOOKS_LOCAL_DIR, { intermediates: true });

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
        const { folderName, coverColor, embedded, title, author } = entry;
        const bookLocalPath = `${BOOKS_LOCAL_DIR}${folderName}`;
        const isAvailable = await isBookDownloaded(folderName);
        let bookTitle = title;
        let bookAuthor = author;
        let illustrator = '';
        let description = '';
        let numberOfPages = 20;
        let imageType = 'webp';
        let resolution = 'h1080xr1610';
        let commonPages: number[] = [];
        let hasVoicework = false;

        if (isAvailable) {
          try {
            const textsContent = await FileSystem.readAsStringAsync(`${bookLocalPath}/Texts.csv`);
            const parsed = parseTextsCSV(textsContent);
            if (parsed.title) bookTitle = parsed.title;
            if (parsed.author) bookAuthor = parsed.author;
            illustrator = parsed.illustrator;
            description = parsed.description;
          } catch {}
          try {
            const infoContent = await FileSystem.readAsStringAsync(`${bookLocalPath}/AdditionalInfo.json`);
            const info: BookAdditionalInfo = JSON.parse(infoContent);
            numberOfPages = info.numberOfPages;
            imageType = info.imageType;
            resolution = info.resolution;
            commonPages = info.commonPages;
          } catch {}
          try {
            const voiceDir = await FileSystem.getInfoAsync(`${bookLocalPath}/voicework_es`);
            hasVoicework = voiceDir.exists;
          } catch {}
        }

        loadedBooks.push({
          id: folderName,
          folderName,
          title: bookTitle,
          author: bookAuthor,
          illustrator,
          description,
          coverColor,
          numberOfPages,
          imageType,
          resolution,
          commonPages,
          hasVoicework,
          isRead: readSet.has(folderName),
          isFavorite: favSet.has(folderName),
          isDownloaded: isAvailable,
          isEmbedded: embedded,
          sizeMB: entry.sizeMB,
        });
      }
      setBooks(loadedBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await setupEmbeddedBooks();
      if (!cancelled) await loadBooksData();
    })();
    return () => { cancelled = true; };
  }, [loadBooksData]);

  const refreshBooks = useCallback(() => {
    void loadBooksData();
  }, [loadBooksData]);

  const markBookAsDownloaded = useCallback((bookId: string) => {
    setBooks(prev => prev.map(b => (b.id === bookId ? { ...b, isDownloaded: true } : b)));
  }, []);

  async function markAsRead(bookId: string) {
    const newReadBooks = new Set(readBooks);
    newReadBooks.add(bookId);
    setReadBooks(newReadBooks);
    await AsyncStorage.setItem(READ_BOOKS_KEY, JSON.stringify([...newReadBooks]));
    setBooks(prev => prev.map(b => (b.id === bookId ? { ...b, isRead: true } : b)));
  }

  async function toggleFavorite(bookId: string) {
    const newFavorites = new Set(favoriteBooks);
    if (newFavorites.has(bookId)) newFavorites.delete(bookId); else newFavorites.add(bookId);
    setFavoriteBooks(newFavorites);
    await AsyncStorage.setItem(FAVORITE_BOOKS_KEY, JSON.stringify([...newFavorites]));
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, isFavorite: newFavorites.has(bookId) } : b));
  }

  function getBookById(bookId: string): Book | undefined { return books.find(b => b.id === bookId); }

  const deleteBook = useCallback(async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.isEmbedded) return;
    await deleteDownloadedBook(book.folderName);
    setBooks(prev => prev.map(b => (b.id === bookId ? { ...b, isDownloaded: false } : b)));
  }, [books]);

  function getFilteredBooks(allBooks: Book[], query: string, activeFilters: LibraryFilters): Book[] {
    const normalizedQuery = query.trim().toLowerCase();
    return allBooks.filter((b) => {
      if (normalizedQuery && !b.title.toLowerCase().includes(normalizedQuery)) return false;
      if (activeFilters.unread && b.isRead) return false;
      if (activeFilters.favorites && !b.isFavorite) return false;
      if (activeFilters.withVoice && !b.hasVoicework) return false;
      if (activeFilters.withoutVoice && b.hasVoicework) return false;
      if (activeFilters.short && b.numberOfPages > SHORT_STORY_MAX_PAGES) return false;
      if (activeFilters.long && b.numberOfPages <= SHORT_STORY_MAX_PAGES) return false;
      return true;
    });
  }

  const clearFilters = useCallback(() => setFilters(DEFAULT_LIBRARY_FILTERS), []);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    books,
    isLoading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
    filteredBooks: getFilteredBooks(books, searchQuery, filters),
    markAsRead,
    toggleFavorite,
    getBookById,
    deleteBook,
    refreshBooks,
    markBookAsDownloaded,
  };
}
