interface Props {
  semitones: number;
  keyLabel?: string;
  onUp: () => void;
  onDown: () => void;
  onReset: () => void;
}

export default function TransposeControl({ semitones, keyLabel, onUp, onDown, onReset }: Props) {
  return (
    <div className="perf-transpose" role="group" aria-label="Transpose">
      <button type="button" onClick={onDown} aria-label="Transpose down one semitone">−</button>
      <button
        type="button"
        onClick={onReset}
        disabled={semitones === 0}
        aria-label="Reset transposition"
        className="perf-transpose-value"
      >
        {keyLabel ?? (semitones === 0 ? 'Key' : `+${semitones}`)}
        {keyLabel && semitones !== 0 ? ` (+${semitones})` : ''}
      </button>
      <button type="button" onClick={onUp} aria-label="Transpose up one semitone">+</button>
    </div>
  );
}