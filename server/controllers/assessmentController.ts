import { Response } from 'express';
import {
  AcademicYear,
  AssessmentTrack,
  isValidLearningLevelInput,
  normalizeLearningLevel,
  OptionKey,
} from '../config/constants.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import {
  CategoryScoreSummary,
  generateLearningRecommendations,
} from '../services/recommendationService.ts';
import {
  evaluateAssessmentSubmission,
  EvaluatedAssessmentResult,
  EvaluatedQuestionItem,
} from '../services/scoringService.ts';
import { supabaseService } from '../supabase.ts';
import { getQuestionById } from '../utils/questionBank.ts';

export const createAssessment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { assessmentType, academicYear, learningLevel } = req.body || {};
    if (assessmentType !== 'programming' && assessmentType !== 'domain') {
      return res.status(400).json({ error: 'Invalid assessment type.' });
    }

    const student = await supabaseService.getStudentByAuthUserId(req.authUser.id);
    if (!student) {
      return res.status(400).json({
        error: 'Please complete your student profile before starting an assessment.',
      });
    }

    const requestedLevel = learningLevel || academicYear;
    const resolvedLevel: AcademicYear = isValidLearningLevelInput(requestedLevel)
      ? normalizeLearningLevel(String(requestedLevel))
      : normalizeLearningLevel(student.academic_year);

    const row = await supabaseService.createAssessmentAttempt({
      studentId: student.id,
      authUserId: req.authUser.id,
      assessmentType: assessmentType as AssessmentTrack,
      academicYear: resolvedLevel,
    });

    return res.status(201).json({
      assessment: {
        assessmentId: row.id,
        studentId: row.student_id,
        assessmentType: row.assessment_type,
        title: row.title,
        academicYear: normalizeLearningLevel(row.academic_year),
        totalQuestions: row.total_questions,
        status: row.completion_status,
        createdAt: row.created_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to start assessment session.',
    });
  }
};

export const submitAssessment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { assessmentId } = req.params;
    const { assessmentType, answers } = req.body || {};

    if (!assessmentId || !/^[a-zA-Z0-9_\-]+$/.test(assessmentId)) {
      return res.status(400).json({ error: 'Invalid assessment ID.' });
    }
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        error: 'Answers payload is required for evaluation.',
      });
    }

    const student = await supabaseService.getStudentByAuthUserId(req.authUser.id);
    if (!student) {
      return res.status(400).json({ error: 'Student profile not found.' });
    }

    const existingAssessment = await supabaseService.getAssessmentById(assessmentId);

    // Enforce ownership: never allow a student to submit to another student's assessment
    if (
      existingAssessment &&
      existingAssessment.auth_user_id !== req.authUser.id &&
      existingAssessment.student_id !== student.id
    ) {
      return res.status(403).json({
        error: 'Access denied: This assessment belongs to another student.',
      });
    }

    // Prevent duplicate submission if already completed
    if (existingAssessment && existingAssessment.completion_status === 'completed') {
      const reconstructed = await buildResultFromStoredDetails(
        assessmentId,
        req.authUser.id,
        student.id
      );
      if (reconstructed) {
        return res.status(200).json({ result: reconstructed, alreadySubmitted: true });
      }
    }

    const resolvedTrack: AssessmentTrack =
      existingAssessment?.assessment_type ||
      (assessmentType === 'domain' ? 'domain' : 'programming');
    const resolvedYear: AcademicYear =
      existingAssessment?.academic_year || student.academic_year;

    const evaluated = evaluateAssessmentSubmission({
      assessmentId,
      studentId: student.id,
      assessmentType: resolvedTrack,
      academicYear: resolvedYear,
      answers: answers as Record<string, OptionKey>,
    });

    await supabaseService.completeAssessmentAttempt({
      assessmentId,
      studentId: student.id,
      authUserId: req.authUser.id,
      assessmentType: resolvedTrack,
      academicYear: resolvedYear,
      totalQuestions: evaluated.totalQuestions,
      totalCorrect: evaluated.correctAnswers,
      overallScore: evaluated.overallPercentage,
      performanceLevel: evaluated.performanceLevel,
      answers: (evaluated.questionReview || []).map((item) => ({
        assessment_id: assessmentId,
        student_id: student.id,
        question_id: item.questionId,
        category: item.category,
        selected_option: item.selectedOption,
        correct_option: item.correctOption,
        is_correct: item.isCorrect,
      })),
      categoryScores: evaluated.categoryScores.map((cs) => ({
        assessment_id: assessmentId,
        student_id: student.id,
        category: cs.category,
        correct_answers: cs.correct,
        total_questions: cs.total,
        score_percentage: cs.percentage,
        performance_level: cs.performanceLevel,
      })),
    });

    return res.status(200).json({ result: evaluated });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to evaluate assessment submission.',
    });
  }
};

async function buildResultFromStoredDetails(
  assessmentId: string,
  authUserId: string,
  studentId: string
): Promise<EvaluatedAssessmentResult | null> {
  const details = await supabaseService.getAssessmentDetails(assessmentId);
  if (!details) return null;

  const { assessment, answers, categoryScores } = details;

  // Enforce strict student ownership
  if (
    assessment.auth_user_id !== authUserId &&
    assessment.student_id !== studentId
  ) {
    return null;
  }

  const mappedCategories: CategoryScoreSummary[] = categoryScores.map((sc) => ({
    category: sc.category,
    correct: sc.correct_answers,
    total: sc.total_questions,
    percentage: sc.score_percentage,
    performanceLevel: sc.performance_level,
  }));

  const recommendations = generateLearningRecommendations(
    mappedCategories,
    assessment.academic_year
  );

  const questionReview: EvaluatedQuestionItem[] = answers.map((ans) => {
    const q = getQuestionById(ans.question_id);
    return {
      questionId: ans.question_id,
      category: ans.category,
      questionText: q?.questionText || `Question (${ans.category})`,
      selectedOption: ans.selected_option,
      correctOption: ans.correct_option || q?.correctOption || 'A',
      isCorrect: ans.is_correct,
      explanation:
        q?.explanation ||
        'Review the core concepts for this topic to strengthen your understanding.',
    };
  });

  return {
    assessmentId: assessment.id,
    studentId: assessment.student_id,
    assessmentType: assessment.assessment_type,
    title: assessment.title,
    academicYear: assessment.academic_year,
    totalQuestions: assessment.total_questions,
    correctAnswers: assessment.total_correct,
    overallPercentage: assessment.overall_score,
    performanceLevel: assessment.performance_level,
    categoryScores: mappedCategories,
    recommendations,
    questionReview,
    evaluatedAt: assessment.completed_at || assessment.created_at,
  };
}

export const getAssessmentResult = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { assessmentId } = req.params;
    const student = await supabaseService.getStudentByAuthUserId(req.authUser.id);
    const studentId = student?.id || req.authUser.id;

    const result = await buildResultFromStoredDetails(
      assessmentId,
      req.authUser.id,
      studentId
    );

    if (!result) {
      return res.status(404).json({
        error: 'Assessment result not found or you do not have permission to view it.',
      });
    }

    return res.status(200).json({ result });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to fetch assessment result.',
    });
  }
};

export const getAssessmentHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const student = await supabaseService.getStudentByAuthUserId(req.authUser.id);
    const studentId = student?.id || req.authUser.id;

    const rawHistory = await supabaseService.getStudentAssessmentHistory({
      studentId,
      authUserId: req.authUser.id,
    });

    const history: EvaluatedAssessmentResult[] = rawHistory.map(
      ({ assessment, categoryScores }) => {
        const mappedCategories: CategoryScoreSummary[] = categoryScores.map((sc) => ({
          category: sc.category,
          correct: sc.correct_answers,
          total: sc.total_questions,
          percentage: sc.score_percentage,
          performanceLevel: sc.performance_level,
        }));

        const recommendations = generateLearningRecommendations(
          mappedCategories,
          assessment.academic_year
        );

        return {
          assessmentId: assessment.id,
          studentId: assessment.student_id,
          assessmentType: assessment.assessment_type,
          title: assessment.title,
          academicYear: assessment.academic_year,
          totalQuestions: assessment.total_questions,
          correctAnswers: assessment.total_correct,
          overallPercentage: assessment.overall_score,
          performanceLevel: assessment.performance_level,
          categoryScores: mappedCategories,
          recommendations,
          evaluatedAt: assessment.completed_at || assessment.created_at,
        };
      }
    );

    return res.status(200).json({ history });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Failed to load assessment history.',
    });
  }
};
