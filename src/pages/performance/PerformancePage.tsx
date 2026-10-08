import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SongSearch from '../../components/songs/SongSearch';
import { useSongs } from '../../hooks/useSongs';
import { filterSongs } from '../../lib/filterSongs';
import '../../styles/gig-theme.css';
import './performance.css';

/** Step 1 of Performance Mode: search and pick a song. Read-only. */
export default function PerformancePage() {
  const { songs, loading, error } = useSongs({ activeOnly: true });
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => filterSongs(songs, query), [songs, query]);

  return (
    <div className="perf gig-theme">
      <header className="perf-bar">
        <Link to="/" className="perf-link">← Setlist</Link>
        <h1>Performance mode</h1>
        <span style={{ width: 72 }} />
      </header>
      {error && songs.length > 0 && (
        <p className="perf-offline">Offline: showing songs saved on this device.</p>
      )}
      <div className="perf-picker-body">
        <SongSearch value={query} onChange={setQuery} />
        {loading && songs.length === 0 && <p className="perf-msg">Loading songs…</p>}
        {error && songs.length === 0 && <p className="perf-msg">Couldn't load songs: {error}</p>}
        <ul className="perf-songs">
          {filtered.map((song) => (
            <li key={song.id}>
              <Link to={`/perform/${song.id}`} className="perf-song">
                <span className="perf-song-title">{song.title}</span>
                <span className="perf-song-artist">{song.artist}</span>
                {!song.lyrics.trim() && <span className="perf-song-flag">no lyrics yet</span>}
              </Link>
            </li>
          ))}
        </ul>
        {!loading && !error && filtered.length === 0 && <p className="perf-msg">No songs found.</p>}
      </div>
    </div>
  );
}
