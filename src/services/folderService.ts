// All database access for folders. Admin functions rely on RLS (admins only);
// the two public functions call security-definer RPCs that expose ONLY public
// folders and their active songs.
import { supabase } from '../lib/supabase';
import type {
  Folder,
  FolderInput,
  FolderSong,
  PublicFolder,
  PublicFolderSummary,
} from '../models/folder.model';

const FOLDERS = 'folders';
const MEMBERS = 'folder_songs';

function friendly(message: string): Error {
  if (/folders_slug_key|duplicate key/i.test(message)) {
    return new Error('That link name is already used by another folder.');
  }
  if (/folders_slug_check/i.test(message)) {
    return new Error('The link name can only use lowercase letters, numbers and dashes.');
  }
  if (/row-level security|permission denied/i.test(message)) {
    return new Error('Only the admin can change folders. Sign in at /admin first.');
  }
  return new Error(message);
}

/* ---------------- admin ---------------- */

export async function getFolders(): Promise<Folder[]> {
  const { data, error } = await supabase.from(FOLDERS).select('*').order('name', { ascending: true });
  if (error) throw friendly(error.message);
  return (data ?? []) as Folder[];
}

export async function getFolderMembers(): Promise<FolderSong[]> {
  const { data, error } = await supabase
    .from(MEMBERS)
    .select('folder_id, song_id, position')
    .order('position', { ascending: true });
  if (error) throw friendly(error.message);
  return (data ?? []) as FolderSong[];
}

export async function createFolder(input: FolderInput): Promise<Folder> {
  const { data, error } = await supabase.from(FOLDERS).insert(input).select().single();
  if (error) throw friendly(error.message);
  return data as Folder;
}

export async function updateFolder(id: string, input: Partial<FolderInput>): Promise<Folder> {
  const { data, error } = await supabase.from(FOLDERS).update(input).eq('id', id).select().maybeSingle();
  if (error) throw friendly(error.message);
  if (!data) throw new Error('Folder not found, or you do not have permission to edit it.');
  return data as Folder;
}

/** Deletes the folder only. The songs themselves are never deleted. */
export async function deleteFolder(id: string): Promise<void> {
  const { data, error } = await supabase.from(FOLDERS).delete().eq('id', id).select('id');
  if (error) throw friendly(error.message);
  if (!data || data.length === 0) throw new Error('Folder not found, or you do not have permission to delete it.');
}

/** Appends songs to the end of a folder. Songs already in it are skipped. */
export async function addSongsToFolder(
  folderId: string,
  songIds: string[],
  startPosition: number,
): Promise<void> {
  if (songIds.length === 0) return;
  const rows = songIds.map((song_id, i) => ({
    folder_id: folderId,
    song_id,
    position: startPosition + i,
  }));
  const { error } = await supabase
    .from(MEMBERS)
    .upsert(rows, { onConflict: 'folder_id,song_id', ignoreDuplicates: true });
  if (error) throw friendly(error.message);
}

export async function removeSongFromFolder(folderId: string, songId: string): Promise<void> {
  const { error } = await supabase.from(MEMBERS).delete().eq('folder_id', folderId).eq('song_id', songId);
  if (error) throw friendly(error.message);
}

/** Saves a new order for a folder in one request. */
export async function reorderFolderSongs(folderId: string, orderedSongIds: string[]): Promise<void> {
  const rows = orderedSongIds.map((song_id, position) => ({ folder_id: folderId, song_id, position }));
  const { error } = await supabase.from(MEMBERS).upsert(rows, { onConflict: 'folder_id,song_id' });
  if (error) throw friendly(error.message);
}

/* ---------------- public (anonymous OK) ---------------- */

/** null = no such folder, or it isn't public. */
export async function getPublicFolder(slug: string): Promise<PublicFolder | null> {
  const { data, error } = await supabase.rpc('get_public_folder', { p_slug: slug });
  if (error) throw new Error(error.message);
  return (data as PublicFolder | null) ?? null;
}

export async function listPublicFolders(): Promise<PublicFolderSummary[]> {
  const { data, error } = await supabase.rpc('list_public_folders');
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicFolderSummary[];
}
