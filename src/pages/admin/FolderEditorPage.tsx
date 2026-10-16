import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FolderForm from '../../components/folders/FolderForm';
import FolderSongsManager from '../../components/folders/FolderSongsManager';
import { useFolders } from '../../hooks/useFolders';
import { createFolder, updateFolder } from '../../services/folderService';
import { copyFolderLink } from './FoldersPage';

/** /admin/folders/new  creates a folder; /admin/folders/:id edits it and manages its songs. */
export default function FolderEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { folders, members, loading, reload } = useFolders();

  const folder = id ? (folders.find((f) => f.id === id) ?? null) : null;
  const memberIds = useMemo(
    () =>
      members
        .filter((m) => m.folder_id === id)
        .sort((a, b) => a.position - b.position)
        .map((m) => m.song_id),
    [members, id],
  );

  if (!id) {
    return (
      <>
        <div className="admin-head"><h1>New folder</h1></div>
        <FolderForm
          submitLabel="Create folder"
          onSubmit={async (values) => {
            const created = await createFolder(values);
            navigate(`/admin/folders/${created.id}`); // straight on to adding songs
          }}
          onCancel={() => navigate('/admin/folders')}
        />
      </>
    );
  }

  if (!folder) {
    return loading ? (
      <p className="admin-muted">Loading…</p>
    ) : (
      <>
        <p className="admin-error">Folder not found.</p>
        <Link to="/admin/folders" className="gt-btn">← Back</Link>
      </>
    );
  }

  return (
    <>
      <div className="admin-head">
        <h1>{folder.name}</h1>
        <div className="admin-actions">
          {folder.is_public && (
            <>
              <button className="gt-btn" onClick={() => copyFolderLink(folder)}>Copy public link</button>
              <Link to={`/songbook/${folder.slug}`} className="gt-btn">View public page</Link>
            </>
          )}
          <Link to={`/perform?folder=${folder.slug}`} className="gt-btn">Perform</Link>
          <Link to="/admin/folders" className="gt-btn">← Folders</Link>
        </div>
      </div>

      <FolderForm
        key={folder.updated_at}
        initial={{ name: folder.name, slug: folder.slug, description: folder.description, is_public: folder.is_public }}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          await updateFolder(folder.id, values);
          await reload();
        }}
        onCancel={() => navigate('/admin/folders')}
      />

      <FolderSongsManager folderId={folder.id} memberIds={memberIds} onChanged={reload} />
    </>
  );
}
