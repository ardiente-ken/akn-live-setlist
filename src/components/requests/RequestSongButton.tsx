import { useEffect, useState } from "react";
import {
  cooldownRemainingMs,
  getSavedName,
  markRequestSent,
} from "../../lib/requestCooldown";
import type { Song } from "../../models/song.model";
import { createRequest } from "../../services/requestService";
import "./RequestSongButton.css";
import gcashQr from "../../images/gcash.png";

type Phase = "idle" | "confirm" | "sending" | "sent";

interface Props {
  song: Pick<Song, "id" | "title" | "artist">;
  label?: string;
  className?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function RequestSongButton({
  song,
  label = "Request",
  className = "",
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "sent") return;

    const t = window.setTimeout(() => {
      setPhase("idle");
    }, 3000);

    return () => window.clearTimeout(t);
  }, [phase]);

  const handleRequest = async () => {
    const wait = cooldownRemainingMs();

    if (wait > 0) {
      setMessage(`Please wait ${Math.ceil(wait / 1000)}s`);
      return;
    }

    setMessage(null);
    setPhase("sending");

    try {
      await createRequest({
        // Sample/fallback songs have non-UUID ids,
        // so send those as custom requests.
        song_id: UUID.test(song.id) ? song.id : null,
        title: song.title,
        artist: song.artist,
        requester_name: getSavedName(),
      });

      markRequestSent();
      setPhase("sent");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not send request");
      setPhase("confirm");
    }
  };

  const closePopup = () => {
    if (phase === "sending") return;

    setMessage(null);
    setPhase("idle");
  };

  const text =
    phase === "sending" ? "Sending…" : phase === "sent" ? "Requested ✓" : label;

  return (
    <span className="rsb">
      <button
        type="button"
        className={`rsb-btn is-${phase} ${className}`.trim()}
        disabled={phase === "sending" || phase === "sent"}
        aria-label={`${text}: ${song.title}`}
        onClick={() => {
          setMessage(null);
          setPhase("confirm");
        }}
      >
        {text}
      </button>

      {phase === "confirm" && (
        <div className="rsb-overlay" role="dialog" aria-modal="true">
          <div className="rsb-popup">
            <button
              type="button"
              className="rsb-close"
              aria-label="Close"
              onClick={closePopup}
            >
              ×
            </button>
            <h3>Request this song?</h3>

            <p className="rsb-song-title">{song.title}</p>
            <p className="rsb-song-artist">{song.artist}</p>

            <div className="rsb-tip">
              <p>
                Enjoying the music? Consider leaving a little tip to support the
                artist 💛
              </p>

              <img
                src={gcashQr}
                alt="GCash QR code for tips"
                className="rsb-gcash"
              />
            </div>

            {message && (
              <p className="rsb-error" role="status">
                {message}
              </p>
            )}

            <div className="rsb-actions">
              <button type="button" className="rsb-cancel" onClick={closePopup}>
                Cancel
              </button>

              <button
                type="button"
                className="rsb-confirm"
                onClick={() => void handleRequest()}
              >
                Request song
              </button>
            </div>
          </div>
        </div>
      )}

      {message && phase === "idle" && (
        <span className="rsb-msg" role="status">
          {message}
        </span>
      )}
    </span>
  );
}
