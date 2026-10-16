import type { Folder, FolderSong } from '../models/folder.model';

/** Songs that belong to a folder, in the folder's own order. */
export function songsForFolder<T extends { id: string }>(
  songs: T[],
  folder: Folder,
  members: FolderSong[],
): T[] {
  const byId = new Map(songs.map((s) => [s.id, s]));
  return members
    .filter((m) => m.folder_id === folder.id)
    .sort((a, b) => a.position - b.position)
    .map((m) => byId.get(m.song_id))
    .filter((s): s is T => s !== undefined);
}

/** "Christmas Event 🎄" -> "christmas-event" */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}
