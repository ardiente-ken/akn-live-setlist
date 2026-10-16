export interface Folder {
  id: string;
  name: string;
  /** URL-friendly name, used in /songbook/<slug>. */
  slug: string;
  description: string;
  /** Public folders get a shareable /songbook/<slug> page. */
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type FolderInput = Pick<Folder, 'name' | 'slug' | 'description' | 'is_public'>;

export const EMPTY_FOLDER: FolderInput = { name: '', slug: '', description: '', is_public: false };

/** A song's place in a folder. position = order within that folder. */
export interface FolderSong {
  folder_id: string;
  song_id: string;
  position: number;
}

/** What the public songbook page receives (only active songs, only public folders). */
export interface PublicSong {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  chords: string;
  position: number;
}

export interface PublicFolder {
  folder: { id: string; name: string; slug: string; description: string };
  songs: PublicSong[];
}

export interface PublicFolderSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  song_count: number;
}
