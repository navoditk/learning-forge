export function ProgressBadge({
  confirmedCount,
  totalCount,
  label,
}: {
  confirmedCount: number;
  totalCount: number;
  label?: string;
}) {
  const percent = totalCount === 0 ? 0 : Math.round((confirmedCount / totalCount) * 100);
  return (
    <div className="progress-badge">
      <div
        className="progress-badge-track"
        role="progressbar"
        aria-valuenow={confirmedCount}
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-label={label ?? `${confirmedCount} of ${totalCount} skills confirmed`}
      >
        <div className="progress-badge-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="progress-badge-count">
        {confirmedCount}/{totalCount}
      </span>
    </div>
  );
}
