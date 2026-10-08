import { Router } from 'express';
import {
  getCurrentSession,
  googleAuth,
  login,
  logout,
  register,
} from '../controllers/authController.ts';
import { getCategories } from '../controllers/categoryController.ts';
import { getQuestions } from '../controllers/questionController.ts';
import {
  getAuthenticatedStudentProfile,
  upsertAuthenticatedStudentProfile,
} from '../controllers/studentController.ts';
import {
  createAssessment,
  getAssessmentHistory,
  getAssessmentResult,
  submitAssessment,
} from '../controllers/assessmentController.ts';
import {
  getGameAttemptsHistory,
  saveGameAttempt,
} from '../controllers/gameController.ts';
import { requireAuth } from '../middleware/authMiddleware.ts';
import { initializeSupabaseDatabase } from '../supabase.ts';

const router = Router();

// 1. Supabase Authentication routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/google', googleAuth);
router.post('/auth/logout', requireAuth, logout);
router.get('/auth/session', requireAuth, getCurrentSession);

// 2. Student Profile routes (Protected — scoped to authenticated user)
router.get('/students/profile', requireAuth, getAuthenticatedStudentProfile);
router.post('/students', requireAuth, upsertAuthenticatedStudentProfile);

// 3. Categories & Questions routes
router.get('/categories', getCategories);
router.get('/questions', requireAuth, getQuestions);

// 4. Assessments, Results & History routes (Protected — scoped to authenticated user)
router.get('/assessments/history', requireAuth, getAssessmentHistory);
router.post('/assessments', requireAuth, createAssessment);
router.post('/assessments/:assessmentId/submit', requireAuth, submitAssessment);
router.get('/assessments/:assessmentId/result', requireAuth, getAssessmentResult);

// 5. Skill Games routes (Protected — separate from official assessments)
router.get('/games/attempts', requireAuth, getGameAttemptsHistory);
router.post('/games/attempts', requireAuth, saveGameAttempt);

// 6. Database initialization / seed sync route
router.post('/database/sync', async (_req, res) => {
  try {
    const status = await initializeSupabaseDatabase();
    res.json({ status: 'ok', ...status });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Database sync failed.' });
  }
});

export default router;
