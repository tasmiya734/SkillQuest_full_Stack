import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button.tsx';

interface AssessmentCardProps {
  title: string;
  description: string;
  questionCount: number;
  categories: string[];
  academicYear: string;
  imageSrc: string;
  imageAlt: string;
  accentColor?: 'blue' | 'purple';
  lastScore?: number | null;
  onStart: () => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  title,
  description,
  questionCount,
  categories,
  academicYear,
  imageSrc,
  imageAlt,
  accentColor = 'blue',
  lastScore,
  onStart,
}) => {
  const [imgError, setImgError] = useState(false);

  const borderHover =
    accentColor === 'purple'
      ? 'hover:border-[#8B5CF6]/60'
      : 'hover:border-[#3B82F6]/60';

  return (
    <article
      className={`group rounded-xl bg-[#0B1630] border border-slate-800/90 ${borderHover} transition-all duration-200 overflow-hidden flex flex-col justify-between`}
    >
      <div>
        {/* Visual header with mandatory fallback and scrim */}
        <div className="relative h-48 w-full overflow-hidden bg-[#0F172A]">
          {!imgError ? (
            <img
              src={imageSrc}
              alt={imageAlt}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0B1630] via-[#0F172A] to-[#1E293B] flex items-center justify-center p-6">
              <span className="font-display text-lg font-semibold text-slate-300">
                {title}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1630] via-[#0B1630]/45 to-transparent" />

          {/* Unboxed metadata row at bottom of scrim (Zero-Pill Discipline) */}
          <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-xs text-slate-300 font-mono tabular-nums">
            <div className="flex items-center gap-2">
              <span>{questionCount} Questions</span>
              <span aria-hidden="true">·</span>
              <span>{categories.length} Categories</span>
              <span aria-hidden="true">·</span>
              <span>{academicYear} Level</span>
            </div>
            {typeof lastScore === 'number' && (
              <span className="text-[#06B6D4] font-semibold">
                Latest: {lastScore}%
              </span>
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <p className="text-xs font-medium text-slate-400">
              Included Categories (10 questions each)
            </p>
            <p className="text-xs text-slate-200 leading-relaxed">
              {categories.join('  ·  ')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <Button
          type="button"
          variant="primary"
          fullWidth
          onClick={onStart}
          className="justify-between"
        >
          <span>Start Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </article>
  );
};
