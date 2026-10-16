import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PublicFolderSummary } from '../../models/folder.model';
import { listPublicFolders } from '../../services/folderService';
import '../../styles/gig-theme.css';
import '../performance/performance.css';

/** Public list of the folders that have been shared. */
export default function SongbookIndexPage() {
  const [folders, setFolders] = useState<PublicFolderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPublicFolders()
      .then((f) => !cancelled && setFolders(f))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load songbooks'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="perf gig-theme">
      <header className="perf-bar">
        <Link to="/" className="perf-link">← Home</Link>
        <h1>Songbooks</h1>
        <span style={{ width: 72 }} />
      </header>
      <div className="perf-picker-body">
        {loading && <p className="perf-msg">Loading…</p>}
        {error && <p className="perf-msg">Couldn't load songbooks: {error}</p>}
        {!loading && !error && folders.length === 0 && (
          <p className="perf-msg">No songbooks have been shared yet.</p>
        )}
        <ul className="perf-songs">
          {folders.map((f) => (
            <li key={f.id}>
              <Link to={`/songbook/${f.slug}`} className="perf-song perf-song-solo">
                <span className="perf-song-title">{f.name}</span>
                <span className="perf-song-artist">
                  {f.song_count} {f.song_count === 1 ? 'song' : 'songs'}
                  {f.description ? ` · ${f.description}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
