import { useMemo } from 'react';
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import QueueButton from '../../components/requests/QueueButton';
import SongViewer from '../../components/songs/SongViewer';
import { useAuth } from '../../hooks/useAuth';
import { useFolders } from '../../hooks/useFolders';
import { useSongs } from '../../hooks/useSongs';
import { songsForFolder } from '../../lib/folderSongs';
import type { QueueContext } from '../../models/request.model';
import '../../styles/gig-theme.css';
import './performance.css';

/**
 * Read-only song view. With ?folder=<slug> the song list (and the "3 / 18"
 * position, swipe order and Prev/Next) is limited to that folder, in its order.
 */
export default function PerformanceSongPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const folderSlug = params.get('folder');
  const { requests, openPanel } = useOutletContext<QueueContext>();
  const { songs, loading, error } = useSongs({ activeOnly: true });
  const { isAdmin, loading: authLoading } = useAuth();
  const { folders, members, loading: foldersLoading } = useFolders({ enabled: isAdmin });

  const folder = folderSlug ? (folders.find((f) => f.slug === folderSlug) ?? null) : null;
  const waitingForFolder = !!folderSlug && !folder && (authLoading || foldersLoading);

  const list = useMemo(
    () => (folder ? songsForFolder(songs, folder, members) : songs),
    [songs, folder, members],
  );

  const suffix = folder ? `?folder=${encodeURIComponent(folder.slug)}` : '';
  const index = list.findIndex((s) => s.id === id);

  if (index < 0) {
    return (
      <div className="perf gig-theme">
        <header className="perf-bar">
          <Link to={`/perform${suffix}`} className="perf-link">← Songs</Link>
        </header>
        <p className="perf-msg">
          {loading || waitingForFolder
            ? 'Loading…'
            : error && songs.length === 0
              ? `Couldn't load songs: ${error}`
              : 'Song not found.'}
        </p>
      </div>
    );
  }

  return (
    <SongViewer
      songs={list}
      index={index}
      songPath={(songId) => `/perform/${songId}${suffix}`}
      backTo={`/perform${suffix}`}
      headerExtra={<QueueButton count={requests.length} onClick={openPanel} />}
      banner={error ? <p className="perf-offline">Offline: using songs saved on this device.</p> : null}
    />
  );
}
