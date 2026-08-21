/**
 * Book assets registry.
 * 
 * This file provides a centralized way to access book assets at runtime.
 * Since React Native requires static require() calls for bundled assets,
 * this registry maps book folder names to their resources.
 * 
 * For production: Add real book entries with actual require() calls.
 * The sample books below use placeholder data for development.
 */

import catalog from './catalog.json';

// Sample book page images (placeholders)
// In production, these would be actual require() calls to .webp files
// For now, we use a dynamic approach since books are loaded from filesystem

export interface BookAssetEntry {
  folderName: string;
  coverColor: string;
}

export const bookCatalog: BookAssetEntry[] = catalog.books;

/**
 * Get cover color for a book by folder name
 */
export function getCoverColor(folderName: string): string {
  const entry = bookCatalog.find(b => b.folderName === folderName);
  return entry?.coverColor ?? '#003A1A';
}

/**
 * Get list of all registered book folder names
 */
export function getRegisteredBookNames(): string[] {
  return bookCatalog.map(b => b.folderName);
}
