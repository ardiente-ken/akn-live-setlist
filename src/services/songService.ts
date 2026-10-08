// The single place that talks to the `songs` table.
// NOTE: if your existing songService.ts exports other functions that
// Setlist / SongFilter use, merge them into this file rather than losing them.
import { supabase } from '../lib/supabase';
import type { Song, SongInput } from '../models/song.model';

const TABLE = 'songs';

export interface GetSongsOptions {
  /** Only songs marked active (public setlist + performance mode). */
  activeOnly?: boolean;
}

export async function getSongs({ activeOnly = false }: GetSongsOptions = {}): Promise<Song[]> {
  let query = supabase.from(TABLE).select('*').order('title', { ascending: true });
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Song[];
}

export async function getSong(id: string): Promise<Song | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Song | null) ?? null;
}

export async function createSong(song: SongInput): Promise<Song> {
  const { data, error } = await supabase.from(TABLE).insert(song).select().single();
  if (error) throw new Error(error.message);
  return data as Song;
}

export async function updateSong(id: string, song: Partial<SongInput>): Promise<Song> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(song)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Song not found, or you do not have permission to edit it.');
  return data as Song;
}

export async function deleteSong(id: string): Promise<void> {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error('Song not found, or you do not have permission to delete it.');
  }
}
