const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_INDEX: Record<string, number> = {
  C: 0, 'B#': 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4,
  F: 5, 'E#': 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9,
  'A#': 10, Bb: 10, B: 11, Cb: 11,
};

// Strict quality matcher so ordinary words ("Amazing", "Bad") aren't read as chords.
const QUALITY = '(?:maj|min|dim|aug|sus|add|alt|no|m|M|\\d|[#b+\\-°ø()])*';
const CHORD_RE = new RegExp(`^([A-G][#b]?)(${QUALITY})(?:/([A-G][#b]?))?$`);

// Major keys that are conventionally written with flats: F, Bb, Eb, Ab, Db, Gb.
const FLAT_MAJOR_KEYS = new Set([5, 10, 3, 8, 1, 6]);

export const mod12 = (n: number) => ((n % 12) + 12) % 12;

export function isChord(token: string): boolean {
  const m = CHORD_RE.exec(token);
  return !!m && m[1] in NOTE_INDEX && (!m[3] || m[3] in NOTE_INDEX);
}

/** Should the transposed output use flats? Decided from the *target* key if known. */
export function prefersFlats(key: string | undefined | null, semitones: number): boolean | null {
  if (!key) return null;
  const m = /^([A-G][#b]?)(m(?!aj))?/.exec(key.trim());
  if (!m || !(m[1] in NOTE_INDEX)) return null;
  const root = mod12(NOTE_INDEX[m[1]] + semitones);
  const majorRoot = m[2] ? mod12(root + 3) : root; // relative major for minor keys
  return FLAT_MAJOR_KEYS.has(majorRoot);
}

function transposeNote(note: string, semitones: number, flats: boolean): string {
  return (flats ? FLATS : SHARPS)[mod12(NOTE_INDEX[note] + semitones)];
}

export function transposeChord(chord: string, semitones: number, flats?: boolean | null): string {
  const m = CHORD_RE.exec(chord);
  if (!m || !(m[1] in NOTE_INDEX)) return chord;
  const [, root, quality, bass] = m;
  // Fallback when the key is unknown: keep the chord's own accidental style.
  const useFlats = flats ?? (root.includes('b') || !!bass?.includes('b'));
  const out = transposeNote(root, semitones, useFlats) + quality;
  return bass && bass in NOTE_INDEX ? `${out}/${transposeNote(bass, semitones, useFlats)}` : out;
}

/** Re-pad a chord-only line so chords stay roughly above the same syllables. */
function transposeChordLine(line: string, semitones: number, flats: boolean | null): string {
  return line.replace(/(\S+)(\s*)/g, (_, chord: string, gap: string) => {
    const next = transposeChord(chord, semitones, flats);
    if (!gap) return next;
    const width = Math.max(1, gap.length + chord.length - next.length);
    return next + ' '.repeat(width);
  });
}

function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/);
  return tokens[0] !== '' && tokens.every(isChord);
}

/** Lyrics with chords: ChordPro [Am] inline, or chord-only lines above lyrics. */
export function transposeText(
  text: string | null | undefined,
  semitones: number,
  key?: string | null,
): string {
  if (!text) return '';
  if (mod12(semitones) === 0) return text;
  const flats = prefersFlats(key, semitones);
  return text
    .split('\n')
    .map((line) => {
      if (line.includes('[')) {
        // ChordPro inline chords; non-chord brackets like [Chorus] are left alone.
        return line.replace(/\[([^\]]+)\]/g, (whole, inner: string) =>
          isChord(inner) ? `[${transposeChord(inner, semitones, flats)}]` : whole,
        );
      }
      return isChordLine(line) ? transposeChordLine(line, semitones, flats) : line;
    })
    .join('\n');
}

export function transposeKey(key: string, semitones: number): string {
  const m = /^([A-G][#b]?)(.*)$/.exec(key.trim());
  if (!m || !(m[1] in NOTE_INDEX)) return key;
  const flats = prefersFlats(key, semitones) ?? m[1].includes('b');
  return transposeNote(m[1], semitones, flats) + m[2];
}

/** For free-form reference text like "Capo 2 · Am F C G": transpose chord tokens, leave the rest. */
export function transposeInline(
  text: string | null | undefined,
  semitones: number,
  key?: string | null,
): string {
  if (!text) return '';
  if (mod12(semitones) === 0) return text;
  const flats = prefersFlats(key, semitones);
  return text.replace(/\S+/g, (token) =>
    isChord(token) ? transposeChord(token, semitones, flats) : token,
  );
}