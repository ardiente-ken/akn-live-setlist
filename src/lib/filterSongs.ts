export function filterSongs<T extends { title: string; artist: string }>(
  songs: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return songs;
  return songs.filter((s) => `${s.title} ${s.artist}`.toLowerCase().includes(q));
}
