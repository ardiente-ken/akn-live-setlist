import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSwipe } from '../../hooks/useSwipe';
import { useWakeLock } from '../../hooks/useWakeLock';
import '../../styles/gig-theme.css';
import '../../pages/performance/performance.css';
import ChordLyrics from './ChordLyrics';

export interface ViewerSong {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  chords: string;
}

interface Props {
  songs: ViewerSong[];
  /** Index of the song being shown inside `songs`. */
  index: number;
  /** URL for a given song id (used by swipe / Prev / Next). */
  songPath: (id: string) => string;
  /** Where the ☰ button goes (the song list). */
  backTo: string;
  /** Extra header buttons, e.g. the request queue in Performance Mode. */
  headerExtra?: ReactNode;
  /** Optional banner under the header, e.g. an offline notice. */
  banner?: ReactNode;
}

const SIZE_KEY = 'akn.perf.fontSize';
const MIN = 16;
const MAX = 56;

function readSize(): number {
  try {
    const n = Number(localStorage.getItem(SIZE_KEY));
    return n >= MIN && n <= MAX ? n : 26;
  } catch {
    return 26;
  }
}

/** Read-only song view: title, chords over lyrics, swipe + Prev/Next, text size. */
export default function SongViewer({ songs, index, songPath, backTo, headerExtra, banner }: Props) {
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(readSize);
  const [showChords, setShowChords] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  const song = songs[index];

  const go = useCallback(
    (offset: number) => {
      const target = songs[index + offset];
      // replace: Back returns to the song list, not through every song swiped
      if (target) navigate(songPath(target.id), { replace: true });
    },
    [songs, index, navigate, songPath],
  );
  const next = useCallback(() => go(1), [go]);
  const prev = useCallback(() => go(-1), [go]);

  const swipe = useSwipe({ onSwipeLeft: next, onSwipeRight: prev });
  useWakeLock();

  const songId = song?.id;
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [songId]);

  useEffect(() => {
    try {
      localStorage.setItem(SIZE_KEY, String(fontSize));
    } catch {
      /* ignore */
    }
  }, [fontSize]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (!song) return null;

  return (
    <div className="perf gig-theme" {...swipe}>
      <header className="perf-bar">
        <Link to={backTo} className="perf-btn" aria-label="Back to song list">☰</Link>
        <span className="perf-pos" aria-live="polite">
          {index + 1} / {songs.length}
        </span>
        <div className="perf-tools">
          <button className="perf-btn" aria-label="Smaller text"
            onClick={() => setFontSize((s) => Math.max(MIN, s - 2))}>A−</button>
          <button className="perf-btn" aria-label="Larger text"
            onClick={() => setFontSize((s) => Math.min(MAX, s + 2))}>A+</button>
          <button className="perf-btn" aria-pressed={showChords} aria-label="Toggle chords"
            onClick={() => setShowChords((v) => !v)}>♯</button>
          {headerExtra}
        </div>
      </header>

      {banner}

      <main className="perf-main" ref={mainRef}>
        <h1 className="perf-title">{song.title}</h1>
        <p className="perf-artist">{song.artist}</p>
        {showChords && song.chords.trim() && <p className="perf-chords">{song.chords}</p>}
        <ChordLyrics source={song.lyrics} fontSize={fontSize} showChords={showChords} />
      </main>

      <footer className="perf-nav">
        <button className="perf-btn" onClick={prev} disabled={index <= 0}>‹ Prev</button>
        <button className="perf-btn" onClick={next} disabled={index >= songs.length - 1}>Next ›</button>
      </footer>
    </div>
  );
}
