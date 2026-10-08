import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../../components/requests/requests.css';
import SongSearch from '../../components/songs/SongSearch';
import { useSongs } from '../../hooks/useSongs';
import { filterSongs } from '../../lib/filterSongs';
import { createRequest } from '../../services/requestService';
import '../../styles/gig-theme.css';

interface Draft {
  song_id: string | null;
  title: string;
  artist: string;
}

const NAME_KEY = 'akn.request.name';
const LAST_KEY = 'akn.request.last';
const COOLDOWN_MS = 30_000;

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

/** Public page: the audience picks a song (or types one) and sends a request. */
export default function RequestPage() {
  const { songs, loading, error } = useSongs({ activeOnly: true });
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [name, setName] = useState(() => read(NAME_KEY) ?? '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Draft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => filterSongs(songs, query), [songs, query]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const wait = COOLDOWN_MS - (Date.now() - Number(read(LAST_KEY) ?? 0));
    if (wait > 0) {
      setFormError(`Please wait ${Math.ceil(wait / 1000)}s before sending another request.`);
      return;
    }
    setSending(true);
    setFormError(null);
    try {
      await createRequest({ ...draft, requester_name: name });
      write(LAST_KEY, String(Date.now()));
      write(NAME_KEY, name.trim());
      setSent(draft);
      setDraft(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not send your request.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="gig-theme">
        <div className="rp rp-done">
          <h2>Request sent! 🎶</h2>
          <p>
            <strong>{sent.title}</strong>
            {sent.artist && <> by {sent.artist}</>} is in the queue.
          </p>
          <button className="gt-btn gt-btn-primary" onClick={() => setSent(null)}>
            Request another song
          </button>
          <Link to="/" className="rp-back">← Back to setlist</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gig-theme">
      <div className="rp">
        <header className="rp-head">
          <h1>Request a song</h1>
          <Link to="/" className="rp-back">← Setlist</Link>
        </header>
        <p className="rp-lead">Pick a song from our list, or tell us what you'd like to hear.</p>

        {draft && (
          <form className="rp-card" onSubmit={submit}>
            {draft.song_id ? (
              <div className="rp-pick">
                {draft.title}
                {draft.artist && <small>{draft.artist}</small>}
              </div>
            ) : (
              <>
                <label>
                  Song title
                  <input
                    className="gt-input"
                    value={draft.title}
                    maxLength={120}
                    required
                    autoFocus
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  />
                </label>
                <label>
                  Artist (optional)
                  <input
                    className="gt-input"
                    value={draft.artist}
                    maxLength={120}
                    onChange={(e) => setDraft({ ...draft, artist: e.target.value })}
                  />
                </label>
              </>
            )}
            <label>
              Your name (optional)
              <input
                className="gt-input"
                value={name}
                maxLength={40}
                placeholder="So we can give you a shout-out"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            {formError && <p className="rp-error" role="alert">{formError}</p>}
            <div className="rp-actions">
              <button type="button" className="gt-btn" onClick={() => { setDraft(null); setFormError(null); }}>
                Cancel
              </button>
              <button className="gt-btn gt-btn-primary" disabled={sending || !draft.title.trim()}>
                {sending ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </form>
        )}

        <SongSearch value={query} onChange={setQuery} />
        {loading && songs.length === 0 && <p className="rp-lead">Loading songs…</p>}
        {error && songs.length === 0 && <p className="rp-error">Couldn't load songs: {error}</p>}

        <ul className="rp-list">
          {filtered.map((s) => (
            <li key={s.id}>
              <button
                className="rp-song"
                onClick={() => {
                  setDraft({ song_id: s.id, title: s.title, artist: s.artist });
                  setFormError(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <span className="rp-song-title">{s.title}</span>
                <span className="rp-song-artist">{s.artist}</span>
              </button>
            </li>
          ))}
        </ul>

        <button
          className="gt-btn rp-other"
          onClick={() => {
            setDraft({ song_id: null, title: query.trim(), artist: '' });
            setFormError(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Can't find it? Request another song
        </button>
      </div>
    </div>
  );
}
