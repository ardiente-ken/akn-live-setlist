import { useCallback, useEffect, useState } from 'react';
import type { PublicFolder } from '../models/folder.model';
import { getPublicFolder } from '../services/folderService';

const key = (slug: string) => `akn.songbook.${slug}.v1`;

function readCache(slug: string | undefined): PublicFolder | null {
  if (!slug) return null;
  try {
    const raw = localStorage.getItem(key(slug));
    return raw ? (JSON.parse(raw) as PublicFolder) : null;
  } catch {
    return null;
  }
}

/**
 * A public folder + its songs. The last good copy is cached on the device, so a
 * page that was opened once still works if the signal drops. If the folder
 * is made private or deleted, the next successful load clears it.
 */
export function usePublicFolder(slug: string | undefined) {
  const [data, setData] = useState<PublicFolder | null>(() => readCache(slug));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const result = await getPublicFolder(slug);
      setData(result);
      setError(null);
      try {
        if (result) localStorage.setItem(key(slug), JSON.stringify(result));
        else localStorage.removeItem(key(slug));
      } catch {
        /* ignore */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this songbook');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setData(readCache(slug));
    void load();
  }, [slug, load]);

  return { data, loading, error, reload: load };
}
