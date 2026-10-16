import { useMemo, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import FolderChips from '../../components/folders/FolderChips';
import QueueButton from '../../components/requests/QueueButton';
import RequestsToggle from '../../components/requests/RequestsToggle';
import SongSearch from '../../components/songs/SongSearch';
import { useAuth } from '../../hooks/useAuth';
import { useFolders } from '../../hooks/useFolders';
import { usePlayedSongs } from '../../hooks/usePlayedSongs';
import { useSongs } from '../../hooks/useSongs';
import { filterSongs } from '../../lib/filterSongs';
import { songsForFolder } from '../../lib/folderSongs';
import type { QueueContext } from '../../models/request.model';
import '../../styles/gig-theme.css';
import './performance.css';

/** Step 1 of Performance Mode: pick a folder (optional), search, pick a song. Read-only. */
export default function PerformancePage() {
  const { songs, loading, error } = useSongs({ activeOnly: true });
  const { requests, openPanel } = useOutletContext<QueueContext>();
  const { isPlayed, toggle, count } = usePlayedSongs();
  const { isAdmin } = useAuth();
  const { folders, members } = useFolders({ enabled: isAdmin });
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const folder = folders.find((f) => f.slug === params.get('folder')) ?? null;
  const list = useMemo(
    () => (folder ? songsForFolder(songs, folder, members) : songs),
    [songs, folder, members],
  );
  const filtered = useMemo(() => filterSongs(list, query), [list, query]);
  const suffix = folder ? `?folder=${encodeURIComponent(folder.slug)}` : '';

  return (
    <div className="perf gig-theme">
      <header className="perf-bar">
        <Link to="/" className="perf-link">← Setlist</Link>
        <h1>Performance mode</h1>
        <QueueButton count={requests.length} onClick={openPanel} />
      </header>
      {error && songs.length > 0 && (
        <p className="perf-offline">Offline: showing songs saved on this device.</p>
      )}
      <div className="perf-picker-body">
        {isAdmin && <RequestsToggle />}
        <SongSearch value={query} onChange={setQuery} />
        <FolderChips
          folders={folders}
          active={folder?.slug ?? null}
          onSelect={(slug) => setParams(slug ? { folder: slug } : {}, { replace: true })}
        />
        {songs.length > 0 && (
          <p className="perf-played-count">
            {folder ? `${folder.name} · ${list.length} songs · ` : ''}★ {count} played
          </p>
        )}
        {loading && songs.length === 0 && <p className="perf-msg">Loading songs…</p>}
        {error && songs.length === 0 && <p className="perf-msg">Couldn't load songs: {error}</p>}
        <ul className="perf-songs">
          {filtered.map((song) => {
            const played = isPlayed(song.id);
            return (
              <li key={song.id} className={`perf-song-row ${played ? 'is-played' : ''}`}>
                <Link to={`/perform/${song.id}${suffix}`} className="perf-song">
                  <span className="perf-song-title">{song.title}</span>
                  <span className="perf-song-artist">{song.artist}</span>
                  {!song.lyrics.trim() && <span className="perf-song-flag">no lyrics yet</span>}
                </Link>
                <button
                  type="button"
                  className="perf-star"
                  aria-pressed={played}
                  aria-label={played ? `Unmark ${song.title} as played` : `Mark ${song.title} as played`}
                  onClick={() => toggle(song.id)}
                >
                  {played ? '★' : '☆'}
                </button>
              </li>
            );
          })}
        </ul>
        {!loading && !error && filtered.length === 0 && <p className="perf-msg">No songs found.</p>}
      </div>
    </div>
  );
}
