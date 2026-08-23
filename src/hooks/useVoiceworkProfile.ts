import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Gender } from '../types/book';
import { BOOKS_LOCAL_DIR } from '../services/downloadService';

interface VoiceworkProfile {
  gender: Gender;
  name: string;
}

/**
 * The prerecorded voicework belongs to the child declared by each book.
 * Keep the illustrated pages and captions aligned with that recording instead
 * of combining it with the device profile.
 */
export function useVoiceworkProfile(folderName: string | undefined) {
  const [voiceworkProfile, setVoiceworkProfile] = useState<VoiceworkProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    setVoiceworkProfile(null);

    if (!folderName) return () => { cancelled = true; };

    void (async () => {
      try {
        const path = `${BOOKS_LOCAL_DIR}${folderName}/voicework_es/VoiceworkInfo.json`;
        const content = await FileSystem.readAsStringAsync(path);
        const child = JSON.parse(content)?.child;
        if (
          !cancelled &&
          (child?.gender === 'boy' || child?.gender === 'girl') &&
          typeof child?.name === 'string'
        ) {
          setVoiceworkProfile({ gender: child.gender, name: child.name });
        }
      } catch {
        // Not every downloadable book includes a prerecorded voicework.
      }
    })();

    return () => { cancelled = true; };
  }, [folderName]);

  return voiceworkProfile;
}
