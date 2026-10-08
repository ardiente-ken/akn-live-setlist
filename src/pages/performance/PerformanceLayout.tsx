import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import RequestQueuePanel from '../../components/requests/RequestQueuePanel';
import RequestToast from '../../components/requests/RequestToast';
import { useAuth } from '../../hooks/useAuth';
import { useRequestQueue } from '../../hooks/useRequestQueue';
import type { QueueContext } from '../../models/request.model';

/**
 * Wraps /perform and /perform/:id so there is ONE realtime subscription,
 * one toast and one queue panel shared by both screens.
 */
export default function PerformanceLayout() {
  const queue = useRequestQueue();
  const { isAdmin } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const openPanel = useCallback(() => setPanelOpen(true), []);

  const context: QueueContext = { requests: queue.requests, openPanel };

  return (
    <>
      <Outlet context={context} />
      <RequestToast
        request={queue.toast}
        onDismiss={queue.dismissToast}
        onOpen={() => {
          queue.dismissToast();
          setPanelOpen(true);
        }}
      />
      {panelOpen && (
        <RequestQueuePanel
          requests={queue.requests}
          canManage={isAdmin}
          connected={queue.connected}
          error={queue.error}
          onClose={() => setPanelOpen(false)}
          onResolve={(id, status) => void queue.resolve(id, status)}
          onClearAll={() => void queue.clearAll()}
        />
      )}
    </>
  );
}
