import { useMemo } from 'react';
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import QueueButton from '../../components/requests/QueueButton';
import SongViewer from '../../components/songs/SongViewer';
import TransposeControl from '../../components/songs/TransposeControl';
import { useAuth } from '../../hooks/useAuth';
import { useFolders } from '../../hooks/useFolders';
import { useSongs } from '../../hooks/useSongs';
import { useTranspose } from '../../hooks/useTranspose';
import { songsForFolder } from '../../lib/folderSongs';
import { transposeInline, transposeText } from '../../lib/transpose';
import type { QueueContext } from '../../models/request.model';
import '../../styles/gig-theme.css';
import './performance.css';

export default function PerformanceSongPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const folderSlug = params.get('folder');
  const { requests, openPanel } = useOutletContext<QueueContext>();
  const { songs, loading, error } = useSongs({ activeOnly: true });
  const { isAdmin, loading: authLoading } = useAuth();
  const { folders, members, loading: foldersLoading } = useFolders({ enabled: isAdmin });
  const { semitones, up, down, reset } = useTranspose(id);

  const folder = folderSlug ? (folders.find((f) => f.slug === folderSlug) ?? null) : null;
  const waitingForFolder = !!folderSlug && !folder && (authLoading || foldersLoading);

  const list = useMemo(
    () => (folder ? songsForFolder(songs, folder, members) : songs),
    [songs, folder, members],
  );

  const suffix = folder ? `?folder=${encodeURIComponent(folder.slug)}` : '';
  const index = list.findIndex((s) => s.id === id);

  // Must stay above the early return below (hooks can't be conditional).
  const displayList = useMemo(() => {
    if (index < 0 || semitones === 0) return list;
    try {
      const song = list[index];
      const transposed = {
        ...song,
        lyrics: transposeText(song.lyrics, semitones),
        chords: transposeInline(song.chords, semitones),
      };
      return list.map((s, i) => (i === index ? transposed : s));
    } catch (e) {
      console.error('Transpose failed', e);
      return list;
    }
  }, [list, index, semitones]);

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
    <ErrorBoundary>
      <SongViewer
        songs={displayList}
        index={index}
        songPath={(songId) => `/perform/${songId}${suffix}`}
        backTo={`/perform${suffix}`}
        headerExtra={
          <>
            <TransposeControl semitones={semitones} onUp={up} onDown={down} onReset={reset} />
            <QueueButton count={requests.length} onClick={openPanel} />
          </>
        }
        banner={error ? <p className="perf-offline">Offline: using songs saved on this device.</p> : null}
      />
    </ErrorBoundary>
  );
}