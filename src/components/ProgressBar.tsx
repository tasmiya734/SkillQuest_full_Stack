import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  answeredCount?: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  answeredCount,
  label,
}) => {
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min(100, Math.max(0, Math.round((current / safeTotal) * 100)));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {label && <span className="font-medium text-white">{label}</span>}
          {label && <span aria-hidden="true">·</span>}
          <span className="font-mono tabular-nums">
            Question {current} of {total}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono tabular-nums">
          {typeof answeredCount === 'number' && (
            <>
              <span>
                {answeredCount}/{total} Answered
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="text-[#3B82F6] font-semibold">{percentage}%</span>
        </div>
      </div>

      <div
        className="w-full h-2 bg-[#0F172A] rounded-full overflow-hidden border border-slate-800"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#06B6D4] transition-transform duration-200 origin-left"
          style={{ transform: `scaleX(${percentage / 100})` }}
        />
      </div>
    </div>
  );
};
