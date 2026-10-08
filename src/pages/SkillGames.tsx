import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Code2,
  Database,
  Layers,
  Terminal,
  Trophy,
} from 'lucide-react';
import { Button } from '../components/Button.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import {
  fetchGameAttemptsHistory,
  GameAttemptData,
  SkillGameType,
} from '../services/api.ts';
import { SKILL_GAMES_CATALOG, SkillGameMeta } from '../utils/gameChallenges.ts';

export const SkillGames: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [attempts, setAttempts] = useState<GameAttemptData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    if (!user) return;

    setLoading(true);
    fetchGameAttemptsHistory()
      .then((list) => {
        if (active) setAttempts(list);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    const gamesCompleted = attempts.length;
    const bestScore =
      gamesCompleted > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;
    const avgAccuracy =
      gamesCompleted > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.accuracy, 0) / gamesCompleted
          )
        : 0;

    const bestByType: Record<string, number> = {};
    const countByType: Record<string, number> = {};
    for (const a of attempts) {
      countByType[a.gameType] = (countByType[a.gameType] || 0) + 1;
      if (
        bestByType[a.gameType] === undefined ||
        a.score > bestByType[a.gameType]
      ) {
        bestByType[a.gameType] = a.score;
      }
    }

    return {
      gamesCompleted,
      bestScore,
      avgAccuracy,
      bestByType,
      countByType,
    };
  }, [attempts]);

  const getGameIcon = (type: SkillGameType) => {
    switch (type) {
      case 'code_debugger':
        return <Code2 className="w-5 h-5 text-[#3B82F6]" />;
      case 'output_predictor':
        return <Terminal className="w-5 h-5 text-[#8B5CF6]" />;
      case 'tech_match':
        return <Layers className="w-5 h-5 text-[#06B6D4]" />;
      case 'sql_challenge':
        return <Database className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getBorderHover = (accent: SkillGameMeta['accentColor']) => {
    switch (accent) {
      case 'purple':
        return 'hover:border-[#8B5CF6]/60';
      case 'cyan':
        return 'hover:border-[#06B6D4]/60';
      case 'emerald':
        return 'hover:border-emerald-500/60';
      default:
        return 'hover:border-[#3B82F6]/60';
    }
  };

  const formatDuration = (sec: number) => {
    if (!sec || sec <= 0) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        label="Loading Skill Games & practice records..."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
      {/* 1. Page Header & Practice Stats */}
      <section className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-[#06B6D4] font-semibold">
              Skill Games · Interactive CS Practice
            </span>
            <span aria-hidden="true">·</span>
            <span>Separate from Official Assessment Scores</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Learn Through Play.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Challenge your technical thinking with quick interactive games.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 shrink-0">
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">Games Completed</p>
            <p className="font-mono tabular-nums text-xl font-bold text-white">
              {stats.gamesCompleted}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">Best Score</p>
            <p className="font-mono tabular-nums text-xl font-bold text-[#3B82F6]">
              {stats.gamesCompleted > 0 ? `${stats.bestScore} pts` : '—'}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">Avg. Accuracy</p>
            <p className="font-mono tabular-nums text-xl font-bold text-[#06B6D4]">
              {stats.gamesCompleted > 0 ? `${stats.avgAccuracy}%` : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Four Interactive Technical Game Cards */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Select a Technical Challenge
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Each game features multi-round technical challenges with immediate explanations and score tracking.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SKILL_GAMES_CATALOG.map((game) => {
            const personalBest = stats.bestByType[game.type];
            const playCount = stats.countByType[game.type] || 0;

            return (
              <article
                key={game.type}
                className={`rounded-xl bg-[#0B1630] border border-slate-800/90 ${getBorderHover(
                  game.accentColor
                )} transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between space-y-6`}
              >
                <div className="space-y-4">
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#07111F] border border-slate-800 flex items-center justify-center shrink-0">
                        {getGameIcon(game.type)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          {game.tagline}
                        </p>
                        <h3 className="font-display text-xl font-bold text-white tracking-tight">
                          {game.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-400 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span>{game.estimatedTime}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {game.description}
                  </p>

                  {/* Skill / Category Scope */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Skills / Categories</span>
                      <span className="font-mono tabular-nums text-slate-300">
                        {game.roundsLabel}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200">
                      {game.categories.join('  ·  ')}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-400 font-mono tabular-nums">
                    {personalBest !== undefined ? (
                      <span>
                        Best:{' '}
                        <strong className="text-[#06B6D4]">
                          {personalBest} pts
                        </strong>{' '}
                        · {playCount} {playCount === 1 ? 'attempt' : 'attempts'}
                      </span>
                    ) : (
                      <span>Not attempted yet</span>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/games/${game.type}`)}
                  >
                    <span>Start Game</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Recent Game Attempts History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              Your Previous Game Attempts
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every completed game session is saved independently from your official SkillQuest assessments.
            </p>
          </div>
          {attempts.length > 0 && (
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {attempts.length} {attempts.length === 1 ? 'session' : 'sessions'}
            </span>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-8 text-center space-y-2">
            <Trophy className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-sm font-medium text-slate-200">
              No game sessions recorded yet.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Choose any of the four technical games above to test your debugging, output tracing, concept matching, or SQL query skills.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 overflow-hidden">
            <div className="divide-y divide-slate-800/80">
              {attempts.slice(0, 12).map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0F172A]/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-[#07111F] border border-slate-800 flex items-center justify-center shrink-0">
                      {getGameIcon(item.gameType)}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-white">
                        {item.gameTitle}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                        <span>
                          {item.correctAnswers}/{item.totalQuestions} Correct
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.accuracy}% Accuracy</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatDuration(item.timeTakenSeconds)}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {new Date(item.completedAt).toLocaleDateString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-right">
                      <p className="font-mono tabular-nums text-lg font-bold text-[#06B6D4]">
                        {item.score} pts
                      </p>
                      <p className="text-[11px] text-slate-400">Practice Score</p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/games/${item.gameType}`)}
                    >
                      Play Again
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
