import { Link, Outlet, useParams } from 'react-router-dom';
import type { PublicFolder } from '../../models/folder.model';
import { usePublicFolder } from '../../hooks/usePublicFolder';
import '../../styles/gig-theme.css';
import '../performance/performance.css';

export type SongbookContext = { data: PublicFolder; offline: boolean };

/** Loads one public folder once and shares it with the list + song pages. */
export default function SongbookLayout() {
  const { slug } = useParams();
  const { data, loading, error } = usePublicFolder(slug);

  if (!data) {
    return (
      <div className="perf gig-theme">
        <header className="perf-bar">
          <Link to="/songbook" className="perf-link">← Songbooks</Link>
        </header>
        <p className="perf-msg">
          {loading
            ? 'Loading…'
            : error
              ? `Couldn't load this songbook: ${error}`
              : "This songbook isn't available. It may be private or the link may be wrong."}
        </p>
      </div>
    );
  }

  const context: SongbookContext = { data, offline: !!error };
  return <Outlet context={context} />;
}
