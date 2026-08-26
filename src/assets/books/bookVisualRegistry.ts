import { Image, ImageSourcePropType } from 'react-native';
import { getBookCover } from './coverRegistry';

const coverCache = new Map<string, ImageSourcePropType | undefined>();

export function getStableBookCover(folderName: string): ImageSourcePropType | undefined {
  if (!coverCache.has(folderName)) coverCache.set(folderName, getBookCover(folderName));
  return coverCache.get(folderName);
}

export async function warmBookVisual(folderName: string, firstPageUri?: string): Promise<void> {
  const cover = getStableBookCover(folderName);
  const jobs: Promise<unknown>[] = [];
  if (cover) {
    const resolved = Image.resolveAssetSource(cover);
    if (resolved?.uri) jobs.push(Image.prefetch(resolved.uri));
  }
  if (firstPageUri) jobs.push(Image.prefetch(firstPageUri));
  await Promise.allSettled(jobs);
}
