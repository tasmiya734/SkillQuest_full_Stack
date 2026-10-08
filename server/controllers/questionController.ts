import { Response } from 'express';
import {
  AcademicYear,
  AssessmentTrack,
  isValidLearningLevelInput,
  normalizeLearningLevel,
} from '../config/constants.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { supabaseService } from '../supabase.ts';

export const getQuestions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const track = (req.query.track as string) || 'programming';

    if (track !== 'programming' && track !== 'domain') {
      return res.status(400).json({
        error: 'Invalid assessment track. Must be "programming" or "domain".',
      });
    }

    // Determine learning level from query parameter or the authenticated student's profile
    let academicYear: AcademicYear = 'Easy';
    const requestedLevel = req.query.academicYear || req.query.learningLevel;

    if (isValidLearningLevelInput(requestedLevel)) {
      academicYear = normalizeLearningLevel(String(requestedLevel));
    } else if (req.authUser) {
      const student = await supabaseService.getStudentByAuthUserId(req.authUser.id);
      if (student && student.academic_year) {
        academicYear = normalizeLearningLevel(student.academic_year);
      }
    }

    const fullQuestions = await supabaseService.getQuestionsForTrackAndYear(
      track as AssessmentTrack,
      academicYear
    );

    // Never expose correctOption or explanation before submission
    const clientSafeQuestions = fullQuestions.map((q) => ({
      id: q.id,
      track: q.track,
      category: q.category,
      academicYear: normalizeLearningLevel(q.academicYear),
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
    }));

    return res.json({
      track,
      academicYear,
      totalQuestions: clientSafeQuestions.length,
      questions: clientSafeQuestions,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to load assessment questions.',
    });
  }
};
