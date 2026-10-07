import { useCallback, useEffect, useMemo, useState } from "react";
import type { Song } from "../models/song.model";
import { getSongs } from "../services/songService";
import SongCard from "./SongCard";
import SongFilter from "./SongFilter";
import "./Setlist.css";

/** Flip to true when the request feature is built. */
const requestsEnabled = false;

/** Strip accents and lowercase so "Beyonce" matches "Beyoncé". */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

type Status = "loading" | "ready" | "error";

export default function Setlist() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setSongs(await getSongs());
      setStatus("ready");
    } catch (err) {
      console.error("Could not load songs:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Artists ordered by song count, then A-Z. */
  const artists = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of songs)
      counts.set(s.artist, (counts.get(s.artist) ?? 0) + 1);
    return [...counts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);
  }, [songs]);

  const filtered = useMemo(() => {
    const q = norm(query);
    return songs.filter(
      (s) =>
        (!artist || s.artist === artist) &&
        (!q || norm(s.title).includes(q) || norm(s.artist).includes(q)),
    );
  }, [songs, query, artist]);

  const reset = () => {
    setQuery("");
    setArtist("");
  };

  return (
    <section id="setlist" className="section" aria-labelledby="setlist-title">
      <div className="wrap">
        <h2 id="setlist-title">Tonight's setlist</h2>
        <p className="lede">
          Search by song or artist, or tap a name to see just their songs.
        </p>
        <p className="setlist-note">
          Feel like hearing something from the list? Just come up to me and let
          me know :&gt;
        </p>
        <div className="filters">
          <SongFilter
            artists={artists}
            query={query}
            artist={artist}
            onQueryChange={setQuery}
            onArtistChange={setArtist}
          />
        </div>

        {status === "ready" && (
          <>
            <p className="count" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "song" : "songs"}
            </p>
            {filtered.length > 0 ? (
              <div className="song-list">
                <div className="song-list-header">
                  <span>TITLE</span>
                  <span>ARTIST</span>
                </div>

                <ul>
                  {filtered.map((s) => (
                    <li key={s.id}>
                      <SongCard song={s} requestable={requestsEnabled} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="empty">
                <p>No songs found.</p>
                <button type="button" onClick={reset}>
                  Clear search
                </button>
              </div>
            )}
          </>
        )}

        {status === "loading" && <p className="msg">Loading the setlist…</p>}

        {status === "error" && (
          <div className="empty">
            <p>Couldn't load the setlist.</p>
            <button type="button" onClick={load}>
              Try again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
