import './SongFilter.css';

interface Props {
  artists: string[];
  query: string;
  artist: string;
  onQueryChange: (q: string) => void;
  onArtistChange: (a: string) => void;
}

export default function SongFilter({ artists, query, artist, onQueryChange, onArtistChange }: Props) {
  return (
    <>
      <div>
        <label className="sr-only" htmlFor="song-search">Search songs or artists</label>
        <input
          id="song-search"
          className="search"
          type="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="chips" role="group" aria-label="Filter by artist">
        <button
          type="button"
          className={`chip${artist === '' ? ' on' : ''}`}
          aria-pressed={artist === ''}
          onClick={() => onArtistChange('')}
        >
          All
        </button>
        {artists.map((a) => (
          <button
            key={a}
            type="button"
            className={`chip${artist === a ? ' on' : ''}`}
            aria-pressed={artist === a}
            onClick={() => onArtistChange(artist === a ? '' : a)}
          >
            {a}
          </button>
        ))}
      </div>
    </>
  );
}
