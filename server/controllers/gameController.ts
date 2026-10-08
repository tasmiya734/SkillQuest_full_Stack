import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import {
  GameAttemptRow,
  SkillGameType,
  supabaseService,
} from '../supabase.ts';

const VALID_GAME_TYPES: SkillGameType[] = [
  'code_debugger',
  'output_predictor',
  'tech_match',
  'sql_challenge',
];

const GAME_TITLES: Record<SkillGameType, string> = {
  code_debugger: 'Code Debugger',
  output_predictor: 'Output Predictor',
  tech_match: 'Tech Match',
  sql_challenge: 'SQL Challenge',
};

function mapGameAttempt(row: GameAttemptRow) {
  return {
    id: row.id,
    studentId: row.student_id,
    gameType: row.game_type,
    gameTitle: row.game_title,
    score: row.score,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    accuracy: row.accuracy,
    timeTakenSeconds: row.time_taken_seconds,
    completedAt: row.completed_at,
  };
}

export const saveGameAttempt = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const {
      gameType,
      score,
      totalQuestions,
      correctAnswers,
      accuracy,
      timeTakenSeconds,
    } = req.body || {};

    if (!VALID_GAME_TYPES.includes(gameType)) {
      return res.status(400).json({ error: 'Invalid Skill Game type.' });
    }

    const student = await supabaseService.getStudentByAuthUserId(req.authUser.id);
    const studentId = student?.id || req.authUser.id;

    const totalQ = Math.max(1, Number(totalQuestions) || 1);
    const correctQ = Math.min(totalQ, Math.max(0, Number(correctAnswers) || 0));
    const computedAccuracy =
      typeof accuracy === 'number'
        ? Math.min(100, Math.max(0, Math.round(accuracy)))
        : Math.round((correctQ / totalQ) * 100);

    const saved = await supabaseService.recordGameAttempt({
      studentId,
      authUserId: req.authUser.id,
      gameType: gameType as SkillGameType,
      gameTitle: GAME_TITLES[gameType as SkillGameType],
      score: Math.max(0, Number(score) || 0),
      totalQuestions: totalQ,
      correctAnswers: correctQ,
      accuracy: computedAccuracy,
      timeTakenSeconds: Math.max(0, Number(timeTakenSeconds) || 0),
    });

    return res.status(201).json({ attempt: mapGameAttempt(saved) });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to save game attempt.',
    });
  }
};

export const getGameAttemptsHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const student = await supabaseService.getStudentByAuthUserId(req.authUser.id);
    const studentId = student?.id || req.authUser.id;

    const rows = await supabaseService.getStudentGameAttempts({
      studentId,
      authUserId: req.authUser.id,
    });

    return res.status(200).json({
      attempts: rows.map(mapGameAttempt),
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to load game attempts history.',
    });
  }
};
