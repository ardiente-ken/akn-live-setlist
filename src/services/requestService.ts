// All database + realtime access for song requests lives here.
import { supabase } from '../lib/supabase';
import type { NewSongRequest, RequestStatus, SongRequest } from '../models/request.model';

const TABLE = 'song_requests';

export async function getPendingRequests(): Promise<SongRequest[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as SongRequest[];
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function createRequest(input: NewSongRequest): Promise<void> {
  const title = input.title.trim().slice(0, 120);
  const artist = input.artist.trim().slice(0, 120);
  const requester_name = input.requester_name.trim().slice(0, 40);
  if (!title) throw new Error('Please enter a song title.');

  // Friendly duplicate check (the queue is public-readable)
  let dup = supabase.from(TABLE).select('id').eq('status', 'pending').limit(1);
  dup = input.song_id ? dup.eq('song_id', input.song_id) : dup.ilike('title', escapeLike(title));
  const { data: existing } = await dup;
  if (existing && existing.length > 0) throw new Error('That song is already in the queue 👍');

  const { error } = await supabase
    .from(TABLE)
    .insert({ song_id: input.song_id, title, artist, requester_name });
  if (error) {
    throw new Error(
      error.message.includes('row-level security')
        ? 'The request queue is full right now. Please try again in a bit.'
        : error.message,
    );
  }
}

/** Admin only (enforced by RLS). */
export async function setRequestStatus(
  id: string,
  status: Exclude<RequestStatus, 'pending'>,
): Promise<void> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status, handled_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Not allowed. Sign in as admin to manage the queue.');
}

/** Admin only: dismiss everything still pending (e.g. at the end of a gig). */
export async function dismissAllPending(): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'dismissed', handled_at: new Date().toISOString() })
    .eq('status', 'pending');
  if (error) throw new Error(error.message);
}

export interface RequestHandlers {
  onInsert: (request: SongRequest) => void;
  onUpdate: (request: SongRequest) => void;
  onDelete: (id: string) => void;
  onStatus?: (status: string) => void;
}

/** Realtime subscription. Returns an unsubscribe function. */
export function subscribeToRequests(h: RequestHandlers): () => void {
  // Unique topic per subscription (safe with React StrictMode double-mounts)
  const channel = supabase
    .channel(`song-requests-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, (p) =>
      h.onInsert(p.new as SongRequest),
    )
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TABLE }, (p) =>
      h.onUpdate(p.new as SongRequest),
    )
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: TABLE }, (p) => {
      const id = (p.old as { id?: string }).id;
      if (id) h.onDelete(id);
    })
    .subscribe((status) => h.onStatus?.(status));

  return () => {
    void supabase.removeChannel(channel);
  };
}
