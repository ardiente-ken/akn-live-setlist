import { useCallback, useEffect, useState } from 'react';

const KEY = 'akn.played.v1';

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/**
 * "Already played" marks, stored only in this browser's localStorage.
 * Clearing site data resets them. Nothing is sent to Supabase.
 */
export function usePlayedSongs() {
  const [played, setPlayed] = useState<Set<string>>(read);

  // Persist whenever the set changes
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...played]));
    } catch {
      /* storage full / blocked: marks just won't survive a reload */
    }
  }, [played]);

  // Keep other open tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setPlayed(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setPlayed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isPlayed = useCallback((id: string) => played.has(id), [played]);

  return { isPlayed, toggle, count: played.size };
}