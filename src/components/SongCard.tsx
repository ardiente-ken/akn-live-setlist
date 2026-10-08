import type { Song } from "../models/song.model";
import RequestSongButton from "./requests/RequestSongButton";
import "./SongCard.css";

interface Props {
  song: Song;
  /** Show the Request button on this card. */
  requestable?: boolean;
}

export default function SongCard({ song, requestable = false }: Props) {
  return (
    <article className="song-card">
      <span className="song-title">{song.title}</span>
      <span className="song-artist">{song.artist}</span>

      {requestable && (
        <RequestSongButton song={song} className="card-request" />
      )}
    </article>
  );
}