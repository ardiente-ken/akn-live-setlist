// Global app settings. Currently one flag: are song requests open?
// The DATABASE enforces it (see requests_open() + the insert policy on
// song_requests); this service just reads and changes the flag.
import { supabase } from '../lib/supabase';

const TABLE = 'app_settings';
const KEY = 'requests_enabled';

export async function getRequestsEnabled(): Promise<boolean> {
  const { data, error } = await supabase.from(TABLE).select('value').eq('key', KEY).maybeSingle();
  if (error) throw new Error(error.message);
  // Missing row = closed (matches the database's fail-closed behavior)
  return data?.value === true;
}

/** Admin only (enforced by RLS). */
export async function setRequestsEnabled(enabled: boolean): Promise<void> {
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ key: KEY, value: enabled }, { onConflict: 'key' })
    .select('value');
  if (error) {
    const denied = /row-level security|permission denied/i.test(error.message);
    throw new Error(denied ? 'Only the admin can change this. Sign in at /admin first.' : error.message);
  }
  if (!data || data.length === 0) throw new Error('The setting could not be saved.');
}

export interface SettingsHandlers {
  onChange: (enabled: boolean) => void;
  onStatus?: (status: string) => void;
}

/** Realtime subscription to the flag. Returns an unsubscribe function. */
export function subscribeToRequestsEnabled(h: SettingsHandlers): () => void {
  const channel = supabase
    .channel(`app-settings-${Math.random().toString(36).slice(2)}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE, filter: `key=eq.${KEY}` },
      (payload) => {
        if (payload.eventType === 'DELETE') h.onChange(false);
        else h.onChange((payload.new as { value?: unknown }).value === true);
      },
    )
    .subscribe((status) => h.onStatus?.(status));

  return () => {
    void supabase.removeChannel(channel);
  };
}
