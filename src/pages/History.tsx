import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History as HistoryIcon,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../components/Button.tsx';
import { CategoryScore } from '../components/CategoryScore.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import {
  AssessmentResultData,
  fetchStudentAssessmentHistory,
} from '../services/api.ts';
import {
  normalizeLearningLevel,
  PerformanceLevel,
} from '../utils/validation.ts';

type FilterTab = 'all' | 'programming' | 'domain';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [history, setHistory] = useState<AssessmentResultData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    if (!user) return;

    setLoading(true);
    setError('');
    fetchStudentAssessmentHistory()
      .then((items) => {
        if (!active) return;
        setHistory(items);
        if (items.length > 0) {
          setExpandedIds({ [items[0].assessmentId]: true });
        }
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message || 'Unable to load your assessment history.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compute chronological attempt numbers per assessment track
  const attemptNumberMap = useMemo(() => {
    const map: Record<string, number> = {};
    const chronological = [...history].sort(
      (a, b) =>
        new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime()
    );
    let progCount = 0;
    let domainCount = 0;
    for (const item of chronological) {
      if (item.assessmentType === 'programming') {
        progCount += 1;
        map[item.assessmentId] = progCount;
      } else {
        domainCount += 1;
        map[item.assessmentId] = domainCount;
      }
    }
    return map;
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (filterTab === 'all') return history;
    return history.filter((item) => item.assessmentType === filterTab);
  }, [history, filterTab]);

  const stats = useMemo(() => {
    const totalAttempts = history.length;
    const programmingAttempts = history.filter(
      (h) => h.assessmentType === 'programming'
    ).length;
    const domainAttempts = history.filter(
      (h) => h.assessmentType === 'domain'
    ).length;
    const highestScore =
      totalAttempts > 0
        ? Math.max(...history.map((h) => h.overallPercentage))
        : 0;

    return {
      totalAttempts,
      programmingAttempts,
      domainAttempts,
      highestScore,
    };
  }, [history]);

  const getLevelColorClass = (level: PerformanceLevel) => {
    switch (level) {
      case 'Strong':
        return 'text-emerald-400';
      case 'Good':
        return 'text-[#3B82F6]';
      case 'Developing':
        return 'text-amber-400';
      default:
        return 'text-rose-400';
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const datePart = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart} · ${timePart}`;
  };

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        label="Loading your historical assessment records..."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Header & Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-[#06B6D4] font-semibold">
              {normalizeLearningLevel(profile?.academicYear)} Learning Level
            </span>
            <span aria-hidden="true">·</span>
            <span>{profile?.fullName || user?.fullName}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Assessment History
          </h1>
          <p className="text-sm text-slate-400">
            Every completed assessment attempt is preserved as a separate historical record so you can track your skill growth over time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Summary Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-1">
          <p className="text-xs text-slate-400">Total Completed Attempts</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-white">
            {stats.totalAttempts}
          </p>
        </div>

        <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-1">
          <p className="text-xs text-slate-400">Highest Overall Score</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-[#06B6D4]">
            {stats.totalAttempts > 0 ? `${stats.highestScore}%` : '—'}
          </p>
        </div>

        <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-1">
          <p className="text-xs text-slate-400">Programming Assessments</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-[#3B82F6]">
            {stats.programmingAttempts}
          </p>
        </div>

        <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-1">
          <p className="text-xs text-slate-400">Technical Domain Assessments</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-[#8B5CF6]">
            {stats.domainAttempts}
          </p>
        </div>
      </section>

      {/* Filter Tabs & Take New Assessment Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#0B1630] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All Attempts ({stats.totalAttempts})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('programming')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'programming'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#0B1630] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Programming Language ({stats.programmingAttempts})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('domain')}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === 'domain'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#0B1630] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Technical Domain ({stats.domainAttempts})
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/assessment/programming')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Programming Attempt</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/assessment/domain')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Domain Attempt</span>
          </Button>
        </div>
      </div>

      {/* Historical Assessment Records List */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-10 text-center space-y-4">
          <HistoryIcon className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="space-y-1.5">
            <h2 className="font-display text-lg font-bold text-white">
              No Completed Assessments Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              {filterTab === 'all'
                ? 'You have not completed any assessments yet. Take either the Programming Language Assessment or Technical Domain Assessment to record your first attempt.'
                : `You have not completed any ${
                    filterTab === 'programming'
                      ? 'Programming Language'
                      : 'Technical Domain'
                  } assessments yet.`}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/assessment/programming')}
            >
              Start Programming Assessment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/assessment/domain')}
            >
              Start Domain Assessment
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredHistory.map((item) => {
            const isExpanded = Boolean(expandedIds[item.assessmentId]);
            const attemptNum = attemptNumberMap[item.assessmentId] || 1;

            return (
              <article
                key={item.assessmentId}
                className="rounded-xl bg-[#0B1630] border border-slate-800/90 overflow-hidden transition-colors hover:border-slate-700"
              >
                {/* Attempt Summary Row */}
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono tabular-nums text-slate-400">
                      <span className="text-[#06B6D4] font-semibold">
                        Attempt #{attemptNum}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{normalizeLearningLevel(item.academicYear)} Level</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateTime(item.evaluatedAt)}</span>
                      </span>
                    </div>

                    <h2 className="font-display text-xl font-bold text-white tracking-tight">
                      {item.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>
                        Marks:{' '}
                        <strong className="font-mono tabular-nums text-slate-200">
                          {item.correctAnswers} / {item.totalQuestions}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Categories Evaluated:{' '}
                        <strong className="font-mono tabular-nums text-slate-200">
                          {item.categoryScores.length}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 shrink-0">
                    <div className="text-left lg:text-right">
                      <p className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-white">
                        {item.overallPercentage}%
                      </p>
                      <p
                        className={`text-xs font-semibold ${getLevelColorClass(
                          item.performanceLevel
                        )}`}
                      >
                        {item.performanceLevel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.assessmentId)}
                        className="px-3 py-2 rounded-lg bg-[#07111F] border border-slate-800 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>
                          {isExpanded ? 'Hide Categories' : 'Category Scores'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <Link
                        to={`/results/${item.assessmentId}`}
                        state={{ result: item }}
                        className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <span>View Full Result</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Expandable Category-Wise Breakdown for this Historical Attempt */}
                {isExpanded && item.categoryScores.length > 0 && (
                  <div className="border-t border-slate-800/80 bg-[#07111F]/60 px-6 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Category-Wise Breakdown (Attempt #{attemptNum})
                      </h3>
                      <span className="text-xs font-mono tabular-nums text-slate-400">
                        {item.correctAnswers}/{item.totalQuestions} Total Correct
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-slate-800/80">
                      {item.categoryScores.map((cat) => (
                        <CategoryScore key={cat.category} item={cat} />
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
