export type LearningLevel = 'Easy' | 'Moderate' | 'Difficult';
export type AcademicYear = LearningLevel;
export type AssessmentTrack = 'programming' | 'domain';
export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type PerformanceLevel = 'Strong' | 'Good' | 'Developing' | 'Needs Practice';

export interface CategoryInfo {
  id: string;
  name: string;
  track: AssessmentTrack;
  questionCount: number;
  description: string;
}

export const LEARNING_LEVELS: LearningLevel[] = ['Easy', 'Moderate', 'Difficult'];
export const ACADEMIC_YEARS: LearningLevel[] = LEARNING_LEVELS;

export function normalizeLearningLevel(value?: string | null): LearningLevel {
  const v = (value || '').trim().toUpperCase();
  if (v === 'MODERATE' || v === 'SY') return 'Moderate';
  if (v === 'DIFFICULT' || v === 'TY') return 'Difficult';
  return 'Easy';
}

export function isValidLearningLevelInput(value?: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim().toUpperCase();
  return (
    v === 'EASY' ||
    v === 'MODERATE' ||
    v === 'DIFFICULT' ||
    v === 'FY' ||
    v === 'SY' ||
    v === 'TY'
  );
}

/**
 * Maps LearningLevel to legacy 2-letter code only when needed for older PostgreSQL CHECK constraints
 */
export function toLegacyDbCode(level?: string | null): 'FY' | 'SY' | 'TY' {
  const normalized = normalizeLearningLevel(level);
  if (normalized === 'Moderate') return 'SY';
  if (normalized === 'Difficult') return 'TY';
  return 'FY';
}

export const CATEGORIES: CategoryInfo[] = [
  // Programming Language Assessment (5 categories x 10 = 50 questions)
  {
    id: 'cat_python',
    name: 'Python',
    track: 'programming',
    questionCount: 10,
    description:
      'Beginner-friendly language widely used for automation, data analysis, AI/machine learning, and web backends.',
  },
  {
    id: 'cat_cpp',
    name: 'C/C++',
    track: 'programming',
    questionCount: 10,
    description:
      'High-performance compiled languages used for operating systems, game engines, robotics, and embedded hardware.',
  },
  {
    id: 'cat_java',
    name: 'Java',
    track: 'programming',
    questionCount: 10,
    description:
      'Cross-platform object-oriented language commonly used for Android apps, banking systems, and large enterprise backends.',
  },
  {
    id: 'cat_javascript',
    name: 'JavaScript',
    track: 'programming',
    questionCount: 10,
    description:
      'The core language of interactive websites, modern browser interfaces, and full-stack web applications.',
  },
  {
    id: 'cat_sql',
    name: 'SQL',
    track: 'programming',
    questionCount: 10,
    description:
      'The standard language used to store, search, filter, and organize structured data in relational databases.',
  },

  // Technical Domain Assessment (6 categories x 10 = 60 questions)
  {
    id: 'cat_data_analytics',
    name: 'Data Analytics',
    track: 'domain',
    questionCount: 10,
    description:
      'Examining datasets, creating visual charts, and spotting trends to help organizations make informed decisions.',
  },
  {
    id: 'cat_data_science_ai',
    name: 'Data Science & AI',
    track: 'domain',
    questionCount: 10,
    description:
      'Building intelligent systems that learn patterns from data to make predictions, recommendations, and smart tools.',
  },
  {
    id: 'cat_web_dev',
    name: 'Web Development',
    track: 'domain',
    questionCount: 10,
    description:
      'Creating websites and web applications—including visual frontend pages, backend servers, and APIs.',
  },
  {
    id: 'cat_cybersecurity',
    name: 'Cybersecurity',
    track: 'domain',
    questionCount: 10,
    description:
      'Protecting computers, networks, user accounts, and digital data against unauthorized access and cyber threats.',
  },
  {
    id: 'cat_cloud_computing',
    name: 'Cloud Computing',
    track: 'domain',
    questionCount: 10,
    description:
      'Deploying and scaling apps, storage, and servers over the internet on platforms like AWS, Google Cloud, and Azure.',
  },
  {
    id: 'cat_dbms',
    name: 'Database Management',
    track: 'domain',
    questionCount: 10,
    description:
      'Designing, organizing, and maintaining reliable databases so software applications can store and retrieve data safely.',
  },
];

export function getPerformanceLevel(percentage: number): PerformanceLevel {
  if (percentage >= 80) return 'Strong';
  if (percentage >= 60) return 'Good';
  if (percentage >= 40) return 'Developing';
  return 'Needs Practice';
}
