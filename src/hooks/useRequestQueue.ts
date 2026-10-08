import { useCallback, useEffect, useState } from 'react';
import type { RequestStatus, SongRequest } from '../models/request.model';
import {
  dismissAllPending,
  getPendingRequests,
  setRequestStatus,
  subscribeToRequests,
} from '../services/requestService';

const byCreated = (a: SongRequest, b: SongRequest) => a.created_at.localeCompare(b.created_at);

/** Live queue of pending requests + the latest one as a toast. */
export function useRequestQueue() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [toast, setToast] = useState<SongRequest | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setRequests(await getPendingRequests());
    } catch {
      /* keep what we have; realtime or the next reload will catch up */
    }
  }, []);

  useEffect(() => {
    void reload();

    const unsubscribe = subscribeToRequests({
      onInsert: (r) => {
        if (r.status !== 'pending') return;
        setRequests((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r].sort(byCreated)));
        setToast(r);
        navigator.vibrate?.(200); // Android only; harmless elsewhere
      },
      onUpdate: (r) =>
        setRequests((prev) => {
          if (r.status !== 'pending') return prev.filter((x) => x.id !== r.id);
          return prev.some((x) => x.id === r.id)
            ? prev.map((x) => (x.id === r.id ? r : x))
            : [...prev, r].sort(byCreated);
        }),
      onDelete: (id) => setRequests((prev) => prev.filter((x) => x.id !== id)),
      onStatus: (status) => {
        setConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') void reload(); // catch anything missed while disconnected
      },
    });

    // Phones suspend sockets when the screen sleeps: resync on wake
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [reload]);

  const dismissToast = useCallback(() => setToast(null), []);

  const resolve = useCallback(async (id: string, status: Exclude<RequestStatus, 'pending'>) => {
    setError(null);
    try {
      await setRequestStatus(id, status);
      setRequests((prev) => prev.filter((x) => x.id !== id));
      setToast((t) => (t?.id === id ? null : t));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update the request');
    }
  }, []);

  const clearAll = useCallback(async () => {
    setError(null);
    try {
      await dismissAllPending();
      setRequests([]);
      setToast(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not clear the queue');
    }
  }, []);

  return { requests, toast, connected, error, dismissToast, resolve, clearAll };
}
