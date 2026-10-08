import {
  AcademicYear,
  AssessmentTrack,
  CATEGORIES,
  getPerformanceLevel,
  normalizeLearningLevel,
  OptionKey,
  PerformanceLevel,
  toLegacyDbCode,
} from '../config/constants.ts';
import { getQuestionsByTrackAndYear } from '../utils/questionBank.ts';
import {
  CategoryScoreSummary,
  generateLearningRecommendations,
  LearningRecommendation,
} from './recommendationService.ts';

export interface EvaluatedQuestionItem {
  questionId: string;
  category: string;
  questionText: string;
  selectedOption: OptionKey | null;
  correctOption: OptionKey;
  isCorrect: boolean;
  explanation: string;
}

export interface EvaluatedAssessmentResult {
  assessmentId: string;
  studentId: string;
  assessmentType: AssessmentTrack;
  title: string;
  academicYear: AcademicYear;
  totalQuestions: number;
  correctAnswers: number;
  overallPercentage: number;
  performanceLevel: PerformanceLevel;
  categoryScores: CategoryScoreSummary[];
  recommendations: LearningRecommendation[];
  questionReview?: EvaluatedQuestionItem[];
  evaluatedAt: string;
}

export function evaluateAssessmentSubmission(params: {
  assessmentId: string;
  studentId: string;
  assessmentType: AssessmentTrack;
  academicYear: AcademicYear | string;
  answers: Record<string, OptionKey>;
}): EvaluatedAssessmentResult {
  const { assessmentId, studentId, assessmentType, answers } = params;
  const academicYear = normalizeLearningLevel(params.academicYear);

  const trackQuestions = getQuestionsByTrackAndYear(assessmentType, academicYear);
  const trackCategories = CATEGORIES.filter((c) => c.track === assessmentType);

  let totalCorrect = 0;
  const categoryTallies = new Map<string, { correct: number; total: number }>();

  for (const cat of trackCategories) {
    categoryTallies.set(cat.name, { correct: 0, total: 0 });
  }

  const legacyCode = toLegacyDbCode(academicYear).toLowerCase();
  const levelSlug = academicYear.toLowerCase();

  const questionReview: EvaluatedQuestionItem[] = trackQuestions.map((q) => {
    const legacyId = q.id.replace(`_${levelSlug}_`, `_${legacyCode}_`);
    const rawSelected = answers[q.id] ?? answers[legacyId];
    const selectedOption: OptionKey | null =
      rawSelected === 'A' || rawSelected === 'B' || rawSelected === 'C' || rawSelected === 'D'
        ? rawSelected
        : null;

    const isCorrect = selectedOption === q.correctOption;
    if (isCorrect) {
      totalCorrect += 1;
    }

    const catTally = categoryTallies.get(q.category) || { correct: 0, total: 0 };
    catTally.total += 1;
    if (isCorrect) {
      catTally.correct += 1;
    }
    categoryTallies.set(q.category, catTally);

    return {
      questionId: q.id,
      category: q.category,
      questionText: q.questionText,
      selectedOption,
      correctOption: q.correctOption,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const totalQuestions = trackQuestions.length;
  const overallPercentage =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const performanceLevel = getPerformanceLevel(overallPercentage);

  const categoryScores: CategoryScoreSummary[] = trackCategories.map((cat) => {
    const tally = categoryTallies.get(cat.name) || { correct: 0, total: 10 };
    const pct = tally.total > 0 ? Math.round((tally.correct / tally.total) * 100) : 0;
    return {
      category: cat.name,
      correct: tally.correct,
      total: tally.total,
      percentage: pct,
      performanceLevel: getPerformanceLevel(pct),
    };
  });

  const recommendations = generateLearningRecommendations(categoryScores, academicYear);

  const title =
    assessmentType === 'programming'
      ? 'Programming Language Assessment'
      : 'Technical Domain Assessment';

  return {
    assessmentId,
    studentId,
    assessmentType,
    title,
    academicYear,
    totalQuestions,
    correctAnswers: totalCorrect,
    overallPercentage,
    performanceLevel,
    categoryScores,
    recommendations,
    questionReview,
    evaluatedAt: new Date().toISOString(),
  };
}
