import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SAMPLE_SONGS } from '../data/songs';
import type { Song } from '../models/song.model';

/**
 * The one place that knows where songs come from.
 * Components only call getSongs(); they never touch Supabase directly.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;
let cache: Promise<Song[]> | null = null;

function getClient(): SupabaseClient | null {
  if (!url || !key) return null;
  return (client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
}

async function load(): Promise<Song[]> {
  const db = getClient();
  if (!db) return [...SAMPLE_SONGS];

  const { data, error } = await db
    .from('songs')
    .select('id, title, artist')
    .eq('is_active', true)
    .order('title');

  if (error) {
    cache = null; // allow retry
    throw error;
  }
  return data as Song[];
}

/** Active songs sorted by title. Fetched once per page load. */
export function getSongs(): Promise<Song[]> {
  return (cache ??= load());
}
