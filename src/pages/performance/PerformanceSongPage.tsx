import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ChordLyrics from '../../components/songs/ChordLyrics';
import { useSongs } from '../../hooks/useSongs';
import { useSwipe } from '../../hooks/useSwipe';
import { useWakeLock } from '../../hooks/useWakeLock';
import '../../styles/gig-theme.css';
import './performance.css';

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

/** Read-only song view. No edit/delete controls exist anywhere in here. */
export default function PerformanceSongPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { songs, loading, error } = useSongs({ activeOnly: true });
  const [fontSize, setFontSize] = useState(readSize);
  const [showChords, setShowChords] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  const index = songs.findIndex((s) => s.id === id);
  const song = index >= 0 ? songs[index] : null;

  const go = useCallback(
    (offset: number) => {
      const target = songs[index + offset];
      // replace: Back returns to the song list, not through every song swiped
      if (target) navigate(`/perform/${target.id}`, { replace: true });
    },
    [songs, index, navigate],
  );
  const next = useCallback(() => go(1), [go]);
  const prev = useCallback(() => go(-1), [go]);

  const swipe = useSwipe({ onSwipeLeft: next, onSwipeRight: prev });
  useWakeLock();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [id]);

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

  if (!song) {
    return (
      <div className="perf gig-theme">
        <header className="perf-bar">
          <Link to="/perform" className="perf-link">← Songs</Link>
        </header>
        <p className="perf-msg">
          {loading ? 'Loading…' : error ? `Couldn't load songs: ${error}` : 'Song not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="perf gig-theme" {...swipe}>
      <header className="perf-bar">
        <Link to="/perform" className="perf-btn" aria-label="Back to song list">☰ Songs</Link>
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
        </div>
      </header>

      {error && <p className="perf-offline">Offline: using songs saved on this device.</p>}

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
