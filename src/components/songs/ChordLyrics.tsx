import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { parseChart } from '../../lib/chordChart';
import './ChordLyrics.css';

interface Props {
  /** Lyrics text, with chords inline [Am] or on a line above the lyric. */
  source: string;
  fontSize?: number;
  showChords?: boolean;
}

export default function ChordLyrics({ source, fontSize = 24, showChords = true }: Props) {
  const lines = useMemo(() => parseChart(source), [source]);

  if (!source.trim()) return <p className="cl-empty">No lyrics added yet.</p>;

  return (
    <div className="cl" style={{ '--cl-size': `${fontSize}px` } as CSSProperties}>
      {lines.map((line, i) => {
        switch (line.kind) {
          case 'blank':
            return <div className="cl-blank" key={i} />;
          case 'section':
            return (
              <div className="cl-section" key={i}>
                {line.text}
              </div>
            );
          case 'chords':
            return showChords ? (
              <div className="cl-chords-line" key={i}>
                {line.text}
              </div>
            ) : null;
          case 'text':
            return (
              <div className="cl-text" key={i}>
                {line.text}
              </div>
            );
          case 'inline':
            return (
              <div className="cl-inline" key={i}>
                {line.segments.map((s, j) => (
                  <span className="cl-seg" key={j}>
                    {showChords && <span className="cl-chord">{s.chord ?? ''}</span>}
                    <span className="cl-lyric">{s.text}</span>
                  </span>
                ))}
              </div>
            );
        }
      })}
    </div>
  );
}
