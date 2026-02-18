'use client';

interface ProgressBarProps {
  value: number;       // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'accent';
  showPercent?: boolean;
}

const heightMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
const colorMap = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  accent: 'bg-accent',
};

export function ProgressBar({
  value,
  label,
  size = 'md',
  color = 'primary',
  showPercent = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-text-muted">{label}</span>}
          {showPercent && <span className="text-sm font-medium">{clamped}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-border rounded-full overflow-hidden ${heightMap[size]}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className={`progress-fill ${heightMap[size]} ${colorMap[color]} rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
