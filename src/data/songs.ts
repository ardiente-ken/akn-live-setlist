import type { Song } from '../models/song.model';

/**
 * Local sample setlist. Used when Supabase env vars aren't set (or the request fails).
 * Replace these with your real songs: [title, artist].
 */
const raw: Array<[string, string]> = [
  ['Black Loafers', 'AKN'],
  ['Pasaway', 'AKN'],
  ['Is It You?', 'Ali Gatie'],
  ['Moving On', 'Ali Gatie'],
  ['Pasilyo', 'SunKissed Lola'],
  ['Mundo', 'IV of Spades'],
  ['Hey Barbara', 'IV of Spades'],
  ['Kathang Isip', 'Ben&Ben'],
  ['Leaves', 'Ben&Ben'],
  ['Maghintay Ka Lamang', 'Ben&Ben'],
  ['Migraine', 'Moira Dela Torre'],
  ['Paubaya', 'Moira Dela Torre'],
  ['Ikaw at Ako', 'Moira Dela Torre'],
  ['Tadhana', 'Up Dharma Down'],
  ['Sandali', 'December Avenue'],
  ['Kung Di Rin Lang Ikaw', 'December Avenue'],
  ['Dilaw', 'Maki'],
  ['Saan?', 'Maki'],
  ['Hindi Tayo Pwede', 'Maki'],
  ['Uptown Funk', 'Bruno Mars'],
  ['When I Was Your Man', 'Bruno Mars'],
  ['Just the Way You Are', 'Bruno Mars'],
  ['Locked Out of Heaven', 'Bruno Mars'],
  ['Perfect', 'Ed Sheeran'],
  ['Thinking Out Loud', 'Ed Sheeran'],
  ['Shape of You', 'Ed Sheeran'],
  ['Photograph', 'Ed Sheeran'],
  ['Take Me to Church', 'Hozier'],
  ['Cherry Wine', 'Hozier'],
  ['Binibini', 'Zack Tabudlo'],
  ['Give Me Your Forever', 'Zack Tabudlo'],
  ['Buwan', 'Juan Karlos'],
  ['Ere', 'Juan Karlos'],
];

export const SAMPLE_SONGS: Song[] = raw
  .map(([title, artist], i) => ({
    id: `local-${i + 1}`,
    title,
    artist,
    lyrics: '',
    chords: '',
    is_active: true,
    created_at: '',
    updated_at: '',
  }))
  .sort((a, b) => a.title.localeCompare(b.title));
