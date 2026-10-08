import React from 'react';
import { CategoryScoreSummary } from '../services/api.ts';

interface CategoryScoreProps {
  item: CategoryScoreSummary;
}

export const CategoryScore: React.FC<CategoryScoreProps> = ({ item }) => {
  const getBarColor = (pct: number) => {
    if (pct >= 80) return 'from-emerald-500 to-teal-400';
    if (pct >= 60) return 'from-[#2563EB] to-[#06B6D4]';
    if (pct >= 40) return 'from-amber-500 to-yellow-400';
    return 'from-rose-500 to-orange-400';
  };

  const getLevelTextClass = (pct: number) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 60) return 'text-[#3B82F6]';
    if (pct >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="py-4 first:pt-0 last:pb-0 border-b border-slate-800/80 last:border-b-0 space-y-2.5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-sm sm:text-base font-semibold text-white">
            {item.category}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className={getLevelTextClass(item.percentage)}>
              {item.performanceLevel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {item.correct} of {item.total} correct
            </span>
          </div>
        </div>

        <span className="font-mono tabular-nums text-lg font-bold text-white">
          {item.percentage}%
        </span>
      </div>

      <div className="w-full h-2 bg-[#07111F] rounded-full overflow-hidden border border-slate-800/80">
        <div
          className={`h-full bg-gradient-to-r ${getBarColor(
            item.percentage
          )} transition-transform duration-300 origin-left`}
          style={{ transform: `scaleX(${Math.min(100, Math.max(0, item.percentage)) / 100})` }}
        />
      </div>
    </div>
  );
};
