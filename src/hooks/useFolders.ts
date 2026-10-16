import { useCallback, useEffect, useState } from 'react';
import type { Folder, FolderSong } from '../models/folder.model';
import { getFolderMembers, getFolders } from '../services/folderService';

const CACHE_KEY = 'akn.folders.v1';

interface FolderData {
  folders: Folder[];
  members: FolderSong[];
}

function readCache(): FolderData {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as FolderData) : { folders: [], members: [] };
  } catch {
    return { folders: [], members: [] };
  }
}

function writeCache(data: FolderData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

/**
 * All folders + their song order (admin data). The last good copy is cached on
 * the device so the performer can still pick a folder when venue wifi drops.
 * Pass enabled: false when not signed in as admin (nothing is fetched or overwritten).
 */
export function useFolders({ enabled = true }: { enabled?: boolean } = {}) {
  const [data, setData] = useState<FolderData>(readCache);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [folders, members] = await Promise.all([getFolders(), getFolderMembers()]);
      const next = { folders, members };
      setData(next);
      writeCache(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load folders');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { folders: data.folders, members: data.members, loading, error, reload };
}
