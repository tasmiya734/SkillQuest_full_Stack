import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Compass,
  History as HistoryIcon,
  Layers,
  RotateCcw,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/Button.tsx';
import { CategoryScore } from '../components/CategoryScore.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import { ScoreCard } from '../components/ScoreCard.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import {
  AssessmentResultData,
  fetchAssessmentResultById,
} from '../services/api.ts';
import { getGuideByCategory } from '../utils/techExplorerData.ts';
import { AssessmentTrack } from '../utils/validation.ts';

function getTrackSubtitle(track: AssessmentTrack): string {
  return track === 'programming'
    ? '5 Programming Languages (Python, C/C++, Java, JavaScript, SQL)'
    : '6 Technical Domains (Data Analytics, AI, Web, Cybersecurity, Cloud, Databases)';
}

export const Results: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const initialStateResult = (
    location.state as { result?: AssessmentResultData } | null
  )?.result;

  const [assessment, setAssessment] = useState<AssessmentResultData | null>(
    initialStateResult || null
  );
  const [loading, setLoading] = useState(!initialStateResult);
  const [error, setError] = useState('');
  const [showDetailedReview, setShowDetailedReview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (initialStateResult && initialStateResult.assessmentId === assessmentId) {
      setAssessment(initialStateResult);
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      if (!assessmentId) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetchAssessmentResultById(assessmentId);
        if (isMounted) {
          if (res) {
            setAssessment(res);
          } else {
            setError('Assessment report not found.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Unable to load assessment report.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResult();
    return () => {
      isMounted = false;
    };
  }, [assessmentId, initialStateResult]);

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        label="Compiling your technology exploration & skill discovery report..."
      />
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <ErrorMessage message={error || 'Assessment report not found.'} />
        <div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Button>
        </div>
      </div>
    );
  }

  const sortedCategories = [...assessment.categoryScores].sort(
    (a, b) => b.percentage - a.percentage
  );
  const strongestAreas = sortedCategories.slice(0, 2);
  const explorationOpportunities = [...sortedCategories].reverse().slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
            <HistoryIcon className="w-4 h-4" />
            <span>All Attempts</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/assessment/${assessment.assessmentType}`)}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake {assessment.title}</span>
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <ScoreCard
        result={assessment}
        studentName={profile?.fullName || user?.fullName}
      />

      {/* Important Exploration & Discovery Note */}
      <div className="rounded-xl border border-blue-500/25 bg-[#0B1630] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[#06B6D4] shrink-0 mt-0.5">
            <Compass className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">
              How to Read Your Exploration Results
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This report reflects your{' '}
              <span className="text-white font-medium">
                current familiarity and conceptual awareness
              </span>{' '}
              across {getTrackSubtitle(assessment.assessmentType)}. It is{' '}
              <span className="text-[#06B6D4] font-medium">
                not a fixed career prediction
              </span>
              —a higher score shows areas you already recognize well, while a lower score simply highlights exciting new technologies you can explore next!
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/assessment')}
          className="shrink-0"
        >
          Explore Tech Guides
        </Button>
      </div>

      {/* Exploration Snapshot: Stronger Familiarity vs New Areas to Explore */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-emerald-500/25 bg-[#0B1630] p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display text-base font-bold text-white">
              Areas of Stronger Current Familiarity
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            You demonstrated the clearest understanding of what these technologies are used for and how their basic concepts work:
          </p>
          <div className="space-y-3">
            {strongestAreas.map((area) => {
              const guide = getGuideByCategory(area.category);
              return (
                <div
                  key={area.category}
                  className="rounded-xl border border-slate-800/90 bg-[#07111F]/80 p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      {area.category}
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      {Math.round(area.percentage)}% ({area.correct}/{area.total})
                    </span>
                  </div>
                  {guide && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="text-slate-400">Used for:</span> {guide.tagline}. Try building a small starter project here to see if you enjoy working with it hands-on.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-indigo-500/25 bg-[#0B1630] p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="font-display text-base font-bold text-white">
              New Areas to Discover &amp; Explore Next
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Having lower familiarity here simply means you may not have been introduced to these topics yet. Here is what they are about:
          </p>
          <div className="space-y-3">
            {explorationOpportunities.map((area) => {
              const guide = getGuideByCategory(area.category);
              return (
                <div
                  key={area.category}
                  className="rounded-xl border border-slate-800/90 bg-[#07111F]/80 p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">
                      {area.category}
                    </span>
                    <span className="text-xs font-mono text-indigo-400 font-semibold">
                      {Math.round(area.percentage)}% ({area.correct}/{area.total})
                    </span>
                  </div>
                  {guide && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <span className="text-slate-400">What it is:</span>{' '}
                      {guide.whatItIs}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category-wise Breakdown */}
      <section className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#3B82F6]" />
              Category-by-Category Familiarity Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare your current familiarity across all evaluated{' '}
              {getTrackSubtitle(assessment.assessmentType)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 divide-y md:divide-y-0 divide-slate-800/80">
          {assessment.categoryScores.map((cat) => (
            <CategoryScore key={cat.category} item={cat} />
          ))}
        </div>
      </section>

      {/* Technology Exploration & Learning Recommendations */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#06B6D4]" />
            What Each Area Builds &amp; How to Explore Further
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Practical guide to what each technology is used for, what you can build, and beginner-friendly ways to explore it based on your {assessment.academicYear} level
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {assessment.recommendations.map((rec) => {
            const guide = getGuideByCategory(rec.category);
            return (
              <div
                key={rec.category}
                className="rounded-xl border border-slate-800/90 bg-[#0B1630] p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#06B6D4]">
                        {rec.category} • {rec.percentage}% Familiarity
                      </span>
                      <h3 className="font-display text-base font-bold text-white mt-1">
                        Explore {rec.category}
                      </h3>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-md border border-slate-700 bg-[#07111F] text-slate-300 shrink-0">
                      {rec.performanceLevel}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {rec.suggestion}
                  </p>

                  {guide && (
                    <div className="rounded-xl border border-slate-800/80 bg-[#07111F]/80 p-3.5 space-y-2">
                      <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                        What You Can Build With {rec.category}
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {guide.whatYouCanBuild.map((item) => (
                          <li key={item} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      Topics &amp; Mini-Projects to Try
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.focusTopics.map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2.5 py-1 rounded-lg bg-[#07111F] border border-slate-800 text-slate-300"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Question & Explanation Review */}
      {assessment.questionReview && assessment.questionReview.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#0B1630] p-5">
            <div>
              <h2 className="font-display text-base font-bold text-white">
                Learn From Every Question ({assessment.questionReview.length} Questions)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your answers alongside clear explanations to understand what each concept means in practice
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailedReview((prev) => !prev)}
            >
              {showDetailedReview
                ? 'Hide Question Explanations'
                : 'View Question Explanations'}
            </Button>
          </div>

          {showDetailedReview && (
            <div className="space-y-3">
              {assessment.questionReview.map((item, idx) => (
                <div
                  key={item.questionId}
                  className={`rounded-xl border p-5 space-y-3 ${
                    item.isCorrect
                      ? 'border-emerald-500/20 bg-emerald-950/10'
                      : 'border-rose-500/20 bg-rose-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-[#0B1630] border border-slate-800 text-slate-300">
                        Q{idx + 1}
                      </span>
                      <span className="text-[#06B6D4] font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold ${
                        item.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          New Concept to Learn
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-white">
                    {item.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-slate-800 bg-[#07111F]/80 p-2.5">
                      <span className="text-slate-400 block mb-0.5">
                        Your Answer:
                      </span>
                      <span
                        className={`font-mono font-semibold ${
                          item.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        {item.selectedOption
                          ? `Option ${item.selectedOption}`
                          : 'Not Answered'}
                      </span>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-[#07111F]/80 p-2.5">
                      <span className="text-slate-400 block mb-0.5">
                        Correct Answer:
                      </span>
                      <span className="font-mono font-semibold text-emerald-300">
                        Option {item.correctOption}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#07111F]/90 border border-slate-800/80 rounded-lg p-3 leading-relaxed">
                    <span className="font-semibold text-[#06B6D4]">
                      Concept Takeaway:{' '}
                    </span>
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
