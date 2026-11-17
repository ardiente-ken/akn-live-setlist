import { useCallback, useEffect, useState } from 'react';
import { mod12 } from '../lib/transpose';

const storageKey = (id: string) => `transpose:${id}`;

function load(id: string | undefined): number {
  if (!id) return 0;
  try {
    return Number(localStorage.getItem(storageKey(id))) || 0;
  } catch {
    return 0;
  }
}

/** Per-song transpose offset (0–11 semitones), persisted on this device. */
export function useTranspose(songId: string | undefined) {
  const [semitones, setSemitones] = useState(() => load(songId));

  // Song changed (swipe / Prev / Next): load that song's saved offset.
  useEffect(() => setSemitones(load(songId)), [songId]);

  const set = useCallback(
    (next: number) => {
      const value = mod12(next);
      setSemitones(value);
      if (!songId) return;
      try {
        if (value === 0) localStorage.removeItem(storageKey(songId));
        else localStorage.setItem(storageKey(songId), String(value));
      } catch {
        /* storage unavailable: keep in-memory only */
      }
    },
    [songId],
  );

  return {
    semitones,
    up: () => set(semitones + 1),
    down: () => set(semitones - 1),
    reset: () => set(0),
  };
}