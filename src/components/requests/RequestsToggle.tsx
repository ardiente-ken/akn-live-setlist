import { useState } from 'react';
import { useRequestsEnabled } from '../../hooks/useRequestsEnabled';
import { setRequestsEnabled } from '../../services/settingsService';
import './requests.css';

/** Admin switch: open/close song requests for everyone, instantly. */
export default function RequestsToggle() {
  const { enabled, error, refresh } = useRequestsEnabled();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const known = enabled !== null;

  const toggle = async () => {
    if (!known || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await setRequestsEnabled(!enabled);
      await refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not change the setting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rt">
      <div className="rt-text">
        <div className="rt-title" id="rt-label">
          Song requests: {!known ? (error ? 'unavailable' : 'loading…') : enabled ? 'Open' : 'Closed'}
        </div>
        <div className="rt-sub">
          {enabled === false
            ? 'Visitors see “requests are closed”. Existing requests stay in your queue.'
            : 'Visitors can send requests. Turn off to stop new ones.'}
        </div>
        {(saveError || (error && !known)) && (
          <div className="rt-error" role="alert">{saveError ?? error}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        className="rt-switch"
        aria-checked={enabled === true}
        aria-labelledby="rt-label"
        disabled={!known || saving}
        onClick={() => void toggle()}
      />
    </div>
  );
}
