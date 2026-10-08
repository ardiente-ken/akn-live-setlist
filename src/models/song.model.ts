export interface Song {
  id: string;
  title: string;
  artist: string;
  /** Lyrics, optionally with chords: [Am]inline or on a line above. */
  lyrics: string;
  /** Quick reference shown above the lyrics, e.g. "Capo 2 · Am F C G". */
  chords: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** What the admin form edits / what create & update accept. */
export type SongInput = Pick<Song, 'title' | 'artist' | 'lyrics' | 'chords' | 'is_active'>;

export const EMPTY_SONG: SongInput = {
  title: '',
  artist: '',
  lyrics: '',
  chords: '',
  is_active: true,
};

export function toSongInput(song: Song): SongInput {
  const { title, artist, lyrics, chords, is_active } = song;
  return { title, artist, lyrics, chords, is_active };
}
