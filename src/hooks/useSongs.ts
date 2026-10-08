import { useCallback, useEffect, useState } from 'react';
import type { Song } from '../models/song.model';
import { getSong, getSongs } from '../services/songService';


const normalize = (s: Song): Song => ({
  ...s,
  lyrics: s.lyrics ?? '',
  chords: s.chords ?? '',
  is_active: s.is_active ?? true,
});

const CACHE_KEY = 'akn.songs.active.v1';

function readCache(): Song[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Song[]) : [];
  } catch {
    return [];
  }
}

function writeCache(songs: Song[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(songs));
  } catch {
    /* storage full / blocked: ignore */
  }
}

/**
 * All songs from Supabase. With activeOnly, the last good result is cached on
 * the device so Performance Mode still works if venue wifi drops.
 */
export function useSongs({ activeOnly = false }: { activeOnly?: boolean } = {}) {
  const [songs, setSongs] = useState<Song[]>(() => (activeOnly ? readCache() : []));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSongs({ activeOnly });
      console.log('first song from service:', data[0]);
      setSongs(data);
      if (activeOnly) writeCache(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  return { songs, loading, error, reload: load };
}

export function useSong(id: string | undefined) {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getSong(id)
      .then((s) => !cancelled && setSong(s))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Failed to load song'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { song, loading, error };
}
