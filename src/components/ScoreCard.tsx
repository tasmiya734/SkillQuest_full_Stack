import React from 'react';
import { Award, CheckCircle2, Compass } from 'lucide-react';
import { AssessmentResultData } from '../services/api.ts';
import {
  formatAssessmentDate,
  normalizeLearningLevel,
  PerformanceLevel,
} from '../utils/validation.ts';

interface ScoreCardProps {
  result: AssessmentResultData;
  studentName?: string;
}

const LEVEL_DESCRIPTION: Record<PerformanceLevel, string> = {
  Strong:
    'Strong current familiarity across these technology areas. You have a solid understanding of what these tools do and where they are used—try building hands-on beginner projects to explore them further.',
  Good:
    'Good foundational familiarity with these technologies. You recognize many core concepts and real-world use cases, with clear opportunities to explore unfamiliar areas through guided practice.',
  Developing:
    'Growing familiarity with these technology areas. You are beginning to discover how different languages and domains work—reviewing the concept explanations below is a great way to learn more.',
  'Needs Practice':
    'Early exploration stage. Many of these technology areas may be brand new to you, which is completely normal! Use the explanations and starter guides below to discover what each area is about.',
};

function getPerformanceBadgeClasses(level: PerformanceLevel): string {
  switch (level) {
    case 'Strong':
      return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
    case 'Good':
      return 'border-blue-500/40 bg-blue-500/10 text-blue-300';
    case 'Developing':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
    default:
      return 'border-rose-500/40 bg-rose-500/10 text-rose-300';
  }
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ result, studentName }) => {
  const formattedDate = formatAssessmentDate(result.evaluatedAt);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-[#0B1630] p-6 sm:p-8 shadow-2xl">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-[#06B6D4]">
              <Compass className="w-3.5 h-3.5" />
              Exploration &amp; Discovery Report
            </span>
            <span>•</span>
            <span>{normalizeLearningLevel(result.academicYear)} Learning Level</span>
            {studentName && (
              <>
                <span>•</span>
                <span className="text-slate-300">{studentName}</span>
              </>
            )}
            {formattedDate && (
              <>
                <span>•</span>
                <span>{formattedDate}</span>
              </>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {result.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            {LEVEL_DESCRIPTION[result.performanceLevel]}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#07111F]/80 px-3.5 py-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Questions Answered Correctly:</span>
              <span className="text-sm font-mono font-semibold text-white">
                {result.correctAnswers} / {result.totalQuestions}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#07111F]/80 px-3.5 py-2">
              <Award className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-xs text-slate-400">Familiarity Level:</span>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${getPerformanceBadgeClasses(
                  result.performanceLevel
                )}`}
              >
                {result.performanceLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
          <div className="w-full max-w-xs rounded-2xl border border-slate-800 bg-[#07111F]/90 p-6 text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Overall Familiarity Score
            </span>
            <div className="my-3 flex items-baseline justify-center gap-1">
              <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-white">
                {Math.round(result.overallPercentage)}
              </span>
              <span className="text-2xl font-mono text-[#3B82F6]">%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800/80 my-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4]"
                style={{
                  width: `${Math.min(100, Math.max(0, result.overallPercentage))}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-400">
              Reflects your current familiarity across {result.totalQuestions} exploration questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
