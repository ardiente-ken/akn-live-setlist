import type { Folder } from '../../models/folder.model';

interface Props {
  folders: Folder[];
  /** Slug of the selected folder, or null for "All songs". */
  active: string | null;
  onSelect: (slug: string | null) => void;
}

export default function FolderChips({ folders, active, onSelect }: Props) {
  if (folders.length === 0) return null;
  return (
    <div className="perf-chips" aria-label="Folders">
      <button type="button" className="perf-chip" aria-pressed={active === null} onClick={() => onSelect(null)}>
        All songs
      </button>
      {folders.map((f) => (
        <button
          key={f.id}
          type="button"
          className="perf-chip"
          aria-pressed={active === f.slug}
          onClick={() => onSelect(f.slug)}
        >
          {f.name}
        </button>
      ))}
    </div>
  );
}
