import './requests.css';

interface Props {
  count: number;
  onClick: () => void;
}

export default function QueueButton({ count, onClick }: Props) {
  return (
    <button
      type="button"
      className="perf-btn rq-queue-btn"
      onClick={onClick}
      aria-label={`Request queue, ${count} waiting`}
    >
      🎶
      {count > 0 && <span className="rq-badge">{count}</span>}
    </button>
  );
}
