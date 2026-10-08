import { Link } from 'react-router-dom';
import { timeAgo } from '../../lib/timeAgo';
import type { RequestStatus, SongRequest } from '../../models/request.model';
import '../../styles/gig-theme.css';
import './requests.css';

interface Props {
  requests: SongRequest[];
  /** Only signed-in admins can mark played / dismiss. */
  canManage: boolean;
  connected: boolean;
  error: string | null;
  onClose: () => void;
  onResolve: (id: string, status: Exclude<RequestStatus, 'pending'>) => void;
  onClearAll: () => void;
}

export default function RequestQueuePanel({
  requests, canManage, connected, error, onClose, onResolve, onClearAll,
}: Props) {
  return (
    <div className="rq-overlay gig-vars" onClick={onClose}>
      <section
        className="rq-sheet"
        role="dialog"
        aria-label="Request queue"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="rq-head">
          <h2>Requests ({requests.length})</h2>
          <span className={`rq-live ${connected ? 'on' : ''}`}>{connected ? '● Live' : 'Reconnecting…'}</span>
          <button className="rq-close" aria-label="Close queue" onClick={onClose}>×</button>
        </header>

        {error && <p className="rq-error" role="alert">{error}</p>}
        {requests.length === 0 && <p className="rq-empty">No requests waiting.</p>}

        <ol className="rq-list">
          {requests.map((r, i) => (
            <li className="rq-item" key={r.id}>
              <span className="rq-num">{i + 1}</span>
              <div className="rq-main">
                <div className="rq-title">{r.title}</div>
                <div className="rq-sub">
                  {[r.artist, r.requester_name && `from ${r.requester_name}`, timeAgo(r.created_at)]
                    .filter(Boolean)
                    .join(' · ')}
                  {!r.song_id && ' · not in library'}
                </div>
              </div>
              <div className="rq-actions">
                {r.song_id && (
                  <Link to={`/perform/${r.song_id}`} className="rq-btn" onClick={onClose}>
                    Open
                  </Link>
                )}
                {canManage && (
                  <>
                    <button className="rq-btn ok" aria-label="Mark played" onClick={() => onResolve(r.id, 'played')}>✓</button>
                    <button className="rq-btn no" aria-label="Dismiss request" onClick={() => onResolve(r.id, 'dismissed')}>✕</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>

        {!canManage && (
          <p className="rq-hint">
            To mark requests as played, <Link to="/admin">sign in as admin</Link> once on this device.
          </p>
        )}
        {canManage && requests.length > 1 && (
          <div className="rq-foot">
            <button
              className="rq-btn no"
              onClick={() => {
                if (window.confirm('Dismiss all waiting requests?')) onClearAll();
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
