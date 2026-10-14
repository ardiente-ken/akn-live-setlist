import { useCallback, useEffect, useState } from 'react';
import { getRequestsEnabled, subscribeToRequestsEnabled } from '../services/settingsService';

/**
 * Live "are song requests open?" flag, read from Supabase and kept in sync
 * through Realtime.
 *
 *   enabled === null  -> still loading (nothing known yet)
 *   enabled === true  -> open
 *   enabled === false -> closed
 *
 * If the first load fails, enabled stays null and `error` is set: callers
 * should treat that as closed. After a value is known, a later failure keeps
 * the last known value and resyncs automatically on reconnect. The database
 * enforces the flag either way.
 */
export function useRequestsEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setEnabled(await getRequestsEnabled());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the request setting');
    }
  }, []);

  useEffect(() => {
    void refresh();

    const unsubscribe = subscribeToRequestsEnabled({
      onChange: (value) => {
        setEnabled(value);
        setError(null);
      },
      onStatus: (status) => {
        setConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') void refresh(); // resync anything missed while offline
      },
    });

    // Phones suspend sockets when the screen sleeps: resync on wake
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  // While realtime is down, fall back to polling so the page still catches up
  useEffect(() => {
    if (connected) return;
    const t = window.setInterval(() => void refresh(), 20000);
    return () => window.clearInterval(t);
  }, [connected, refresh]);

  return { enabled, error, connected, refresh };
}
