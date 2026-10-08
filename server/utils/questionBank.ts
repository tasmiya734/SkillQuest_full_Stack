import {
  AcademicYear,
  AssessmentTrack,
  LearningLevel,
  normalizeLearningLevel,
  toLegacyDbCode,
} from '../config/constants.ts';
import { PYTHON_AND_CPP_QUESTIONS, QuestionRecord } from './programmingQuestions.ts';
import { JAVA_JS_SQL_QUESTIONS } from './programmingQuestionsPart2.ts';
import { DOMAIN_QUESTIONS_PART1 } from './domainQuestionsPart1.ts';
import { DOMAIN_QUESTIONS_PART2 } from './domainQuestionsPart2.ts';

export type { QuestionRecord };

export interface ClientSafeQuestion {
  id: string;
  track: AssessmentTrack;
  category: string;
  academicYear: LearningLevel;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export const ALL_QUESTIONS: QuestionRecord[] = [
  ...PYTHON_AND_CPP_QUESTIONS,
  ...JAVA_JS_SQL_QUESTIONS,
  ...DOMAIN_QUESTIONS_PART1,
  ...DOMAIN_QUESTIONS_PART2,
];

const QUESTION_MAP = new Map<string, QuestionRecord>();
for (const q of ALL_QUESTIONS) {
  QUESTION_MAP.set(q.id, q);
  const legacyCode = toLegacyDbCode(q.academicYear).toLowerCase();
  const levelSlug = q.academicYear.toLowerCase();
  if (q.id.includes(`_${levelSlug}_`)) {
    const legacyId = q.id.replace(`_${levelSlug}_`, `_${legacyCode}_`);
    QUESTION_MAP.set(legacyId, q);
  }
}

export function getQuestionsByTrackAndYear(
  track: AssessmentTrack,
  academicYear: AcademicYear | string
): QuestionRecord[] {
  const normalizedLevel = normalizeLearningLevel(academicYear);
  return ALL_QUESTIONS.filter(
    (q) => q.track === track && q.academicYear === normalizedLevel
  );
}

export function getClientSafeQuestions(
  track: AssessmentTrack,
  academicYear: AcademicYear | string
): ClientSafeQuestion[] {
  return getQuestionsByTrackAndYear(track, academicYear).map((q) => ({
    id: q.id,
    track: q.track,
    category: q.category,
    academicYear: q.academicYear,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
  }));
}

export function getQuestionById(id: string): QuestionRecord | undefined {
  return QUESTION_MAP.get(id);
}
