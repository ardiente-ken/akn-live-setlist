import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import SongSearch from '../../components/songs/SongSearch';
import { filterSongs } from '../../lib/filterSongs';
import '../../styles/gig-theme.css';
import '../performance/performance.css';
import type { SongbookContext } from './SongbookLayout';

/** Public, read-only song list for one folder. */
export default function SongbookPage() {
  const { data, offline } = useOutletContext<SongbookContext>();
  const { folder, songs } = data;
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => filterSongs(songs, query), [songs, query]);

  return (
    <div className="perf gig-theme">
      <header className="perf-bar">
        <Link to="/songbook" className="perf-link">← Songbooks</Link>
        <h1>{folder.name}</h1>
        <span style={{ width: 72 }} />
      </header>
      {offline && <p className="perf-offline">Offline: showing the last saved copy.</p>}
      <div className="perf-picker-body">
        {folder.description && <p className="perf-sub">{folder.description}</p>}
        <p className="perf-played-count">{songs.length} songs</p>
        <SongSearch value={query} onChange={setQuery} />
        <ul className="perf-songs">
          {filtered.map((song) => (
            <li key={song.id}>
              <Link to={`/songbook/${folder.slug}/${song.id}`} className="perf-song perf-song-solo">
                <span className="perf-song-title">{song.title}</span>
                <span className="perf-song-artist">{song.artist}</span>
                {!song.lyrics.trim() && <span className="perf-song-flag">no lyrics yet</span>}
              </Link>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && <p className="perf-msg">No songs found.</p>}
      </div>
    </div>
  );
}
