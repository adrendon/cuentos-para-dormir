import { useState, useEffect, useCallback, useMemo } from 'react';
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

async function hydrateDownloadedBook(book: Book): Promise<Book> {
  const bookLocalPath = `${BOOKS_LOCAL_DIR}${book.folderName}`;
  let next = { ...book, isDownloaded: true };
  try {
    const parsed = parseTextsCSV(await FileSystem.readAsStringAsync(`${bookLocalPath}/Texts.csv`));
    next = { ...next, title: parsed.title || next.title, author: parsed.author || next.author, illustrator: parsed.illustrator, description: parsed.description };
  } catch {}
  try {
    const info: BookAdditionalInfo = JSON.parse(await FileSystem.readAsStringAsync(`${bookLocalPath}/AdditionalInfo.json`));
    next = { ...next, numberOfPages: info.numberOfPages, imageType: info.imageType, resolution: info.resolution, commonPages: info.commonPages };
  } catch {}
  try {
    const voiceDir = await FileSystem.getInfoAsync(`${bookLocalPath}/voicework_es`);
    next = { ...next, hasVoicework: voiceDir.exists };
  } catch {}
  return next;
}

function getFilteredBooks(allBooks: Book[], query: string, activeFilters: LibraryFilters) {
  const q = query.trim().toLowerCase();
  return allBooks.filter(b => {
    if (q && !b.title.toLowerCase().includes(q)) return false;
    if (activeFilters.unread && b.isRead) return false;
    if (activeFilters.favorites && !b.isFavorite) return false;
    if (activeFilters.withVoice && !b.hasVoicework) return false;
    if (activeFilters.withoutVoice && b.hasVoicework) return false;
    if (activeFilters.short && b.numberOfPages > SHORT_STORY_MAX_PAGES) return false;
    if (activeFilters.long && b.numberOfPages <= SHORT_STORY_MAX_PAGES) return false;
    return true;
  });
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
      const [readStored, favStored] = await Promise.all([AsyncStorage.getItem(READ_BOOKS_KEY), AsyncStorage.getItem(FAVORITE_BOOKS_KEY)]);
      const readSet = readStored ? new Set<string>(JSON.parse(readStored)) : new Set<string>();
      const favSet = favStored ? new Set<string>(JSON.parse(favStored)) : new Set<string>();
      setReadBooks(readSet); setFavoriteBooks(favSet);
      const loadedBooks: Book[] = [];
      for (const entry of bookCatalog) {
        const isAvailable = await isBookDownloaded(entry.folderName);
        let base: Book = {
          id: entry.folderName, folderName: entry.folderName, title: entry.title, author: entry.author,
          illustrator: '', description: '', coverColor: entry.coverColor, numberOfPages: 20,
          imageType: 'webp', resolution: 'h1080xr1610', commonPages: [], hasVoicework: false,
          isRead: readSet.has(entry.folderName), isFavorite: favSet.has(entry.folderName),
          isDownloaded: isAvailable, isEmbedded: entry.embedded, sizeMB: entry.sizeMB,
        };
        if (isAvailable) base = await hydrateDownloadedBook(base);
        loadedBooks.push(base);
      }
      setBooks(loadedBooks);
    } catch (error) { console.error('Error loading books:', error); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => { await setupEmbeddedBooks(); if (!cancelled) await loadBooksData(); })();
    return () => { cancelled = true; };
  }, [loadBooksData]);

  const refreshBooks = useCallback(() => { void loadBooksData(); }, [loadBooksData]);
  const markBookAsDownloaded = useCallback((bookId: string) => {
    const target = books.find(b => b.id === bookId);
    if (!target) return;
    void hydrateDownloadedBook(target).then(hydrated => {
      setBooks(prev => prev.map(b => b.id === bookId ? hydrated : b));
    });
  }, [books]);

  async function markAsRead(bookId: string) {
    const next = new Set(readBooks); next.add(bookId); setReadBooks(next);
    await AsyncStorage.setItem(READ_BOOKS_KEY, JSON.stringify([...next]));
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, isRead: true } : b));
  }
  async function toggleFavorite(bookId: string) {
    const next = new Set(favoriteBooks); if (next.has(bookId)) next.delete(bookId); else next.add(bookId); setFavoriteBooks(next);
    await AsyncStorage.setItem(FAVORITE_BOOKS_KEY, JSON.stringify([...next]));
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, isFavorite: next.has(bookId) } : b));
  }
  function getBookById(bookId: string) { return books.find(b => b.id === bookId); }
  const deleteBook = useCallback(async (bookId: string) => {
    const book = books.find(b => b.id === bookId); if (!book || book.isEmbedded) return;
    await deleteDownloadedBook(book.folderName);
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, isDownloaded: false, hasVoicework: false } : b));
  }, [books]);

  const clearFilters = useCallback(() => setFilters(DEFAULT_LIBRARY_FILTERS), []);
  const activeFilterCount = useMemo(() => Object.values(filters).filter(Boolean).length, [filters]);
  const filteredBooks = useMemo(() => getFilteredBooks(books, searchQuery, filters), [books, searchQuery, filters]);

  return { books,isLoading,searchQuery,setSearchQuery,filters,setFilters,clearFilters,activeFilterCount,filteredBooks,markAsRead,toggleFavorite,getBookById,deleteBook,refreshBooks,markBookAsDownloaded };
}
