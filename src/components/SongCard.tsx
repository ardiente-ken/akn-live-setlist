import type { Song } from "../models/song.model";
import "./SongCard.css";

interface Props {
  song: Song;
  /** Reserved for the future request feature. */
  requestable?: boolean;
  onRequest?: (song: Song) => void;
}

export default function SongCard({
  song,
  requestable = false,
  onRequest,
}: Props) {
  return (
    <article className="song-card">
      <span className="song-title">{song.title}</span>
      <span className="song-artist">{song.artist}</span>

      {/* FUTURE: song requests */}
      {requestable && (
        <button
          type="button"
          className="card-request"
          aria-label={`Request ${song.title}`}
          onClick={() => onRequest?.(song)}
        >
          Request
        </button>
      )}
    </article>
  );
}