import catalog from './catalog.json';

export interface BookAssetEntry {
  folderName: string;
  coverColor: string;
}

export const bookCatalog: BookAssetEntry[] = catalog.books;

export function getCoverColor(folderName: string): string {
  const entry = bookCatalog.find(b => b.folderName === folderName);
  return entry?.coverColor ?? '#003A1A';
}

export function getRegisteredBookNames(): string[] {
  return bookCatalog.map(b => b.folderName);
}
