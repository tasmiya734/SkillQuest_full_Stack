import { Response } from 'express';
import {
  isValidLearningLevelInput,
  normalizeLearningLevel,
} from '../config/constants.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { StudentRow, supabaseService } from '../supabase.ts';

function mapStudentRow(row: StudentRow) {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    fullName: row.full_name,
    email: row.email,
    academicYear: normalizeLearningLevel(row.academic_year),
    division: row.division,
    college: row.college,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const getAuthenticatedStudentProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const row = await supabaseService.getStudentByAuthUserId(req.authUser.id);
    if (!row) {
      return res.status(404).json({ error: 'Student profile not completed yet.' });
    }

    return res.status(200).json({ student: mapStudentRow(row) });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to load student profile.',
    });
  }
};

export const upsertAuthenticatedStudentProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { fullName, academicYear, division, college } = req.body || {};

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
    }
    if (!isValidLearningLevelInput(academicYear)) {
      return res
        .status(400)
        .json({ error: 'Learning Level must be Easy, Moderate, or Difficult.' });
    }
    if (!division || typeof division !== 'string' || division.trim().length < 1) {
      return res.status(400).json({ error: 'Section / Group is required.' });
    }
    if (!college || typeof college !== 'string' || college.trim().length < 2) {
      return res.status(400).json({ error: 'Institution / School name is required.' });
    }

    const saved = await supabaseService.upsertStudent({
      authUserId: req.authUser.id,
      fullName: fullName.trim().slice(0, 100),
      email: req.authUser.email,
      academicYear: normalizeLearningLevel(String(academicYear)),
      division: division.trim().slice(0, 20),
      college: college.trim().slice(0, 160),
    });

    return res.status(200).json({ student: mapStudentRow(saved) });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to save student profile.',
    });
  }
};
