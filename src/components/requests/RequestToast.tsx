import { useEffect } from 'react';
import type { SongRequest } from '../../models/request.model';
import '../../styles/gig-theme.css';
import './requests.css';

interface Props {
  request: SongRequest | null;
  onDismiss: () => void;
  onOpen: () => void;
  /** Auto-hide delay in ms. */
  duration?: number;
}

export default function RequestToast({ request, onDismiss, onOpen, duration = 10000 }: Props) {
  useEffect(() => {
    if (!request) return;
    const t = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(t);
  }, [request, onDismiss, duration]);

  if (!request) return null;

  return (
    <div className="rq-toast gig-vars" role="status" aria-live="polite">
      <button className="rq-toast-body" onClick={onOpen}>
        <span className="rq-toast-label">Song request:</span>{' '}
        <strong>{request.title}</strong>
        {request.artist && <> by {request.artist}</>}
        {request.requester_name && <span className="rq-toast-by">from {request.requester_name}</span>}
      </button>
      <button className="rq-toast-x" aria-label="Dismiss" onClick={onDismiss}>×</button>
    </div>
  );
}
