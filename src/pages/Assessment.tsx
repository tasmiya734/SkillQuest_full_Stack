import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Flag,
  Send,
} from 'lucide-react';
import { Button } from '../components/Button.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { QuestionCard } from '../components/QuestionCard.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import {
  ClientQuestion,
  fetchQuestionsForAssessment,
  startNewAssessmentSession,
  submitAssessmentToBackend,
} from '../services/api.ts';
import {
  AcademicYear,
  AssessmentTrack,
  normalizeLearningLevel,
  OptionKey,
} from '../utils/validation.ts';

function getTrackTitle(track: AssessmentTrack): string {
  return track === 'programming'
    ? 'Programming Language Assessment'
    : 'Technical Domain Assessment';
}

export const Assessment: React.FC = () => {
  const { track } = useParams<{ track: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const validTrack: AssessmentTrack = track === 'domain' ? 'domain' : 'programming';
  const queryLevel = searchParams.get('level');
  const academicYear: AcademicYear = normalizeLearningLevel(
    queryLevel || profile?.academicYear || 'Easy'
  );

  const [assessmentId, setAssessmentId] = useState<string>('');
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, OptionKey>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAssessment = async () => {
      setLoading(true);
      setError('');
      try {
        const [sessionId, fetchedQuestions] = await Promise.all([
          startNewAssessmentSession({
            assessmentType: validTrack,
            academicYear,
          }),
          fetchQuestionsForAssessment(validTrack, academicYear),
        ]);

        if (isMounted) {
          setAssessmentId(sessionId);
          setQuestions(fetchedQuestions);
          setCurrentIndex(0);
          setAnswers({});
          setConfirmIncomplete(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Unable to load assessment questions.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAssessment();
    return () => {
      isMounted = false;
    };
  }, [validTrack, academicYear]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const categories = Array.from(new Set(questions.map((q) => q.category)));

  const handleSelectOption = (option: OptionKey) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
    setConfirmIncomplete(false);
  };

  const handleSubmitAssessment = async () => {
    if (answeredCount === 0) {
      setError('Please answer at least one question before submitting your exploration assessment.');
      return;
    }

    if (!allAnswered && !confirmIncomplete) {
      setConfirmIncomplete(true);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const targetId =
        assessmentId || `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const evaluatedResult = await submitAssessmentToBackend({
        assessmentId: targetId,
        assessmentType: validTrack,
        academicYear,
        answers,
      });

      navigate(`/results/${evaluatedResult.assessmentId}`, {
        state: { result: evaluatedResult },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit assessment. Please try again.'
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        label={`Loading your ${getTrackTitle(validTrack)} (${academicYear} Level) questions...`}
      />
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <ErrorMessage message={error} />
        <div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Button>
        </div>
      </div>
    );
  }

  const levels: AcademicYear[] = ['Easy', 'Moderate', 'Difficult'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Assessment Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#06B6D4]">
            <Compass className="w-3.5 h-3.5" />
            <span>{getTrackTitle(validTrack)}</span>
            <span>•</span>
            <span>Learning Level: {academicYear}</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
            {validTrack === 'programming'
              ? 'Explore Python, C/C++, Java, JavaScript & SQL'
              : 'Explore Data, AI, Web, Cybersecurity, Cloud & Databases'}
          </h1>
          <p className="text-xs text-slate-400">
            Discover what each technology is used for and check your current familiarity. Every question includes a concept takeaway on your report!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl bg-[#0B1630] border border-slate-800 p-1">
            {levels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSearchParams({ level: lvl })}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  academicYear === lvl
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={() => navigate('/assessment')}>
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Assessment Hub</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {confirmIncomplete && !allAnswered && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-sm text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">You have unanswered questions</p>
              <p className="text-xs text-amber-300/90 mt-0.5">
                You have answered {answeredCount} of {totalQuestions} questions. Unanswered questions will be marked as new concepts to explore. Click &ldquo;Confirm Submit&rdquo; to finish anyway.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmIncomplete(false)}
            >
              Keep Exploring
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={submitting}
              onClick={handleSubmitAssessment}
            >
              Confirm Submit
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Question Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-slate-800/90 bg-[#0B1630] p-5">
            <ProgressBar
              current={currentIndex + 1}
              total={totalQuestions}
              answeredCount={answeredCount}
              label={currentQuestion?.category}
            />
          </div>

          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionIndex={currentIndex}
              totalQuestions={totalQuestions}
              selectedOption={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center gap-3">
              {currentIndex < totalQuestions - 1 ? (
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))
                  }
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  loading={submitting}
                  onClick={handleSubmitAssessment}
                >
                  <span>Submit Exploration Assessment</span>
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-800/90 bg-[#0B1630] p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#3B82F6]" />
                Question Navigator
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {answeredCount}/{totalQuestions} Done
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg font-mono text-xs font-medium transition-all border cursor-pointer ${
                      isCurrent
                        ? 'border-blue-400 bg-[#2563EB] text-white shadow-sm shadow-blue-950'
                        : isAnswered
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                        : 'border-slate-800 bg-[#07111F] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-800/80 pt-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Technologies Covered:</span>
                <span className="font-mono text-slate-200">{categories.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                      currentQuestion?.category === cat
                        ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                        : 'border-slate-800 bg-[#07111F] text-slate-400'
                    }`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              loading={submitting}
              onClick={handleSubmitAssessment}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {allAnswered
                  ? 'Submit Exploration Assessment'
                  : `Submit Now (${answeredCount}/${totalQuestions})`}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
