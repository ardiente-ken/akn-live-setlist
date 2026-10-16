import { Link, useOutletContext, useParams } from 'react-router-dom';
import SongViewer from '../../components/songs/SongViewer';
import '../../styles/gig-theme.css';
import '../performance/performance.css';
import type { SongbookContext } from './SongbookLayout';

/** Public, read-only song view with chords, swipe and Prev/Next, within one folder. */
export default function SongbookSongPage() {
  const { id } = useParams();
  const { data, offline } = useOutletContext<SongbookContext>();
  const { folder, songs } = data;
  const index = songs.findIndex((s) => s.id === id);

  if (index < 0) {
    return (
      <div className="perf gig-theme">
        <header className="perf-bar">
          <Link to={`/songbook/${folder.slug}`} className="perf-link">← {folder.name}</Link>
        </header>
        <p className="perf-msg">Song not found in this songbook.</p>
      </div>
    );
  }

  return (
    <SongViewer
      songs={songs}
      index={index}
      songPath={(songId) => `/songbook/${folder.slug}/${songId}`}
      backTo={`/songbook/${folder.slug}`}
      banner={offline ? <p className="perf-offline">Offline: showing the last saved copy.</p> : null}
    />
  );
}
