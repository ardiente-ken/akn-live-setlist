import { useState } from 'react';
import type { FormEvent } from 'react';
import { EMPTY_SONG } from '../../models/song.model';
import type { SongInput } from '../../models/song.model';
import ChordLyrics from './ChordLyrics';

interface Props {
  /** Omit for "add"; pass an existing song's values for "edit". */
  initial?: SongInput;
  submitLabel: string;
  onSubmit: (values: SongInput) => Promise<void>;
  onCancel: () => void;
}

const LYRICS_PLACEHOLDER = `[Verse 1]
[Am]I walk a lonely [G]road
[F]The only one that [C]I have ever known

or paste the classic style:

   Am          G
I walk a lonely road`;

export default function SongForm({ initial = EMPTY_SONG, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<SongInput>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof SongInput>(key: K, value: SongInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!values.title.trim() || !values.artist.trim()) {
      setError('Title and artist are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ ...values, title: values.title.trim(), artist: values.artist.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the song.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="sf" onSubmit={handleSubmit}>
      <div className="sf-grid">
        <div className="sf-fields">
          <div className="sf-row">
            <label className="sf-field">
              <span>Title</span>
              <input
                className="gt-input"
                value={values.title}
                onChange={(e) => set('title', e.target.value)}
                required
              />
            </label>
            <label className="sf-field">
              <span>Artist</span>
              <input
                className="gt-input"
                value={values.artist}
                onChange={(e) => set('artist', e.target.value)}
                required
              />
            </label>
          </div>

          <label className="sf-field">
            <span>Chords / notes (shown above the lyrics)</span>
            <input
              className="gt-input"
              value={values.chords}
              placeholder="e.g. Capo 2 · Am F C G"
              onChange={(e) => set('chords', e.target.value)}
            />
          </label>

          <label className="sf-field">
            <span>Lyrics with chords</span>
            <textarea
              className="gt-input sf-lyrics"
              rows={20}
              value={values.lyrics}
              placeholder={LYRICS_PLACEHOLDER}
              spellCheck={false}
              onChange={(e) => set('lyrics', e.target.value)}
            />
            <small className="sf-hint">
              Put chords in [brackets] right before the syllable, or paste a chord line above each
              lyric line. Headers like [Chorus] or "Verse 1" are detected automatically.
            </small>
          </label>

          <label className="sf-check">
            <input
              type="checkbox"
              checked={values.is_active}
              onChange={(e) => set('is_active', e.target.checked)}
            />
            <span>Active (shown on the public setlist and in Performance Mode)</span>
          </label>
        </div>

        <aside className="sf-preview" aria-label="Preview">
          <div className="sf-preview-head">Preview</div>
          <h3 className="sf-preview-title">{values.title || 'Untitled'}</h3>
          <p className="sf-preview-artist">{values.artist}</p>
          {values.chords.trim() && <p className="sf-preview-chords">{values.chords}</p>}
          <ChordLyrics source={values.lyrics} fontSize={18} />
        </aside>
      </div>

      {error && <p className="admin-error" role="alert">{error}</p>}

      <div className="sf-actions">
        <button type="button" className="gt-btn" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="gt-btn gt-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
