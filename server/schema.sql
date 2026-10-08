-- ============================================================================
-- SKILLQUEST — COMPLETE SUPABASE POSTGRESQL DATABASE SCHEMA
-- ============================================================================
-- Run this script in your Supabase Dashboard -> SQL Editor -> New Query
-- After running this script, the SkillQuest Express backend will automatically
-- seed all 11 categories and all 330 Easy/Moderate/Difficult questions (without
-- duplicating any existing questions).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. STUDENTS TABLE (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  academic_year TEXT NOT NULL CHECK (academic_year IN ('Easy', 'Moderate', 'Difficult', 'FY', 'SY', 'TY')),
  division TEXT NOT NULL,
  college TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_auth_user_id ON public.students(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_students_academic_year ON public.students(academic_year);

-- 2. CATEGORIES TABLE (Programming Languages & Technical Domains)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('programming', 'domain')),
  question_count INTEGER NOT NULL DEFAULT 10,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the 11 Official SkillQuest Categories (Idempotent)
INSERT INTO public.categories (id, name, track, question_count, description)
VALUES
  ('cat_python', 'Python', 'programming', 10, 'Core syntax, data structures, comprehensions, OOP, and Pythonic problem-solving.'),
  ('cat_cpp', 'C/C++', 'programming', 10, 'Pointers, memory management, STL containers, compilation, and systems fundamentals.'),
  ('cat_java', 'Java', 'programming', 10, 'Object-oriented design, JVM internals, Collections framework, exception handling, and concurrency.'),
  ('cat_javascript', 'JavaScript', 'programming', 10, 'Closures, asynchronous event loop, Promises, DOM interaction, and modern ES6+ features.'),
  ('cat_sql', 'SQL', 'programming', 10, 'Relational querying, joins, aggregations, subqueries, indexing, and window functions.'),
  ('cat_data_analytics', 'Data Analytics', 'domain', 10, 'Exploratory data analysis, descriptive statistics, data cleaning, KPIs, and visualization concepts.'),
  ('cat_data_science_ai', 'Data Science & AI', 'domain', 10, 'Supervised and unsupervised learning, model evaluation metrics, feature engineering, and neural networks.'),
  ('cat_web_dev', 'Web Development', 'domain', 10, 'HTTP protocol, REST APIs, frontend rendering architectures, state management, and web performance.'),
  ('cat_cybersecurity', 'Cybersecurity', 'domain', 10, 'CIA triad, cryptography, network security, authentication protocols, and OWASP vulnerabilities.'),
  ('cat_cloud_computing', 'Cloud Computing', 'domain', 10, 'IaaS/PaaS/SaaS models, virtualization, containers, auto-scaling, and distributed cloud storage.'),
  ('cat_dbms', 'Database Management', 'domain', 10, 'ACID transactions, normalization (1NF-BCNF), indexing structures, concurrency control, and recovery.')
ON CONFLICT (name) DO NOTHING;

-- 3. QUESTIONS TABLE (Calibrated by learning level: Easy, Moderate, Difficult)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  track TEXT NOT NULL CHECK (track IN ('programming', 'domain')),
  category TEXT NOT NULL REFERENCES public.categories(name) ON UPDATE CASCADE,
  academic_year TEXT NOT NULL CHECK (academic_year IN ('Easy', 'Moderate', 'Difficult', 'FY', 'SY', 'TY')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_track_year ON public.questions(track, academic_year);
CREATE INDEX IF NOT EXISTS idx_questions_category_year ON public.questions(category, academic_year);

-- 4. ASSESSMENTS TABLE (Historical assessment attempts — never overwrites previous attempts)
CREATE TABLE IF NOT EXISTS public.assessments (
  id TEXT PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('programming', 'domain')),
  title TEXT NOT NULL DEFAULT 'SkillQuest Assessment',
  academic_year TEXT NOT NULL DEFAULT 'Easy' CHECK (academic_year IN ('Easy', 'Moderate', 'Difficult', 'FY', 'SY', 'TY')),
  total_questions INTEGER NOT NULL,
  total_correct INTEGER NOT NULL DEFAULT 0,
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  performance_level TEXT NOT NULL DEFAULT 'Needs Practice',
  completion_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON public.assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_auth_user_id ON public.assessments(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(completion_status);

-- 5. STUDENT_ANSWERS TABLE (Individual question responses per assessment attempt)
CREATE TABLE IF NOT EXISTS public.student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL,
  selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D') OR selected_option IS NULL),
  correct_option TEXT NOT NULL DEFAULT 'A' CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_answers_assessment_id ON public.student_answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_student_id ON public.student_answers(student_id);

-- 6. ASSESSMENT_SCORES TABLE (Category-wise score breakdown per assessment attempt)
CREATE TABLE IF NOT EXISTS public.assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 10,
  score_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  performance_level TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_scores_assessment_id ON public.assessment_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_student_id ON public.assessment_scores(student_id);

-- 7. GAME_ATTEMPTS TABLE (Separate from official assessments — stores Skill Games history)
CREATE TABLE IF NOT EXISTS public.game_attempts (
  id TEXT PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('code_debugger', 'output_predictor', 'tech_match', 'sql_challenge')),
  game_title TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  accuracy INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_attempts_student_id ON public.game_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_game_attempts_auth_user_id ON public.game_attempts(auth_user_id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
