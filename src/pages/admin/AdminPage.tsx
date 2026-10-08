import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SongSearch from '../../components/songs/SongSearch';
import { useSongs } from '../../hooks/useSongs';
import { filterSongs } from '../../lib/filterSongs';
import type { Song } from '../../models/song.model';
import { signOut } from '../../services/authService';
import { deleteSong } from '../../services/songService';

export default function AdminPage() {
  const { songs, loading, error, reload } = useSongs();
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => filterSongs(songs, query), [songs, query]);

  const handleDelete = async (song: Song) => {
    if (!window.confirm(`Delete "${song.title}"? This can't be undone.`)) return;
    setBusyId(song.id);
    setActionError(null);
    try {
      await deleteSong(song.id);
      await reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="admin-head">
        <h1>Song admin</h1>
        <div className="admin-actions">
          <Link to="/admin/songs/new" className="gt-btn gt-btn-primary">+ Add song</Link>
          <Link to="/perform" className="gt-btn">Performance mode</Link>
          <Link to="/" className="gt-btn">Site</Link>
          <button className="gt-btn" onClick={() => void signOut()}>Sign out</button>
        </div>
      </div>

      <SongSearch value={query} onChange={setQuery} />
      <p className="admin-count">
        {loading ? 'Loading…' : `${filtered.length} of ${songs.length} songs`}
      </p>
      {(error || actionError) && <p className="admin-error" role="alert">{error ?? actionError}</p>}

      <ul className="admin-list">
        {filtered.map((song) => (
          <li className="admin-row" key={song.id}>
            <div className="admin-row-main">
              <div className="admin-row-title">{song.title}</div>
              <div className="admin-row-sub">
                <span>{song.artist}</span>
                {!song.is_active && <span className="badge badge-off">Inactive</span>}
                {!song.lyrics.trim() && <span className="badge badge-warn">No lyrics</span>}
              </div>
            </div>
            <div className="admin-row-actions">
              <Link to={`/admin/songs/${song.id}/edit`} className="gt-btn gt-btn-sm">Edit</Link>
              <button
                className="gt-btn gt-btn-sm gt-btn-danger"
                disabled={busyId === song.id}
                onClick={() => void handleDelete(song)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!loading && filtered.length === 0 && <p className="admin-muted">No songs found.</p>}
    </>
  );
}
