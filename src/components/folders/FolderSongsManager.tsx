import { useEffect, useMemo, useState } from 'react';
import SongSearch from '../songs/SongSearch';
import { useSongs } from '../../hooks/useSongs';
import { filterSongs } from '../../lib/filterSongs';
import {
  addSongsToFolder,
  removeSongFromFolder,
  reorderFolderSongs,
} from '../../services/folderService';

interface Props {
  folderId: string;
  /** Song ids currently in the folder, in order. */
  memberIds: string[];
  /** Called after any change so the parent can reload from the database. */
  onChanged: () => Promise<void> | void;
}

/** Add many songs at once, remove, and reorder the songs inside one folder. */
export default function FolderSongsManager({ folderId, memberIds, onChanged }: Props) {
  const { songs, loading } = useSongs(); // all songs, including inactive ones
  const [order, setOrder] = useState<string[]>(memberIds);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setOrder(memberIds), [memberIds]);

  const byId = useMemo(() => new Map(songs.map((s) => [s.id, s])), [songs]);
  const inFolder = new Set(order);
  const available = useMemo(
    () => filterSongs(songs.filter((s) => !order.includes(s.id)), query),
    [songs, order, query],
  );

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      await onChanged(); // resync with the database
    } finally {
      setBusy(false);
    }
  };

  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next); // instant
    void run(() => reorderFolderSongs(folderId, next));
  };

  const remove = (songId: string) => {
    setOrder((o) => o.filter((id) => id !== songId));
    void run(() => removeSongFromFolder(folderId, songId));
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allShownSelected = available.length > 0 && available.every((s) => selected.has(s.id));
  const toggleAllShown = () =>
    setSelected((s) => {
      const next = new Set(s);
      if (allShownSelected) available.forEach((x) => next.delete(x.id));
      else available.forEach((x) => next.add(x.id));
      return next;
    });

  const addSelected = () => {
    const ids = available.map((s) => s.id).filter((id) => selected.has(id));
    // keep ticked songs that are hidden by the current search too
    const hidden = [...selected].filter((id) => !ids.includes(id) && !inFolder.has(id));
    const all = [...ids, ...hidden];
    if (all.length === 0) return;
    setSelected(new Set());
    void run(() => addSongsToFolder(folderId, all, order.length));
  };

  return (
    <div className="fm">
      {error && <p className="admin-error" role="alert">{error}</p>}

      <section className="fm-section">
        <h2>In this folder ({order.length})</h2>
        {order.length === 0 && <p className="admin-muted">No songs yet. Add some below.</p>}
        <ol className="fm-list">
          {order.map((id, i) => {
            const song = byId.get(id);
            return (
              <li className="fm-row" key={id}>
                <span className="fm-num">{i + 1}</span>
                <div className="fm-row-main">
                  <div className="fm-row-title">{song?.title ?? 'Unknown song'}</div>
                  <div className="fm-row-sub">
                    {song?.artist}{song && !song.is_active ? ' · inactive (hidden from public)' : ''}
                  </div>
                </div>
                <div className="fm-tools">
                  <button className="gt-btn gt-btn-sm" aria-label="Move up" disabled={busy || i === 0}
                    onClick={() => move(i, -1)}>↑</button>
                  <button className="gt-btn gt-btn-sm" aria-label="Move down" disabled={busy || i === order.length - 1}
                    onClick={() => move(i, 1)}>↓</button>
                  <button className="gt-btn gt-btn-sm gt-btn-danger" aria-label="Remove from folder" disabled={busy}
                    onClick={() => remove(id)}>✕</button>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="fm-section">
        <h2>Add songs</h2>
        <SongSearch value={query} onChange={setQuery} placeholder="Search songs to add…" />
        <div className="fm-bar">
          <button type="button" className="gt-btn gt-btn-sm" onClick={toggleAllShown} disabled={available.length === 0}>
            {allShownSelected ? 'Unselect all shown' : 'Select all shown'}
          </button>
          <button type="button" className="gt-btn gt-btn-sm gt-btn-primary" disabled={busy || selected.size === 0}
            onClick={addSelected}>
            Add {selected.size > 0 ? `${selected.size} selected` : 'selected'}
          </button>
        </div>
        {loading && <p className="admin-muted">Loading songs…</p>}
        <ul className="fm-list">
          {available.map((s) => (
            <li key={s.id}>
              <label className="fm-pick">
                <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                <span className="fm-row-main">
                  <span className="fm-row-title">{s.title}</span>
                  <span className="fm-row-sub"> {s.artist}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        {!loading && available.length === 0 && <p className="admin-muted">No more songs to add.</p>}
      </section>
    </div>
  );
}
