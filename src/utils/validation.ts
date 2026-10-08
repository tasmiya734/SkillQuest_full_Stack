export type LearningLevel = 'Easy' | 'Moderate' | 'Difficult';
export type AcademicYear = LearningLevel;
export type AssessmentTrack = 'programming' | 'domain';
export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type PerformanceLevel = 'Strong' | 'Good' | 'Developing' | 'Needs Practice';

export function normalizeLearningLevel(value?: string | null): LearningLevel {
  const v = (value || '').trim().toUpperCase();
  if (v === 'MODERATE' || v === 'SY') return 'Moderate';
  if (v === 'DIFFICULT' || v === 'TY') return 'Difficult';
  return 'Easy';
}

export const VALIDATION_LIMITS = {
  FULL_NAME_MIN: 2,
  FULL_NAME_MAX: 100,
  EMAIL_MIN: 3,
  EMAIL_MAX: 150,
  DIVISION_MIN: 1,
  DIVISION_MAX: 20,
  COLLEGE_MIN: 2,
  COLLEGE_MAX: 160,
};

export interface StudentProfile {
  id: string;
  authUserId: string;
  fullName: string;
  email: string;
  academicYear: LearningLevel;
  division: string;
  college: string;
  createdAt?: string;
  updatedAt?: string;
}

export function validateStudentProfileInput(input: {
  fullName: string;
  email: string;
  academicYear: string;
  division: string;
  college: string;
}): string | null {
  const name = input.fullName.trim();
  if (
    name.length < VALIDATION_LIMITS.FULL_NAME_MIN ||
    name.length > VALIDATION_LIMITS.FULL_NAME_MAX
  ) {
    return `Full Name must be between ${VALIDATION_LIMITS.FULL_NAME_MIN} and ${VALIDATION_LIMITS.FULL_NAME_MAX} characters.`;
  }

  const email = input.email.trim();
  if (
    email.length < VALIDATION_LIMITS.EMAIL_MIN ||
    email.length > VALIDATION_LIMITS.EMAIL_MAX ||
    !email.includes('@')
  ) {
    return 'Please enter a valid academic or personal email address.';
  }

  const upperLevel = (input.academicYear || '').trim().toUpperCase();
  if (
    upperLevel !== 'EASY' &&
    upperLevel !== 'MODERATE' &&
    upperLevel !== 'DIFFICULT' &&
    upperLevel !== 'FY' &&
    upperLevel !== 'SY' &&
    upperLevel !== 'TY'
  ) {
    return 'Learning Level must be Easy, Moderate, or Difficult.';
  }

  const division = input.division.trim();
  if (
    division.length < VALIDATION_LIMITS.DIVISION_MIN ||
    division.length > VALIDATION_LIMITS.DIVISION_MAX
  ) {
    return `Section / Group must be between ${VALIDATION_LIMITS.DIVISION_MIN} and ${VALIDATION_LIMITS.DIVISION_MAX} characters (e.g., A, B, Self-Learner).`;
  }

  const college = input.college.trim();
  if (
    college.length < VALIDATION_LIMITS.COLLEGE_MIN ||
    college.length > VALIDATION_LIMITS.COLLEGE_MAX
  ) {
    return `Institution / School name must be between ${VALIDATION_LIMITS.COLLEGE_MIN} and ${VALIDATION_LIMITS.COLLEGE_MAX} characters.`;
  }

  return null;
}

export function formatAssessmentDate(isoDate?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
