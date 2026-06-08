/*
 * ProgressBar — Thin progress indicator for the question flow.
 * Fixed at top of viewport during the quiz.
 */

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = ((current) / total) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground tracking-wide">
          Question {Math.min(current + 1, total)} of {total}
        </span>
        <span className="text-sm font-mono text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full h-1 bg-navy-light rounded-full overflow-hidden">
        <div
          className="h-full bg-signal rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
