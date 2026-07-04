interface Props {
  value: number;
  className?: string;
  label?: string;
}
export function ProgressBar({ value, className, label }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-[width] duration-500"
          style={{ width: `${v}%` }}
          role="progressbar"
          aria-valuenow={v}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
    </div>
  );
}
