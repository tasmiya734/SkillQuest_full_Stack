import { Request, Response } from 'express';
import {
  AcademicYear,
  isValidLearningLevelInput,
  normalizeLearningLevel,
} from '../config/constants.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { StudentRow, supabaseService } from '../supabase.ts';

function formatStudentForClient(row: StudentRow | null) {
  if (!row) return null;
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

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, academicYear, division, college } = req.body || {};

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const validYear: AcademicYear | undefined = isValidLearningLevelInput(academicYear)
      ? normalizeLearningLevel(String(academicYear))
      : undefined;

    const result = await supabaseService.registerUser({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      academicYear: validYear,
      division: typeof division === 'string' ? division.trim() : undefined,
      college: typeof college === 'string' ? college.trim() : undefined,
    });

    return res.status(201).json({
      user: result.user,
      student: formatStudentForClient(result.student),
      session: {
        accessToken: result.accessToken,
      },
    });
  } catch (err: any) {
    return res.status(400).json({
      error: err?.message || 'Registration failed. Please try again.',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please enter your password.' });
    }

    const result = await supabaseService.loginUser({
      email: email.trim(),
      password,
    });

    return res.status(200).json({
      user: result.user,
      student: formatStudentForClient(result.student),
      session: {
        accessToken: result.accessToken,
      },
    });
  } catch (err: any) {
    return res.status(401).json({
      error: err?.message || 'Invalid email or password.',
    });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { email, fullName } = req.body || {};

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res
        .status(400)
        .json({ error: 'Please enter a valid Google email address.' });
    }

    const result = await supabaseService.loginOrRegisterGoogleUser({
      email: email.trim(),
      fullName: typeof fullName === 'string' ? fullName.trim() : '',
    });

    return res.status(200).json({
      user: result.user,
      student: formatStudentForClient(result.student),
      session: {
        accessToken: result.accessToken,
      },
    });
  } catch (err: any) {
    return res.status(400).json({
      error: err?.message || 'Google authentication failed. Please try again.',
    });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.accessToken) {
      await supabaseService.logoutToken(req.accessToken);
    }
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (_err) {
    return res.status(200).json({ message: 'Logged out.' });
  }
};

export const getCurrentSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const student = await supabaseService.getStudentByAuthUserId(req.authUser.id);
    return res.status(200).json({
      user: req.authUser,
      student: formatStudentForClient(student),
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to load session profile.',
    });
  }
};
