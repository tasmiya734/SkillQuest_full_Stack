import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Terminal,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/Button.tsx';
import {
  recordGameAttemptToBackend,
  SkillGameType,
} from '../services/api.ts';
import {
  CODE_DEBUGGER_CHALLENGES,
  OUTPUT_PREDICTOR_CHALLENGES,
  SKILL_GAMES_CATALOG,
  SQL_CHALLENGES,
  TECH_MATCH_BOARDS,
  TechMatchPair,
} from '../utils/gameChallenges.ts';

type GameStage = 'intro' | 'playing' | 'summary';

interface ShuffledChoiceRound {
  id: string;
  badge: string;
  title: string;
  prompt: string;
  codeLines?: string[];
  highlightLineIndex?: number;
  tableName?: string;
  schemaColumns?: { name: string; type: string }[];
  sampleRows?: Record<string, string | number>[];
  options: string[];
  correctIndex: number;
  correctAnswerText: string;
  explanation: string;
}

function shuffleWithCorrectIndex(
  options: string[],
  originalCorrectIdx: number,
  seedOffset: number
): { shuffledOptions: string[]; newCorrectIndex: number; correctText: string } {
  const correctText = options[originalCorrectIdx];
  const indexed = options.map((opt, idx) => ({
    opt,
    isCorrect: idx === originalCorrectIdx,
  }));

  // Deterministic rotation + swap based on seedOffset so options are varied across A, B, C, D
  const rotated = [...indexed];
  const shift = (seedOffset % 3) + 1;
  for (let i = 0; i < shift; i++) {
    const first = rotated.shift();
    if (first) rotated.push(first);
  }

  return {
    shuffledOptions: rotated.map((item) => item.opt),
    newCorrectIndex: rotated.findIndex((item) => item.isCorrect),
    correctText,
  };
}

export const GamePlay: React.FC = () => {
  const { gameType } = useParams<{ gameType: string }>();
  const navigate = useNavigate();

  const resolvedType: SkillGameType =
    gameType === 'output_predictor' ||
    gameType === 'tech_match' ||
    gameType === 'sql_challenge'
      ? gameType
      : 'code_debugger';

  const gameMeta = useMemo(
    () =>
      SKILL_GAMES_CATALOG.find((g) => g.type === resolvedType) ||
      SKILL_GAMES_CATALOG[0],
    [resolvedType]
  );

  const [stage, setStage] = useState<GameStage>('intro');
  const [sessionSeed, setSessionSeed] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [savingAttempt, setSavingAttempt] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // State for Multiple-Choice Round Games (Code Debugger, Output Predictor, SQL Challenge)
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submittedRound, setSubmittedRound] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // State for Tech Match Game
  const [boardIndex, setBoardIndex] = useState<number>(0);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [matchFeedback, setMatchFeedback] = useState<{
    type: 'correct' | 'incorrect';
    message: string;
  } | null>(null);

  // Build rounds for Code Debugger, Output Predictor, or SQL Challenge
  const choiceRounds: ShuffledChoiceRound[] = useMemo(() => {
    if (resolvedType === 'code_debugger') {
      return CODE_DEBUGGER_CHALLENGES.map((c, idx) => {
        const s = shuffleWithCorrectIndex(
          c.options,
          c.correctIndex,
          sessionSeed + idx
        );
        return {
          id: c.id,
          badge: c.language,
          title: c.title,
          prompt: c.problemStatement,
          codeLines: c.codeSnippet,
          highlightLineIndex: c.bugLineIndex,
          options: s.shuffledOptions,
          correctIndex: s.newCorrectIndex,
          correctAnswerText: s.correctText,
          explanation: c.explanation,
        };
      });
    }

    if (resolvedType === 'output_predictor') {
      return OUTPUT_PREDICTOR_CHALLENGES.map((c, idx) => {
        const s = shuffleWithCorrectIndex(
          c.options,
          c.correctIndex,
          sessionSeed + idx + 2
        );
        return {
          id: c.id,
          badge: c.language,
          title: c.title,
          prompt: 'Select what the following program will output when executed:',
          codeLines: c.codeSnippet,
          options: s.shuffledOptions,
          correctIndex: s.newCorrectIndex,
          correctAnswerText: s.correctText,
          explanation: c.explanation,
        };
      });
    }

    if (resolvedType === 'sql_challenge') {
      return SQL_CHALLENGES.map((c, idx) => {
        const s = shuffleWithCorrectIndex(
          c.options,
          c.correctIndex,
          sessionSeed + idx + 1
        );
        return {
          id: c.id,
          badge: 'SQL',
          title: c.title,
          prompt: c.prompt,
          tableName: c.tableName,
          schemaColumns: c.schemaColumns,
          sampleRows: c.sampleRows,
          options: s.shuffledOptions,
          correctIndex: s.newCorrectIndex,
          correctAnswerText: s.correctText,
          explanation: c.explanation,
        };
      });
    }

    return [];
  }, [resolvedType, sessionSeed]);

  // Shuffled descriptions for current Tech Match board
  const currentBoard = TECH_MATCH_BOARDS[boardIndex] || TECH_MATCH_BOARDS[0];
  const shuffledDescriptions: TechMatchPair[] = useMemo(() => {
    const copy = [...currentBoard.pairs];
    const shift = ((sessionSeed + boardIndex) % 3) + 1;
    for (let i = 0; i < shift; i++) {
      const first = copy.shift();
      if (first) copy.push(first);
    }
    return copy;
  }, [currentBoard, boardIndex, sessionSeed]);

  // Timer lifecycle while playing
  useEffect(() => {
    if (stage === 'playing') {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [stage]);

  const startFreshGame = () => {
    setSessionSeed(Date.now());
    setElapsedSeconds(0);
    setRoundIndex(0);
    setSelectedOption(null);
    setSubmittedRound(false);
    setCorrectCount(0);
    setAttemptsCount(0);
    setScore(0);
    setBoardIndex(0);
    setSelectedConceptId(null);
    setMatchedPairIds([]);
    setMatchFeedback(null);
    setStage('playing');
  };

  const finalizeGameAndSave = async (params: {
    finalScore: number;
    totalQ: number;
    correctQ: number;
    attemptsMade: number;
  }) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Add time bonus if accuracy >= 60% and finished under 120 seconds
    const accuracyPct =
      params.attemptsMade > 0
        ? Math.round((params.correctQ / params.attemptsMade) * 100)
        : 0;
    const speedBonus =
      accuracyPct >= 60 && elapsedSeconds < 120
        ? Math.max(5, Math.min(20, Math.round((120 - elapsedSeconds) / 6)))
        : 0;
    const totalScoreWithBonus = params.finalScore + speedBonus;

    setScore(totalScoreWithBonus);
    setStage('summary');
    setSavingAttempt(true);

    try {
      await recordGameAttemptToBackend({
        gameType: resolvedType,
        score: totalScoreWithBonus,
        totalQuestions: params.totalQ,
        correctAnswers: params.correctQ,
        accuracy: accuracyPct,
        timeTakenSeconds: elapsedSeconds,
      });
    } catch {
      // Non-blocking
    } finally {
      setSavingAttempt(false);
    }
  };

  // Handlers for Choice-based games (Code Debugger, Output Predictor, SQL Challenge)
  const currentRound = choiceRounds[roundIndex];

  const handleChoiceSubmit = () => {
    if (selectedOption === null || submittedRound || !currentRound) return;
    const isCorrect = selectedOption === currentRound.correctIndex;
    setSubmittedRound(true);
    setAttemptsCount((prev) => prev + 1);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + 10);
    }
  };

  const handleNextChoiceRound = () => {
    if (roundIndex < choiceRounds.length - 1) {
      setRoundIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSubmittedRound(false);
    } else {
      finalizeGameAndSave({
        finalScore: score,
        totalQ: choiceRounds.length,
        correctQ: correctCount,
        attemptsMade: attemptsCount,
      });
    }
  };

  // Handlers for Tech Match game
  const handleSelectDescription = (descPair: TechMatchPair) => {
    if (!selectedConceptId) {
      setMatchFeedback({
        type: 'incorrect',
        message: 'Select a technical concept on the left first, then click its matching description.',
      });
      return;
    }

    if (matchedPairIds.includes(descPair.id)) return;

    const newAttempts = attemptsCount + 1;
    setAttemptsCount(newAttempts);

    if (selectedConceptId === descPair.id) {
      const nextMatched = [...matchedPairIds, descPair.id];
      const nextCorrect = correctCount + 1;
      const nextScore = score + 10;

      setMatchedPairIds(nextMatched);
      setCorrectCount(nextCorrect);
      setScore(nextScore);
      setSelectedConceptId(null);
      setMatchFeedback({
        type: 'correct',
        message: `Matched: ${descPair.concept} → "${descPair.description}" (+10 pts)`,
      });
    } else {
      const chosenConcept = currentBoard.pairs.find(
        (p) => p.id === selectedConceptId
      );
      setMatchFeedback({
        type: 'incorrect',
        message: `Not quite — "${
          chosenConcept?.concept || 'Selected concept'
        }" does not match that description. Try pairing it with its exact definition.`,
      });
    }
  };

  const handleNextTechMatchBoard = () => {
    if (boardIndex < TECH_MATCH_BOARDS.length - 1) {
      setBoardIndex((prev) => prev + 1);
      setMatchedPairIds([]);
      setSelectedConceptId(null);
      setMatchFeedback(null);
    } else {
      finalizeGameAndSave({
        finalScore: score,
        totalQ: 12,
        correctQ: correctCount,
        attemptsMade: Math.max(12, attemptsCount),
      });
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const getPerformanceSummaryMessage = (acc: number) => {
    if (acc >= 85) {
      return {
        label: 'Sharp Technical Instincts',
        detail:
          'Excellent accuracy! You demonstrated strong command over these technical patterns.',
        color: 'text-emerald-400',
      };
    }
    if (acc >= 65) {
      return {
        label: 'Solid Problem-Solving',
        detail:
          'Good technical reasoning. A quick review of the explanations will help lock in full mastery.',
        color: 'text-[#3B82F6]',
      };
    }
    if (acc >= 40) {
      return {
        label: 'Developing Fluency',
        detail:
          'You caught several key patterns. Replay the challenge to sharpen your speed and accuracy.',
        color: 'text-amber-400',
      };
    }
    return {
      label: 'Keep Practicing',
      detail:
        'Great learning opportunity — review the step-by-step explanations and try another round.',
      color: 'text-rose-400',
    };
  };

  // ==========================================================================
  // STAGE 1: GAME INTRODUCTION SCREEN
  // ==========================================================================
  if (stage === 'intro') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/games')}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Skill Games</span>
        </Button>

        <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 sm:p-10 space-y-8">
          <div className="space-y-3 border-b border-slate-800/80 pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
              <span className="text-[#06B6D4] font-semibold">
                {gameMeta.tagline}
              </span>
              <span aria-hidden="true">·</span>
              <span>Estimated Time: {gameMeta.estimatedTime}</span>
              <span aria-hidden="true">·</span>
              <span>{gameMeta.roundsLabel}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {gameMeta.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {gameMeta.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-[#07111F] border border-slate-800 p-4 space-y-1">
              <p className="text-xs text-slate-400">Scoring System</p>
              <p className="font-mono tabular-nums text-sm font-bold text-white">
                +10 pts / Correct + Speed Bonus
              </p>
            </div>
            <div className="rounded-lg bg-[#07111F] border border-slate-800 p-4 space-y-1">
              <p className="text-xs text-slate-400">Feedback Mode</p>
              <p className="font-mono tabular-nums text-sm font-bold text-[#06B6D4]">
                Immediate Technical Explanation
              </p>
            </div>
            <div className="rounded-lg bg-[#07111F] border border-slate-800 p-4 space-y-1">
              <p className="text-xs text-slate-400">Assessment Impact</p>
              <p className="font-mono tabular-nums text-sm font-bold text-slate-200">
                Practice Only (Separate History)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">
              Included Languages & Domains
            </p>
            <p className="text-sm font-medium text-white">
              {gameMeta.categories.join('  ·  ')}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Ready to begin? Your score, accuracy, and completion time will be tracked automatically.
            </p>
            <Button variant="primary" size="lg" onClick={startFreshGame}>
              <Play className="w-4 h-4" />
              <span>Start Challenge</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // STAGE 3: SCORE & PERFORMANCE SUMMARY SCREEN
  // ==========================================================================
  if (stage === 'summary') {
    const totalQuestionsCount =
      resolvedType === 'tech_match' ? 12 : choiceRounds.length;
    const accuracyValue =
      attemptsCount > 0
        ? Math.min(100, Math.round((correctCount / attemptsCount) * 100))
        : 0;
    const perfMeta = getPerformanceSummaryMessage(accuracyValue);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#06B6D4] tracking-wide">
                Challenge Completed · {gameMeta.title}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {perfMeta.label}
              </h1>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                {perfMeta.detail}
              </p>
            </div>

            <div className="rounded-xl bg-[#07111F] border border-slate-800 px-6 py-4 text-center shrink-0">
              <p className="text-xs text-slate-400">Final Score</p>
              <p className="font-mono tabular-nums text-3xl sm:text-4xl font-bold text-[#3B82F6] mt-1">
                {score} pts
              </p>
              {savingAttempt && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Saving to history...
                </p>
              )}
            </div>
          </div>

          {/* Performance Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg bg-[#07111F] border border-slate-800 p-4 space-y-1">
              <p className="text-xs text-slate-400">Accuracy</p>
              <p
                className={`font-mono tabular-nums text-2xl font-bold ${perfMeta.color}`}
              >
                {accuracyValue}%
              </p>
            </div>

            <div className="rounded-lg bg-[#07111F] border border-slate-800 p-4 space-y-1">
              <p className="text-xs text-slate-400">Correct Answers</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-white">
                {correctCount} / {totalQuestionsCount}
              </p>
            </div>

            <div className="rounded-lg bg-[#07111F] border border-slate-800 p-4 space-y-1">
              <p className="text-xs text-slate-400">Total Attempts</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-slate-200">
                {attemptsCount}
              </p>
            </div>

            <div className="rounded-lg bg-[#07111F] border border-slate-800 p-4 space-y-1">
              <p className="text-xs text-slate-400">Time Taken</p>
              <p className="font-mono tabular-nums text-2xl font-bold text-[#06B6D4]">
                {formatTimer(elapsedSeconds)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <Button variant="outline" onClick={() => navigate('/games')}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Skill Games</span>
            </Button>

            <Button variant="primary" onClick={startFreshGame}>
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // STAGE 2A: TECH MATCH INTERACTIVE PLAYING WORKSPACE
  // ==========================================================================
  if (resolvedType === 'tech_match') {
    const allBoardPairsMatched =
      matchedPairIds.length === currentBoard.pairs.length;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Top Status Bar */}
        <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                <span className="text-[#06B6D4] font-semibold">
                  Board {boardIndex + 1} of {TECH_MATCH_BOARDS.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>Matched: {correctCount}/12</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                {currentBoard.title}
              </h1>
            </div>

            <div className="flex items-center gap-5 font-mono tabular-nums text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-[#06B6D4]" />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#07111F] border border-slate-800 text-white font-bold">
                Score: <span className="text-[#3B82F6]">{score} pts</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/games')}
              >
                Exit
              </Button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300">
            {currentBoard.subtitle} Click a concept on the left, then click its matching technical description on the right.
          </p>
        </div>

        {/* Immediate Match Feedback Banner */}
        {matchFeedback && (
          <div
            className={`rounded-xl border px-5 py-3.5 text-xs sm:text-sm flex items-center gap-3 ${
              matchFeedback.type === 'correct'
                ? 'bg-emerald-950/35 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/35 border-rose-500/40 text-rose-200'
            }`}
          >
            {matchFeedback.type === 'correct' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{matchFeedback.message}</span>
          </div>
        )}

        {/* Two-Column Matching Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Technical Concepts */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              1. Select a Technical Concept
            </h2>
            {currentBoard.pairs.map((pair) => {
              const isMatched = matchedPairIds.includes(pair.id);
              const isSelected = selectedConceptId === pair.id;

              return (
                <button
                  key={pair.id}
                  type="button"
                  disabled={isMatched}
                  onClick={() => {
                    setSelectedConceptId(pair.id);
                    setMatchFeedback(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isMatched
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 opacity-75 cursor-default'
                      : isSelected
                      ? 'bg-[#2563EB]/20 border-[#3B82F6] text-white ring-2 ring-[#3B82F6]/30'
                      : 'bg-[#0B1630] border-slate-800/90 text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-mono text-[#06B6D4]">
                      {pair.category}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                      {pair.concept}
                    </p>
                  </div>
                  {isMatched && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Shuffled Technical Descriptions */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              2. Match with Correct Description
            </h2>
            {shuffledDescriptions.map((descPair) => {
              const isMatched = matchedPairIds.includes(descPair.id);

              return (
                <button
                  key={descPair.id}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleSelectDescription(descPair)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[76px] ${
                    isMatched
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 opacity-75 cursor-default'
                      : 'bg-[#0B1630] border-slate-800/90 text-slate-300 hover:border-[#06B6D4] hover:text-white'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {descPair.description}
                  </p>
                  {isMatched && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advance to Next Board / Finish Button */}
        {allBoardPairsMatched && (
          <div className="rounded-xl bg-[#0B1630] border border-emerald-500/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Board {boardIndex + 1} Complete!
                </p>
                <p className="text-xs text-slate-400">
                  All 4 technical concepts on this board have been matched accurately.
                </p>
              </div>
            </div>
            <Button variant="primary" onClick={handleNextTechMatchBoard}>
              <span>
                {boardIndex < TECH_MATCH_BOARDS.length - 1
                  ? 'Continue to Next Board'
                  : 'View Final Score'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // STAGE 2B: CODE DEBUGGER, OUTPUT PREDICTOR & SQL CHALLENGE WORKSPACE
  // ==========================================================================
  if (!currentRound) return null;

  const isAnswerCorrect =
    submittedRound && selectedOption === currentRound.correctIndex;
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Top Challenge Header */}
      <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-400">
              <span className="text-[#06B6D4] font-semibold">
                {currentRound.badge}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Round {roundIndex + 1} of {choiceRounds.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Accuracy:{' '}
                {attemptsCount > 0
                  ? `${Math.round((correctCount / attemptsCount) * 100)}%`
                  : '—'}
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              {gameMeta.title}: {currentRound.title}
            </h1>
          </div>

          <div className="flex items-center gap-4 font-mono tabular-nums text-xs shrink-0">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-4 h-4 text-[#06B6D4]" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#07111F] border border-slate-800 text-white font-bold">
              Score: <span className="text-[#3B82F6]">{score} pts</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/games')}
            >
              Exit
            </Button>
          </div>
        </div>

        {/* Round Progress Bar */}
        <div className="w-full h-1.5 bg-[#07111F] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] transition-all duration-300"
            style={{
              width: `${Math.round(
                ((roundIndex + 1) / choiceRounds.length) * 100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Challenge Body Card */}
      <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 sm:p-8 space-y-6">
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
          {currentRound.prompt}
        </p>

        {/* Code Viewer for Code Debugger & Output Predictor */}
        {currentRound.codeLines && (
          <div className="rounded-xl bg-[#07111F] border border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-800/90 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>{currentRound.badge} Snippet</span>
              </div>
              {typeof currentRound.highlightLineIndex === 'number' && (
                <span className="text-amber-400">
                  Inspect Line {currentRound.highlightLineIndex + 1}
                </span>
              )}
            </div>
            <pre className="p-4 sm:p-5 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
              {currentRound.codeLines.map((line, idx) => {
                const isBugLine = currentRound.highlightLineIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded flex items-start gap-4 ${
                      isBugLine
                        ? 'bg-amber-500/10 border-l-2 border-amber-400 text-amber-100'
                        : 'text-slate-200'
                    }`}
                  >
                    <span className="text-slate-600 select-none w-5 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre">{line || ' '}</span>
                  </div>
                );
              })}
            </pre>
          </div>
        )}

        {/* Database Table Structure Viewer for SQL Challenge */}
        {currentRound.tableName && currentRound.schemaColumns && (
          <div className="rounded-xl bg-[#07111F] border border-slate-800 overflow-hidden space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <span className="font-mono text-xs font-bold text-[#06B6D4]">
                Table: {currentRound.tableName}
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                {currentRound.schemaColumns.map((col) => (
                  <span key={col.name}>
                    <strong className="text-slate-200">{col.name}</strong> (
                    {col.type})
                  </span>
                ))}
              </div>
            </div>

            {currentRound.sampleRows && currentRound.sampleRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      {Object.keys(currentRound.sampleRows[0]).map((colKey) => (
                        <th key={colKey} className="py-2 pr-4 font-semibold">
                          {colKey}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {currentRound.sampleRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} className="py-2 pr-4">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Options Selection List */}
        <div className="space-y-3">
          {currentRound.options.map((optText, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrectOpt = idx === currentRound.correctIndex;

            let cardClasses =
              'bg-[#07111F] border-slate-800 text-slate-200 hover:border-slate-600';
            if (submittedRound) {
              if (isCorrectOpt) {
                cardClasses =
                  'bg-emerald-950/30 border-emerald-500/60 text-emerald-100';
              } else if (isSelected && !isCorrectOpt) {
                cardClasses = 'bg-rose-950/30 border-rose-500/60 text-rose-100';
              }
            } else if (isSelected) {
              cardClasses =
                'bg-[#2563EB]/20 border-[#3B82F6] text-white ring-2 ring-[#3B82F6]/30';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={submittedRound}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  submittedRound ? 'cursor-default' : 'cursor-pointer'
                } ${cardClasses}`}
              >
                <span className="w-7 h-7 rounded-md bg-[#0B1630] border border-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {optionLabels[idx]}
                </span>
                <span className="font-mono text-xs sm:text-sm leading-relaxed break-words">
                  {optText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback & Explanation Panel */}
        {submittedRound && (
          <div
            className={`rounded-xl border p-5 space-y-2 ${
              isAnswerCorrect
                ? 'bg-emerald-950/25 border-emerald-500/40'
                : 'bg-rose-950/25 border-rose-500/40'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              {isAnswerCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-emerald-300">
                    Correct! (+10 points)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-rose-300">
                    Incorrect · Correct Answer: Option{' '}
                    {optionLabels[currentRound.correctIndex]}
                  </span>
                </>
              )}
            </div>
            {resolvedType === 'output_predictor' && (
              <p className="text-xs font-mono text-slate-200">
                Expected Output:{' '}
                <strong className="text-[#06B6D4]">
                  {currentRound.correctAnswerText}
                </strong>
              </p>
            )}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentRound.explanation}
            </p>
          </div>
        )}

        {/* Submit / Next Round Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
          {!submittedRound ? (
            <Button
              variant="primary"
              disabled={selectedOption === null}
              onClick={handleChoiceSubmit}
            >
              <span>Submit Answer</span>
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNextChoiceRound}>
              <span>
                {roundIndex < choiceRounds.length - 1
                  ? 'Next Round'
                  : 'View Final Score'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
