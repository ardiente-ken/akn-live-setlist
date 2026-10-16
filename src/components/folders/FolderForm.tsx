import { useState } from 'react';
import type { FormEvent } from 'react';
import { slugify } from '../../lib/folderSongs';
import { EMPTY_FOLDER } from '../../models/folder.model';
import type { FolderInput } from '../../models/folder.model';

interface Props {
  initial?: FolderInput;
  submitLabel: string;
  onSubmit: (values: FolderInput) => Promise<void>;
  onCancel: () => void;
}

/** Reusable for creating and editing a folder. */
export default function FolderForm({ initial = EMPTY_FOLDER, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<FolderInput>(initial);
  // The link name follows the folder name until you edit it yourself
  const [slugTouched, setSlugTouched] = useState(initial.slug !== '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setName = (name: string) =>
    setValues((v) => ({ ...v, name, slug: slugTouched ? v.slug : slugify(name) }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = values.name.trim();
    const slug = slugify(values.slug);
    if (!name) return setError('Give the folder a name.');
    if (!slug) return setError('The link name needs at least one letter or number.');
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ ...values, name, slug, description: values.description.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the folder.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="sf" onSubmit={handleSubmit}>
      <div className="sf-fields">
        <label className="sf-field">
          <span>Folder name</span>
          <input className="gt-input" value={values.name} maxLength={80} required
            placeholder="e.g. Christmas Event" onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="sf-field">
          <span>Link name</span>
          <input className="gt-input" value={values.slug} maxLength={60}
            onChange={(e) => { setSlugTouched(true); setValues((v) => ({ ...v, slug: e.target.value })); }} />
          <small className="sf-hint ff-url">
            {window.location.origin}/songbook/{slugify(values.slug) || '…'}
          </small>
        </label>

        <label className="sf-field">
          <span>Description (optional)</span>
          <input className="gt-input" value={values.description} maxLength={300}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} />
        </label>

        <label className="sf-check">
          <input type="checkbox" checked={values.is_public}
            onChange={(e) => setValues((v) => ({ ...v, is_public: e.target.checked }))} />
          <span>Public: anyone with the link can read these songs and chords</span>
        </label>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <div className="sf-actions">
        <button type="button" className="gt-btn" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="gt-btn gt-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
