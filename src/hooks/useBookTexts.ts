import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Gender } from '../types/book';
import { BOOKS_LOCAL_DIR } from '../services/downloadService';

export interface PageText {
  pageNumber: number;
  text: string;
}

/** Convert both supported escaped line-break spellings from book data. */
function normalizeLineBreaks(value: string): string {
  // Catalog files encode line breaks as the two characters `\` and `n`.
  // Accept repeated escaping too, since downloaded ZIPs have used both forms.
  return value.replace(/(?:\\+n|\/n)/gi, '\n');
}

/** Metadata is displayed on one line in cards and credits. */
function normalizeMetadata(value: string): string {
  return normalizeLineBreaks(value).replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Hook to load and personalize page texts from Texts.csv.
 * Replaces {NAME:P1}, {NAME:P2} with the child's name.
 * Uses boy.page.N or girl.page.N keys based on gender.
 */
export function useBookTexts(
  folderName: string | undefined,
  gender: Gender,
  childName: string
) {
  const [pageTexts, setPageTexts] = useState<Map<number, string>>(new Map());
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (folderName) {
      loadTexts(folderName, gender, childName);
    }
  }, [folderName, gender, childName]);

  const loadTexts = async (folder: string, g: Gender, name: string) => {
    setIsLoading(true);
    try {
      const csvPath = `${BOOKS_LOCAL_DIR}${folder}/Texts.csv`;
      const content = await FileSystem.readAsStringAsync(csvPath);

      const lines = content.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) return;

      // Find ES column index
      const headers = lines[0].split('\t');
      const esIndex = headers.findIndex(h => h.trim().toUpperCase() === 'ES');
      if (esIndex === -1) return;

      // Parse all rows into key-value map
      const data: Record<string, string> = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        const key = cols[0]?.trim();
        const value = cols[esIndex]?.trim() ?? '';
        if (key) data[key] = value;
      }

      // Extract title and author
      setTitle(normalizeMetadata(data['title'] ?? ''));
      setAuthor(normalizeMetadata(data['author'] ?? ''));

      // Extract page texts based on gender
      const prefix = `${g}.page.`;
      const texts = new Map<number, string>();

      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith(prefix)) {
          const pageNum = parseInt(key.substring(prefix.length), 10);
          if (!isNaN(pageNum)) {
            // Personalize: replace {NAME:P1} and {NAME:P2} with child name
            let personalized = value
              .replace(/\{NAME:P1\}/g, name || 'Amiguito')
              .replace(/\{NAME:P2\}/g, name || 'Amiguito')
              .replace(/\{NAME\}/g, name || 'Amiguito');
            personalized = normalizeLineBreaks(personalized);
            texts.set(pageNum, personalized);
          }
        }
      }

      setPageTexts(texts);
    } catch (error) {
      console.error('Error loading book texts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get text for a specific page number.
   */
  const getTextForPage = (pageNumber: number): string | undefined => {
    return pageTexts.get(pageNumber);
  };

  return {
    pageTexts,
    title,
    author,
    isLoading,
    getTextForPage,
  };
}
