import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFolders } from '../../hooks/useFolders';
import type { Folder } from '../../models/folder.model';
import { deleteFolder } from '../../services/folderService';

export function copyFolderLink(folder: Folder) {
  const url = `${window.location.origin}/songbook/${folder.slug}`;
  if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(url);
  else window.prompt('Copy this link:', url);
}

export default function FoldersPage() {
  const { folders, members, loading, error, reload } = useFolders();
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const countFor = (id: string) => members.filter((m) => m.folder_id === id).length;

  const handleDelete = async (folder: Folder) => {
    if (!window.confirm(`Delete the folder "${folder.name}"? Your songs are NOT deleted.`)) return;
    setActionError(null);
    try {
      await deleteFolder(folder.id);
      await reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <>
      <div className="admin-head">
        <h1>Folders</h1>
        <div className="admin-actions">
          <Link to="/admin/folders/new" className="gt-btn gt-btn-primary">+ New folder</Link>
          <Link to="/admin" className="gt-btn">← Songs</Link>
        </div>
      </div>

      {(error || actionError) && <p className="admin-error" role="alert">{actionError ?? error}</p>}
      {loading && folders.length === 0 && <p className="admin-muted">Loading…</p>}
      {!loading && folders.length === 0 && (
        <p className="admin-muted">No folders yet. Create one for an event, like "Christmas Event".</p>
      )}

      <ul className="admin-list">
        {folders.map((f) => (
          <li className="admin-row" key={f.id}>
            <div className="admin-row-main">
              <div className="admin-row-title">{f.name}</div>
              <div className="admin-row-sub">
                <span>{countFor(f.id)} songs</span>
                <span className={`badge ${f.is_public ? 'badge-warn' : 'badge-off'}`}>
                  {f.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
            <div className="admin-row-actions">
              {f.is_public && (
                <button className="gt-btn gt-btn-sm"
                  onClick={() => { copyFolderLink(f); setCopied(f.id); window.setTimeout(() => setCopied(null), 2000); }}>
                  {copied === f.id ? 'Copied ✓' : 'Copy link'}
                </button>
              )}
              <Link to={`/admin/folders/${f.id}`} className="gt-btn gt-btn-sm">Edit</Link>
              <button className="gt-btn gt-btn-sm gt-btn-danger" onClick={() => void handleDelete(f)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
