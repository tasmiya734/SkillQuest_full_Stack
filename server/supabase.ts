import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AcademicYear,
  AssessmentTrack,
  CATEGORIES,
  CategoryInfo,
  LearningLevel,
  normalizeLearningLevel,
  OptionKey,
  PerformanceLevel,
  toLegacyDbCode,
} from './config/constants.ts';
import { ALL_QUESTIONS, QuestionRecord } from './utils/questionBank.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env first, then root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

/**
 * Normalize SUPABASE_URL in case a user pastes "/rest/v1/" or "/auth/v1/" at the end
 */
function normalizeSupabaseUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/auth\/v1\/?$/i, '')
      .replace(/\/+$/, '');
  }
}

export const SUPABASE_BASE_URL = normalizeSupabaseUrl(
  process.env.SUPABASE_URL || ''
);
const SUPABASE_SECRET_KEY = (process.env.SUPABASE_SECRET_KEY || '').trim();

export const isLiveSupabaseConfigured =
  Boolean(SUPABASE_BASE_URL) &&
  Boolean(SUPABASE_SECRET_KEY) &&
  SUPABASE_BASE_URL.startsWith('http') &&
  !SUPABASE_BASE_URL.includes('your-project-id') &&
  !SUPABASE_SECRET_KEY.includes('your-supabase-service-role');

export const supabaseAdmin: SupabaseClient | null = isLiveSupabaseConfigured
  ? createClient(SUPABASE_BASE_URL, SUPABASE_SECRET_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// ============================================================================
// LOGICAL SUPABASE POSTGRESQL ENTITIES
// ============================================================================

export interface AuthUserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: string;
}

export interface StudentRow {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  academic_year: AcademicYear;
  division: string;
  college: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentRow {
  id: string;
  student_id: string;
  auth_user_id: string;
  assessment_type: AssessmentTrack;
  title: string;
  academic_year: AcademicYear;
  total_questions: number;
  total_correct: number;
  overall_score: number;
  performance_level: PerformanceLevel;
  completion_status: 'in_progress' | 'completed';
  created_at: string;
  completed_at: string | null;
}

export interface StudentAnswerRow {
  id: string;
  assessment_id: string;
  student_id: string;
  question_id: string;
  category: string;
  selected_option: OptionKey | null;
  correct_option: OptionKey;
  is_correct: boolean;
  created_at: string;
}

export interface AssessmentScoreRow {
  id: string;
  assessment_id: string;
  student_id: string;
  category: string;
  correct_answers: number;
  total_questions: number;
  score_percentage: number;
  performance_level: PerformanceLevel;
  created_at: string;
}

export type SkillGameType =
  | 'code_debugger'
  | 'output_predictor'
  | 'tech_match'
  | 'sql_challenge';

export interface GameAttemptRow {
  id: string;
  student_id: string;
  auth_user_id: string;
  game_type: SkillGameType;
  game_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  time_taken_seconds: number;
  completed_at: string;
}

interface PersistentDatabaseSchema {
  auth_users: AuthUserRow[];
  auth_sessions: Record<
    string,
    { user_id: string; email: string; created_at: string }
  >;
  students: StudentRow[];
  assessments: AssessmentRow[];
  student_answers: StudentAnswerRow[];
  assessment_scores: AssessmentScoreRow[];
  game_attempts: GameAttemptRow[];
}

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'skillquest_data')
  : path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'supabase_store.json');
const CLOUD_BUCKET_NAME = 'skillquest-db';
const CLOUD_OBJECT_PATH = 'skillquest_tables_snapshot.json';

function createSignedSessionToken(payload: {
  id: string;
  email: string;
  fullName: string;
}): string {
  const secret = SUPABASE_SECRET_KEY || 'skillquest_stateless_hmac_secret_v1';
  const data = Buffer.from(JSON.stringify(payload), 'utf-8').toString(
    'base64url'
  );
  const sig = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  return `sqjwt.${data}.${sig}`;
}

function verifySignedSessionToken(
  token: string
): { id: string; email: string; fullName: string } | null {
  if (!token || !token.startsWith('sqjwt.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [, data, sig] = parts;
  const secret = SUPABASE_SECRET_KEY || 'skillquest_stateless_hmac_secret_v1';
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (parsed && parsed.id && parsed.email) {
      return {
        id: String(parsed.id),
        email: String(parsed.email),
        fullName: String(parsed.fullName || parsed.email.split('@')[0]),
      };
    }
  } catch {
    return null;
  }
  return null;
}

function loadPersistentStore(): PersistentDatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const rawStudents: StudentRow[] = Array.isArray(parsed.students)
        ? parsed.students.map((s: StudentRow) => ({
            ...s,
            academic_year: normalizeLearningLevel(s.academic_year),
          }))
        : [];
      const rawAssessments: AssessmentRow[] = Array.isArray(parsed.assessments)
        ? parsed.assessments.map((a: AssessmentRow) => ({
            ...a,
            academic_year: normalizeLearningLevel(a.academic_year),
          }))
        : [];
      return {
        auth_users: Array.isArray(parsed.auth_users) ? parsed.auth_users : [],
        auth_sessions: parsed.auth_sessions || {},
        students: rawStudents,
        assessments: rawAssessments,
        student_answers: Array.isArray(parsed.student_answers)
          ? parsed.student_answers
          : [],
        assessment_scores: Array.isArray(parsed.assessment_scores)
          ? parsed.assessment_scores
          : [],
        game_attempts: Array.isArray(parsed.game_attempts)
          ? parsed.game_attempts
          : [],
      };
    }
  } catch (err) {
    console.error(
      '[Supabase Store] Failed to read store file, initializing clean state:',
      err
    );
  }
  return {
    auth_users: [],
    auth_sessions: {},
    students: [],
    assessments: [],
    student_answers: [],
    assessment_scores: [],
    game_attempts: [],
  };
}

const dbStore: PersistentDatabaseSchema = loadPersistentStore();

function savePersistentStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const serialized = JSON.stringify(dbStore, null, 2);
    fs.writeFileSync(STORE_FILE, serialized, 'utf-8');

    // Also persist snapshot asynchronously to Supabase Cloud Storage bucket
    if (supabaseAdmin) {
      supabaseAdmin.storage
        .from(CLOUD_BUCKET_NAME)
        .upload(CLOUD_OBJECT_PATH, Buffer.from(serialized, 'utf-8'), {
          contentType: 'application/json',
          upsert: true,
        })
        .catch(() => {});
    }
  } catch (err) {
    console.error('[Supabase Store] Failed to persist state:', err);
  }
}

function hashPassword(password: string): string {
  const salt = 'skillquest_supabase_salt_v1';
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function generateUuid(): string {
  return crypto.randomUUID();
}

let pgTablesReady = false;

/**
 * Initialize Supabase Cloud Storage backup + auto-seed PostgreSQL tables when available
 */
export async function initializeSupabaseDatabase(): Promise<{
  connected: boolean;
  postgresTablesReady: boolean;
  categoriesCount: number;
  questionsCount: number;
}> {
  if (!supabaseAdmin) {
    return {
      connected: false,
      postgresTablesReady: false,
      categoriesCount: CATEGORIES.length,
      questionsCount: ALL_QUESTIONS.length,
    };
  }

  // 1. Ensure cloud storage bucket exists and hydrate any remote records
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === CLOUD_BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(CLOUD_BUCKET_NAME, {
        public: false,
      });
    } else {
      const { data: blob } = await supabaseAdmin.storage
        .from(CLOUD_BUCKET_NAME)
        .download(CLOUD_OBJECT_PATH);
      if (blob) {
        const text = await blob.text();
        const remote = JSON.parse(text) as Partial<PersistentDatabaseSchema>;
        if (
          dbStore.students.length === 0 &&
          Array.isArray(remote.students) &&
          remote.students.length > 0
        ) {
          dbStore.students = remote.students.map((s) => ({
            ...s,
            academic_year: normalizeLearningLevel(s.academic_year),
          }));
        }
        if (
          dbStore.assessments.length === 0 &&
          Array.isArray(remote.assessments) &&
          remote.assessments.length > 0
        ) {
          dbStore.assessments = remote.assessments.map((a) => ({
            ...a,
            academic_year: normalizeLearningLevel(a.academic_year),
          }));
        }
        if (
          dbStore.student_answers.length === 0 &&
          Array.isArray(remote.student_answers) &&
          remote.student_answers.length > 0
        ) {
          dbStore.student_answers = remote.student_answers;
        }
        if (
          dbStore.assessment_scores.length === 0 &&
          Array.isArray(remote.assessment_scores) &&
          remote.assessment_scores.length > 0
        ) {
          dbStore.assessment_scores = remote.assessment_scores;
        }
        if (
          dbStore.game_attempts.length === 0 &&
          Array.isArray(remote.game_attempts) &&
          remote.game_attempts.length > 0
        ) {
          dbStore.game_attempts = remote.game_attempts;
        }
        savePersistentStore();
      }
    }
  } catch {
    // Ignore storage initialization warnings
  }

  // 2. Check if PostgreSQL tables exist in public schema and seed categories + questions
  try {
    const { error: catCheckError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .limit(1);

    if (!catCheckError) {
      pgTablesReady = true;

      // Seed all 11 official categories
      await supabaseAdmin.from('categories').upsert(
        CATEGORIES.map((c) => ({
          id: c.id,
          name: c.name,
          track: c.track,
          question_count: c.questionCount,
          description: c.description,
        })),
        { onConflict: 'name' }
      );

      // Check existing questions in Supabase DB so we never duplicate existing questions
      const { data: existingQuestions } = await supabaseAdmin
        .from('questions')
        .select('id, category, academic_year');

      const existingCountByCatYear = new Map<string, number>();
      const existingIds = new Set<string>();

      for (const row of existingQuestions || []) {
        existingIds.add(String(row.id));
        const normalizedLvl = normalizeLearningLevel(String(row.academic_year || 'Easy'));
        const key = `${row.category}__${normalizedLvl}`;
        existingCountByCatYear.set(
          key,
          (existingCountByCatYear.get(key) || 0) + 1
        );
      }

      const questionsToUpsert = ALL_QUESTIONS.filter((q) => {
        // Always update our canonical q_* exploration questions if they already exist by ID
        if (existingIds.has(q.id)) return true;
        const key = `${q.category}__${q.academicYear}`;
        const currentCount = existingCountByCatYear.get(key) || 0;
        if (currentCount >= 10) {
          return false; // Preserve existing 10 custom questions for that category + learning level
        }
        existingCountByCatYear.set(key, currentCount + 1);
        return true;
      });

      if (questionsToUpsert.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < questionsToUpsert.length; i += batchSize) {
          const chunk = questionsToUpsert.slice(i, i + batchSize).map((q) => ({
            id: q.id,
            track: q.track,
            category: q.category,
            academic_year: q.academicYear,
            question_text: q.questionText,
            option_a: q.optionA,
            option_b: q.optionB,
            option_c: q.optionC,
            option_d: q.optionD,
            correct_option: q.correctOption,
            explanation: q.explanation,
          }));
          await supabaseAdmin
            .from('questions')
            .upsert(chunk, { onConflict: 'id' });
        }
      }

      // Sync any local students & assessments into PostgreSQL tables
      for (const st of dbStore.students) {
        await supabaseAdmin
          .from('students')
          .upsert(
            {
              id: st.id,
              auth_user_id: st.auth_user_id,
              full_name: st.full_name,
              email: st.email,
              academic_year: st.academic_year,
              division: st.division,
              college: st.college,
              created_at: st.created_at,
              updated_at: st.updated_at,
            },
            { onConflict: 'auth_user_id' }
          );
      }
    }
  } catch {
    pgTablesReady = false;
  }

  return {
    connected: true,
    postgresTablesReady: pgTablesReady,
    categoriesCount: CATEGORIES.length,
    questionsCount: ALL_QUESTIONS.length,
  };
}

// ============================================================================
// SUPABASE AUTHENTICATION & DATABASE OPERATIONS
// ============================================================================

export const supabaseService = {
  /**
   * Register a new student in Supabase Auth + create student profile row
   */
  async registerUser(params: {
    fullName: string;
    email: string;
    password: string;
    academicYear?: AcademicYear;
    division?: string;
    college?: string;
  }): Promise<{
    user: { id: string; email: string; fullName: string };
    student: StudentRow | null;
    accessToken: string;
  }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.fullName.trim();

    if (supabaseAdmin) {
      try {
        // 1. Try admin.createUser with email_confirm: true so the student can log in immediately
        const { data: createdData, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: params.password,
            email_confirm: true,
            user_metadata: {
              full_name: cleanName,
              academic_year: normalizeLearningLevel(params.academicYear),
              division: params.division || 'A',
              college: params.college || '',
            },
          });

        let authUser = createdData?.user || null;

        if (createError || !authUser) {
          // If the user already exists in Supabase Auth, check if we can sign in or update their user
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existingAuthUser = listData?.users?.find(
            (u) => (u.email || '').toLowerCase() === cleanEmail
          );
          if (existingAuthUser) {
            await supabaseAdmin.auth.admin
              .updateUserById(existingAuthUser.id, {
                password: params.password,
                email_confirm: true,
                user_metadata: {
                  full_name: cleanName,
                  academic_year: normalizeLearningLevel(params.academicYear),
                  division: params.division || 'A',
                  college: params.college || '',
                },
              })
              .catch(() => {});
            authUser = existingAuthUser;
          } else {
            // Try standard signUp in case an anon/publishable key was used
            const { data: signUpData } = await supabaseAdmin.auth.signUp({
              email: cleanEmail,
              password: params.password,
              options: {
                data: {
                  full_name: cleanName,
                  academic_year: normalizeLearningLevel(params.academicYear),
                  division: params.division || 'A',
                  college: params.college || '',
                },
              },
            });
            authUser = signUpData?.user || null;
          }
        }

        if (authUser) {
          const { data: signInData } =
            await supabaseAdmin.auth.signInWithPassword({
              email: cleanEmail,
              password: params.password,
            });

          const accessToken =
            signInData?.session?.access_token ||
            createSignedSessionToken({
              id: authUser.id,
              email: cleanEmail,
              fullName: cleanName,
            });

          dbStore.auth_sessions[accessToken] = {
            user_id: authUser.id,
            email: cleanEmail,
            created_at: new Date().toISOString(),
          };
          savePersistentStore();

          let studentRow: StudentRow | null = null;
          if (params.academicYear && params.division && params.college) {
            studentRow = await this.upsertStudent({
              authUserId: authUser.id,
              fullName: cleanName,
              email: cleanEmail,
              academicYear: params.academicYear,
              division: params.division,
              college: params.college,
            });
          }

          return {
            user: { id: authUser.id, email: cleanEmail, fullName: cleanName },
            student: studentRow,
            accessToken,
          };
        }
      } catch {
        // Fall through to persistent server store if Supabase Auth admin encounters an environment error
      }
    }

    // Fallback persistent store if Supabase credentials are not configured or rate-limited
    const now = new Date().toISOString();
    let targetUser = dbStore.auth_users.find((u) => u.email === cleanEmail);
    if (targetUser) {
      targetUser.full_name = cleanName;
      targetUser.password_hash = hashPassword(params.password);
    } else {
      targetUser = {
        id: generateUuid(),
        email: cleanEmail,
        password_hash: hashPassword(params.password),
        full_name: cleanName,
        created_at: now,
      };
      dbStore.auth_users.push(targetUser);
    }

    const accessToken = createSignedSessionToken({
      id: targetUser.id,
      email: cleanEmail,
      fullName: cleanName,
    });
    dbStore.auth_sessions[accessToken] = {
      user_id: targetUser.id,
      email: cleanEmail,
      created_at: now,
    };
    savePersistentStore();

    let studentRow: StudentRow | null = null;
    if (params.academicYear && params.division && params.college) {
      studentRow = await this.upsertStudent({
        authUserId: targetUser.id,
        fullName: cleanName,
        email: cleanEmail,
        academicYear: params.academicYear,
        division: params.division,
        college: params.college,
      });
    }

    return {
      user: { id: targetUser.id, email: cleanEmail, fullName: cleanName },
      student: studentRow,
      accessToken,
    };
  },

  /**
   * Sign in or register via Google Account identity (connected to Supabase Auth + students table)
   */
  async loginOrRegisterGoogleUser(params: {
    email: string;
    fullName: string;
  }): Promise<{
    user: { id: string; email: string; fullName: string };
    student: StudentRow | null;
    accessToken: string;
  }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName =
      params.fullName.trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

    if (supabaseAdmin) {
      try {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        let authUser = listData?.users?.find(
          (u) => (u.email || '').toLowerCase() === cleanEmail
        );

        if (!authUser) {
          const { data: createdData } =
            await supabaseAdmin.auth.admin.createUser({
              email: cleanEmail,
              password: `GoogleOAuth_${hashPassword(cleanEmail).slice(0, 16)}!`,
              email_confirm: true,
              user_metadata: {
                full_name: cleanName,
                provider: 'google',
              },
            });
          authUser = createdData?.user || undefined;
        }

        if (authUser) {
          const student = await this.getStudentByAuthUserId(authUser.id);
          const resolvedName =
            student?.full_name ||
            (authUser.user_metadata?.full_name as string) ||
            cleanName;

          const accessToken = createSignedSessionToken({
            id: authUser.id,
            email: cleanEmail,
            fullName: resolvedName,
          });

          dbStore.auth_sessions[accessToken] = {
            user_id: authUser.id,
            email: cleanEmail,
            created_at: new Date().toISOString(),
          };
          savePersistentStore();

          return {
            user: { id: authUser.id, email: cleanEmail, fullName: resolvedName },
            student,
            accessToken,
          };
        }
      } catch {
        // Fall through to persistent server store
      }
    }

    // Fallback persistent store
    let found = dbStore.auth_users.find((u) => u.email === cleanEmail);
    const now = new Date().toISOString();
    if (!found) {
      found = {
        id: generateUuid(),
        email: cleanEmail,
        password_hash: hashPassword(`google_${cleanEmail}`),
        full_name: cleanName,
        created_at: now,
      };
      dbStore.auth_users.push(found);
    }

    const student = await this.getStudentByAuthUserId(found.id);
    const resolvedName = student?.full_name || found.full_name || cleanName;
    const accessToken = createSignedSessionToken({
      id: found.id,
      email: found.email,
      fullName: resolvedName,
    });

    dbStore.auth_sessions[accessToken] = {
      user_id: found.id,
      email: found.email,
      created_at: now,
    };
    savePersistentStore();

    return {
      user: { id: found.id, email: found.email, fullName: resolvedName },
      student,
      accessToken,
    };
  },

  /**
   * Sign in with email and password via Supabase Auth
   */
  async loginUser(params: {
    email: string;
    password: string;
  }): Promise<{
    user: { id: string; email: string; fullName: string };
    student: StudentRow | null;
    accessToken: string;
  }> {
    const cleanEmail = params.email.trim().toLowerCase();

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email: cleanEmail,
        password: params.password,
      });

      if (error || !data.user) {
        throw new Error(error?.message || 'Invalid email or password.');
      }

      let student = await this.getStudentByAuthUserId(data.user.id);

      // Reconstruct student profile from Supabase user_metadata if not yet in local/Postgres table
      const meta = data.user.user_metadata || {};
      if (!student && meta.academic_year && meta.college) {
        student = await this.upsertStudent({
          authUserId: data.user.id,
          fullName: String(meta.full_name || cleanEmail.split('@')[0]),
          email: cleanEmail,
          academicYear: normalizeLearningLevel(String(meta.academic_year)),
          division: String(meta.division || 'A'),
          college: String(meta.college || ''),
        });
      }

      const fullName =
        student?.full_name ||
        (meta.full_name as string) ||
        cleanEmail.split('@')[0];

      const accessToken =
        data.session?.access_token ||
        createSignedSessionToken({
          id: data.user.id,
          email: cleanEmail,
          fullName,
        });
      dbStore.auth_sessions[accessToken] = {
        user_id: data.user.id,
        email: cleanEmail,
        created_at: new Date().toISOString(),
      };
      savePersistentStore();

      return {
        user: { id: data.user.id, email: cleanEmail, fullName },
        student,
        accessToken,
      };
    }

    const found = dbStore.auth_users.find((u) => u.email === cleanEmail);
    if (!found || found.password_hash !== hashPassword(params.password)) {
      throw new Error(
        'Invalid email or password. Please check your credentials.'
      );
    }

    const student = await this.getStudentByAuthUserId(found.id);
    const resolvedName = student?.full_name || found.full_name;
    const accessToken = createSignedSessionToken({
      id: found.id,
      email: found.email,
      fullName: resolvedName,
    });
    dbStore.auth_sessions[accessToken] = {
      user_id: found.id,
      email: found.email,
      created_at: new Date().toISOString(),
    };
    savePersistentStore();

    return {
      user: {
        id: found.id,
        email: found.email,
        fullName: resolvedName,
      },
      student,
      accessToken,
    };
  },

  /**
   * Verify Bearer token and return authenticated user identity
   */
  async verifyAccessToken(
    token: string
  ): Promise<{ id: string; email: string; fullName: string } | null> {
    if (!token) return null;

    // 1. Check stateless signed session token first (works across Vercel serverless cold starts)
    const verifiedStateless = verifySignedSessionToken(token);
    if (verifiedStateless) {
      return verifiedStateless;
    }

    // 2. Check fast in-memory session table
    const sessionRecord = dbStore.auth_sessions[token];
    if (sessionRecord) {
      const authUser = dbStore.auth_users.find(
        (u) => u.id === sessionRecord.user_id
      );
      const student = dbStore.students.find(
        (s) => s.auth_user_id === sessionRecord.user_id
      );
      return {
        id: sessionRecord.user_id,
        email: sessionRecord.email,
        fullName:
          student?.full_name ||
          authUser?.full_name ||
          sessionRecord.email.split('@')[0],
      };
    }

    // 3. Verify directly with Supabase Auth JWT verification
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data.user) {
        const email = data.user.email || '';
        const meta = data.user.user_metadata || {};
        const fullName =
          (meta.full_name as string) || email.split('@')[0];

        const existingStudent = dbStore.students.find(
          (s) => s.auth_user_id === data.user.id
        );
        if (!existingStudent && meta.academic_year && meta.college) {
          await this.upsertStudent({
            authUserId: data.user.id,
            fullName,
            email,
            academicYear: normalizeLearningLevel(String(meta.academic_year)),
            division: String(meta.division || 'A'),
            college: String(meta.college || ''),
          });
        }

        return {
          id: data.user.id,
          email,
          fullName,
        };
      }
    }

    return null;
  },

  /**
   * Revoke session token on logout
   */
  async logoutToken(token: string): Promise<void> {
    if (token && dbStore.auth_sessions[token]) {
      delete dbStore.auth_sessions[token];
      savePersistentStore();
    }
  },

  /**
   * Fetch student profile by authenticated Supabase user ID
   */
  async getStudentByAuthUserId(authUserId: string): Promise<StudentRow | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (!error && data) {
        const row: StudentRow = {
          id: String(data.id),
          auth_user_id: String(data.auth_user_id || authUserId),
          full_name: String(data.full_name || data.name || ''),
          email: String(data.email || ''),
          academic_year: normalizeLearningLevel(data.academic_year),
          division: String(data.division || 'A'),
          college: String(data.college || ''),
          created_at: String(data.created_at || new Date().toISOString()),
          updated_at: String(
            data.updated_at || data.created_at || new Date().toISOString()
          ),
        };
        const idx = dbStore.students.findIndex(
          (s) => s.auth_user_id === authUserId
        );
        if (idx >= 0) {
          dbStore.students[idx] = row;
        } else {
          dbStore.students.push(row);
        }
        return row;
      }
    }

    const local = dbStore.students.find((s) => s.auth_user_id === authUserId);
    if (local) {
      local.academic_year = normalizeLearningLevel(local.academic_year);
      return local;
    }

    // Fallback: inspect Supabase Auth user_metadata
    if (supabaseAdmin) {
      const { data: userRes } =
        await supabaseAdmin.auth.admin.getUserById(authUserId);
      const meta = userRes?.user?.user_metadata;
      if (meta && meta.academic_year && meta.college) {
        return await this.upsertStudent({
          authUserId,
          fullName: String(
            meta.full_name || userRes?.user?.email?.split('@')[0] || 'Student'
          ),
          email: String(userRes?.user?.email || ''),
          academicYear: normalizeLearningLevel(String(meta.academic_year)),
          division: String(meta.division || 'A'),
          college: String(meta.college || ''),
        });
      }
    }

    return null;
  },

  /**
   * Create or update student profile linked to auth_user_id
   */
  async upsertStudent(params: {
    authUserId: string;
    fullName: string;
    email: string;
    academicYear: AcademicYear | string;
    division: string;
    college: string;
  }): Promise<StudentRow> {
    const now = new Date().toISOString();
    const normalizedLevel: LearningLevel = normalizeLearningLevel(params.academicYear);

    if (supabaseAdmin) {
      // Keep Supabase Auth user_metadata in sync
      await supabaseAdmin.auth.admin
        .updateUserById(params.authUserId, {
          user_metadata: {
            full_name: params.fullName.trim(),
            academic_year: normalizedLevel,
            division: params.division.trim(),
            college: params.college.trim(),
          },
        })
        .catch(() => {});

      const { data: existingPg, error: checkErr } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('auth_user_id', params.authUserId)
        .maybeSingle();

      if (!checkErr) {
        if (existingPg) {
          let { data: updatedPg, error: updErr } = await supabaseAdmin
            .from('students')
            .update({
              full_name: params.fullName.trim(),
              academic_year: normalizedLevel,
              division: params.division.trim(),
              college: params.college.trim(),
              updated_at: now,
            })
            .eq('auth_user_id', params.authUserId)
            .select('*')
            .maybeSingle();

          if (updErr) {
            const fallbackUpdate = await supabaseAdmin
              .from('students')
              .update({
                full_name: params.fullName.trim(),
                academic_year: toLegacyDbCode(normalizedLevel),
                division: params.division.trim(),
                college: params.college.trim(),
                updated_at: now,
              })
              .eq('auth_user_id', params.authUserId)
              .select('*')
              .maybeSingle();
            updatedPg = fallbackUpdate.data;
            updErr = fallbackUpdate.error;
          }

          if (!updErr && updatedPg) {
            const row: StudentRow = {
              id: String(updatedPg.id),
              auth_user_id: params.authUserId,
              full_name: updatedPg.full_name,
              email: updatedPg.email || params.email,
              academic_year: normalizedLevel,
              division: updatedPg.division,
              college: updatedPg.college,
              created_at: updatedPg.created_at || now,
              updated_at: now,
            };
            const idx = dbStore.students.findIndex(
              (s) => s.auth_user_id === params.authUserId
            );
            if (idx >= 0) dbStore.students[idx] = row;
            else dbStore.students.push(row);
            savePersistentStore();
            return row;
          }
        } else {
          let { data: insertedPg, error: insErr } = await supabaseAdmin
            .from('students')
            .insert({
              auth_user_id: params.authUserId,
              full_name: params.fullName.trim(),
              email: params.email.trim().toLowerCase(),
              academic_year: normalizedLevel,
              division: params.division.trim(),
              college: params.college.trim(),
            })
            .select('*')
            .maybeSingle();

          if (insErr) {
            const fallbackInsert = await supabaseAdmin
              .from('students')
              .insert({
                auth_user_id: params.authUserId,
                full_name: params.fullName.trim(),
                email: params.email.trim().toLowerCase(),
                academic_year: toLegacyDbCode(normalizedLevel),
                division: params.division.trim(),
                college: params.college.trim(),
              })
              .select('*')
              .maybeSingle();
            insertedPg = fallbackInsert.data;
            insErr = fallbackInsert.error;
          }

          if (!insErr && insertedPg) {
            const row: StudentRow = {
              id: String(insertedPg.id),
              auth_user_id: params.authUserId,
              full_name: insertedPg.full_name,
              email: insertedPg.email,
              academic_year: normalizedLevel,
              division: insertedPg.division,
              college: insertedPg.college,
              created_at: insertedPg.created_at || now,
              updated_at: now,
            };
            const idx = dbStore.students.findIndex(
              (s) => s.auth_user_id === params.authUserId
            );
            if (idx >= 0) dbStore.students[idx] = row;
            else dbStore.students.push(row);
            savePersistentStore();
            return row;
          }
        }
      }
    }

    // Mirror/persist in local + Supabase Cloud Storage store
    const idx = dbStore.students.findIndex(
      (s) => s.auth_user_id === params.authUserId
    );
    if (idx >= 0) {
      dbStore.students[idx] = {
        ...dbStore.students[idx],
        full_name: params.fullName.trim(),
        email: params.email.trim().toLowerCase(),
        academic_year: normalizedLevel,
        division: params.division.trim(),
        college: params.college.trim(),
        updated_at: now,
      };
      savePersistentStore();
      return dbStore.students[idx];
    }

    const created: StudentRow = {
      id: generateUuid(),
      auth_user_id: params.authUserId,
      full_name: params.fullName.trim(),
      email: params.email.trim().toLowerCase(),
      academic_year: normalizedLevel,
      division: params.division.trim(),
      college: params.college.trim(),
      created_at: now,
      updated_at: now,
    };
    dbStore.students.push(created);
    savePersistentStore();
    return created;
  },

  /**
   * Fetch categories from Supabase (with existing fallback categories preserved)
   */
  async getCategories(track?: AssessmentTrack): Promise<CategoryInfo[]> {
    if (track) {
      return CATEGORIES.filter((c) => c.track === track);
    }
    return CATEGORIES;
  },

  /**
   * Fetch questions for a track & learning level, preserving existing Supabase questions
   * without duplicating them.
   */
  async getQuestionsForTrackAndYear(
    track: AssessmentTrack,
    academicYear: AcademicYear | string
  ): Promise<QuestionRecord[]> {
    const normalizedLevel = normalizeLearningLevel(academicYear);
    const legacyCode = toLegacyDbCode(normalizedLevel);
    const baseQuestions = ALL_QUESTIONS.filter(
      (q) => q.track === track && q.academicYear === normalizedLevel
    );

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('questions')
        .select('*')
        .in('academic_year', [normalizedLevel, legacyCode]);

      if (!error && Array.isArray(data) && data.length > 0) {
        const baseById = new Map(baseQuestions.map((q) => [q.id, q]));
        const byCategory = new Map<string, QuestionRecord[]>();
        for (const row of data) {
          const rowId = String(row.id);
          const canonical = baseById.get(rowId);
          if (canonical) {
            const list = byCategory.get(canonical.category) || [];
            if (list.length < 10) {
              list.push(canonical);
              byCategory.set(canonical.category, list);
            }
            continue;
          }

          const catName = String(row.category || '');
          if (!catName) continue;
          const mapped: QuestionRecord = {
            id: rowId,
            track,
            category: catName,
            academicYear: normalizedLevel,
            questionText: String(row.question_text || row.questionText || ''),
            optionA: String(row.option_a || row.optionA || ''),
            optionB: String(row.option_b || row.optionB || ''),
            optionC: String(row.option_c || row.optionC || ''),
            optionD: String(row.option_d || row.optionD || ''),
            correctOption: String(
              row.correct_option || row.correctOption || 'A'
            ).toUpperCase() as OptionKey,
            explanation: String(row.explanation || ''),
          };
          const list = byCategory.get(catName) || [];
          if (list.length < 10) {
            list.push(mapped);
            byCategory.set(catName, list);
          }
        }

        const trackCats = CATEGORIES.filter((c) => c.track === track);
        const merged: QuestionRecord[] = [];
        for (const cat of trackCats) {
          const dbCatQuestions = byCategory.get(cat.name) || [];
          const fallbackCatQuestions = baseQuestions.filter(
            (q) => q.category === cat.name
          );
          if (dbCatQuestions.length >= 10) {
            merged.push(...dbCatQuestions.slice(0, 10));
          } else {
            const needed = 10 - dbCatQuestions.length;
            merged.push(
              ...dbCatQuestions,
              ...fallbackCatQuestions.slice(0, needed)
            );
          }
        }
        return merged;
      }
    }

    return baseQuestions;
  },

  /**
   * Create a NEW assessment attempt record (never overwrites previous attempts)
   */
  async createAssessmentAttempt(params: {
    studentId: string;
    authUserId: string;
    assessmentType: AssessmentTrack;
    academicYear: AcademicYear | string;
  }): Promise<AssessmentRow> {
    const now = new Date().toISOString();
    const normalizedLevel = normalizeLearningLevel(params.academicYear);
    const id = `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const totalQuestions = params.assessmentType === 'programming' ? 50 : 60;
    const title =
      params.assessmentType === 'programming'
        ? 'Programming Language Assessment'
        : 'Technical Domain Assessment';

    const row: AssessmentRow = {
      id,
      student_id: params.studentId,
      auth_user_id: params.authUserId,
      assessment_type: params.assessmentType,
      title,
      academic_year: normalizedLevel,
      total_questions: totalQuestions,
      total_correct: 0,
      overall_score: 0,
      performance_level: 'Needs Practice',
      completion_status: 'in_progress',
      created_at: now,
      completed_at: null,
    };

    if (supabaseAdmin) {
      const { error: insErr } = await supabaseAdmin
        .from('assessments')
        .insert({
          id: row.id,
          student_id: row.student_id,
          auth_user_id: row.auth_user_id,
          assessment_type: row.assessment_type,
          title: row.title,
          academic_year: row.academic_year,
          total_questions: row.total_questions,
          total_correct: 0,
          overall_score: 0,
          performance_level: 'Needs Practice',
          completion_status: 'in_progress',
          created_at: row.created_at,
        })
        .select('*')
        .maybeSingle();

      if (insErr) {
        await supabaseAdmin
          .from('assessments')
          .insert({
            id: row.id,
            student_id: row.student_id,
            auth_user_id: row.auth_user_id,
            assessment_type: row.assessment_type,
            title: row.title,
            academic_year: toLegacyDbCode(row.academic_year),
            total_questions: row.total_questions,
            total_correct: 0,
            overall_score: 0,
            performance_level: 'Needs Practice',
            completion_status: 'in_progress',
            created_at: row.created_at,
          })
          .select('*')
          .maybeSingle();
      }
    }

    dbStore.assessments.push(row);
    savePersistentStore();
    return row;
  },

  /**
   * Get an assessment row by ID
   */
  async getAssessmentById(assessmentId: string): Promise<AssessmentRow | null> {
    const local = dbStore.assessments.find((a) => a.id === assessmentId);
    if (local) {
      local.academic_year = normalizeLearningLevel(local.academic_year);
      return local;
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: String(data.id),
          student_id: String(data.student_id),
          auth_user_id: String(data.auth_user_id || data.student_id),
          assessment_type:
            (data.assessment_type as AssessmentTrack) || 'programming',
          title:
            data.assessment_type === 'domain'
              ? 'Technical Domain Assessment'
              : 'Programming Language Assessment',
          academic_year: normalizeLearningLevel(data.academic_year),
          total_questions: Number(data.total_questions) || 50,
          total_correct: Number(data.total_correct) || 0,
          overall_score: Number(data.overall_score) || 0,
          performance_level:
            (data.performance_level as PerformanceLevel) || 'Needs Practice',
          completion_status:
            data.completion_status === 'completed'
              ? 'completed'
              : 'in_progress',
          created_at: String(data.created_at),
          completed_at: data.completed_at ? String(data.completed_at) : null,
        };
      }
    }

    return null;
  },

  /**
   * Save completed assessment attempt, student_answers, and assessment_scores
   * WITHOUT overwriting any previous assessment attempts!
   */
  async completeAssessmentAttempt(params: {
    assessmentId: string;
    studentId: string;
    authUserId: string;
    assessmentType: AssessmentTrack;
    academicYear: AcademicYear | string;
    totalQuestions: number;
    totalCorrect: number;
    overallScore: number;
    performanceLevel: PerformanceLevel;
    answers: Omit<StudentAnswerRow, 'id' | 'created_at'>[];
    categoryScores: Omit<AssessmentScoreRow, 'id' | 'created_at'>[];
  }): Promise<AssessmentRow> {
    const now = new Date().toISOString();
    const normalizedLevel = normalizeLearningLevel(params.academicYear);
    const title =
      params.assessmentType === 'programming'
        ? 'Programming Language Assessment'
        : 'Technical Domain Assessment';

    const existingIdx = dbStore.assessments.findIndex(
      (a) => a.id === params.assessmentId
    );
    let assessmentRow: AssessmentRow;

    if (existingIdx >= 0) {
      dbStore.assessments[existingIdx] = {
        ...dbStore.assessments[existingIdx],
        academic_year: normalizedLevel,
        total_questions: params.totalQuestions,
        total_correct: params.totalCorrect,
        overall_score: params.overallScore,
        performance_level: params.performanceLevel,
        completion_status: 'completed',
        completed_at: now,
      };
      assessmentRow = dbStore.assessments[existingIdx];
    } else {
      assessmentRow = {
        id: params.assessmentId,
        student_id: params.studentId,
        auth_user_id: params.authUserId,
        assessment_type: params.assessmentType,
        title,
        academic_year: normalizedLevel,
        total_questions: params.totalQuestions,
        total_correct: params.totalCorrect,
        overall_score: params.overallScore,
        performance_level: params.performanceLevel,
        completion_status: 'completed',
        created_at: now,
        completed_at: now,
      };
      dbStore.assessments.push(assessmentRow);
    }

    // Store student_answers for this specific assessmentId
    dbStore.student_answers = dbStore.student_answers.filter(
      (ans) => ans.assessment_id !== params.assessmentId
    );
    for (const ans of params.answers) {
      dbStore.student_answers.push({
        ...ans,
        id: generateUuid(),
        created_at: now,
      });
    }

    // Store assessment_scores (category-wise scores) for this specific assessmentId
    dbStore.assessment_scores = dbStore.assessment_scores.filter(
      (sc) => sc.assessment_id !== params.assessmentId
    );
    for (const sc of params.categoryScores) {
      dbStore.assessment_scores.push({
        ...sc,
        id: generateUuid(),
        created_at: now,
      });
    }

    savePersistentStore();

    if (supabaseAdmin) {
      const { error: upsertErr } = await supabaseAdmin
        .from('assessments')
        .upsert(
          {
            id: assessmentRow.id,
            student_id: assessmentRow.student_id,
            auth_user_id: assessmentRow.auth_user_id,
            assessment_type: assessmentRow.assessment_type,
            title: assessmentRow.title,
            academic_year: assessmentRow.academic_year,
            total_questions: params.totalQuestions,
            total_correct: params.totalCorrect,
            overall_score: params.overallScore,
            performance_level: params.performanceLevel,
            completion_status: 'completed',
            created_at: assessmentRow.created_at,
            completed_at: now,
          },
          { onConflict: 'id' }
        );

      if (upsertErr) {
        await supabaseAdmin
          .from('assessments')
          .upsert(
            {
              id: assessmentRow.id,
              student_id: assessmentRow.student_id,
              auth_user_id: assessmentRow.auth_user_id,
              assessment_type: assessmentRow.assessment_type,
              title: assessmentRow.title,
              academic_year: toLegacyDbCode(assessmentRow.academic_year),
              total_questions: params.totalQuestions,
              total_correct: params.totalCorrect,
              overall_score: params.overallScore,
              performance_level: params.performanceLevel,
              completion_status: 'completed',
              created_at: assessmentRow.created_at,
              completed_at: now,
            },
            { onConflict: 'id' }
          );
      }

      if (params.answers.length > 0) {
        await supabaseAdmin.from('student_answers').insert(
          params.answers.map((a) => ({
            assessment_id: a.assessment_id,
            student_id: a.student_id,
            question_id: a.question_id,
            category: a.category,
            selected_option: a.selected_option,
            correct_option: a.correct_option,
            is_correct: a.is_correct,
          }))
        );
      }

      if (params.categoryScores.length > 0) {
        await supabaseAdmin.from('assessment_scores').insert(
          params.categoryScores.map((c) => ({
            assessment_id: c.assessment_id,
            student_id: c.student_id,
            category: c.category,
            correct_answers: c.correct_answers,
            total_questions: c.total_questions,
            score_percentage: c.score_percentage,
            performance_level: c.performance_level,
          }))
        );
      }
    }

    return assessmentRow;
  },

  /**
   * Retrieve all completed assessment attempts for the authenticated student,
   * including preserved category-wise scores for each attempt.
   */
  async getStudentAssessmentHistory(params: {
    studentId: string;
    authUserId: string;
  }): Promise<
    Array<{
      assessment: AssessmentRow;
      categoryScores: AssessmentScoreRow[];
    }>
  > {
    if (supabaseAdmin) {
      const { data: pgAssessments, error: pgErr } = await supabaseAdmin
        .from('assessments')
        .select('*')
        .or(`student_id.eq.${params.studentId},auth_user_id.eq.${params.authUserId}`)
        .eq('completion_status', 'completed')
        .order('completed_at', { ascending: false });

      if (!pgErr && Array.isArray(pgAssessments) && pgAssessments.length > 0) {
        const ids = pgAssessments.map((a) => String(a.id));
        const { data: pgScores } = await supabaseAdmin
          .from('assessment_scores')
          .select('*')
          .in('assessment_id', ids);

        return pgAssessments.map((a) => {
          const mappedAssessment: AssessmentRow = {
            id: String(a.id),
            student_id: String(a.student_id),
            auth_user_id: String(a.auth_user_id || params.authUserId),
            assessment_type:
              (a.assessment_type as AssessmentTrack) || 'programming',
            title:
              a.assessment_type === 'domain'
                ? 'Technical Domain Assessment'
                : 'Programming Language Assessment',
            academic_year: normalizeLearningLevel(a.academic_year),
            total_questions: Number(a.total_questions) || 50,
            total_correct: Number(a.total_correct) || 0,
            overall_score: Number(a.overall_score) || 0,
            performance_level:
              (a.performance_level as PerformanceLevel) || 'Needs Practice',
            completion_status: 'completed',
            created_at: String(a.created_at),
            completed_at: a.completed_at ? String(a.completed_at) : null,
          };

          const scoresForAttempt: AssessmentScoreRow[] = (pgScores || [])
            .filter((s) => String(s.assessment_id) === String(a.id))
            .map((s) => ({
              id: String(s.id),
              assessment_id: String(s.assessment_id),
              student_id: String(s.student_id),
              category: String(s.category),
              correct_answers: Number(s.correct_answers) || 0,
              total_questions: Number(s.total_questions) || 10,
              score_percentage: Number(s.score_percentage) || 0,
              performance_level:
                (s.performance_level as PerformanceLevel) || 'Needs Practice',
              created_at: String(s.created_at || a.created_at),
            }));

          return {
            assessment: mappedAssessment,
            categoryScores:
              scoresForAttempt.length > 0
                ? scoresForAttempt
                : dbStore.assessment_scores.filter(
                    (sc) => sc.assessment_id === String(a.id)
                  ),
          };
        });
      }
    }

    const completedAssessments = dbStore.assessments
      .filter(
        (a) =>
          (a.student_id === params.studentId ||
            a.auth_user_id === params.authUserId) &&
          a.completion_status === 'completed'
      )
      .sort((a, b) => {
        const timeA = new Date(a.completed_at || a.created_at).getTime();
        const timeB = new Date(b.completed_at || b.created_at).getTime();
        return timeB - timeA;
      });

    return completedAssessments.map((assessment) => {
      const categoryScores = dbStore.assessment_scores.filter(
        (sc) => sc.assessment_id === assessment.id
      );
      return {
        assessment,
        categoryScores,
      };
    });
  },

  /**
   * Retrieve stored answers and category scores for a specific assessment attempt
   */
  async getAssessmentDetails(assessmentId: string): Promise<{
    assessment: AssessmentRow;
    answers: StudentAnswerRow[];
    categoryScores: AssessmentScoreRow[];
  } | null> {
    const assessment = await this.getAssessmentById(assessmentId);
    if (!assessment) return null;

    let answers = dbStore.student_answers.filter(
      (a) => a.assessment_id === assessmentId
    );
    let categoryScores = dbStore.assessment_scores.filter(
      (s) => s.assessment_id === assessmentId
    );

    if (supabaseAdmin && (answers.length === 0 || categoryScores.length === 0)) {
      const [{ data: pgAns }, { data: pgScores }] = await Promise.all([
        supabaseAdmin
          .from('student_answers')
          .select('*')
          .eq('assessment_id', assessmentId),
        supabaseAdmin
          .from('assessment_scores')
          .select('*')
          .eq('assessment_id', assessmentId),
      ]);

      if (Array.isArray(pgAns) && pgAns.length > 0) {
        answers = pgAns.map((a) => ({
          id: String(a.id),
          assessment_id: String(a.assessment_id),
          student_id: String(a.student_id),
          question_id: String(a.question_id),
          category: String(a.category),
          selected_option: (a.selected_option as OptionKey) || null,
          correct_option: (a.correct_option as OptionKey) || 'A',
          is_correct: Boolean(a.is_correct),
          created_at: String(a.created_at),
        }));
      }

      if (Array.isArray(pgScores) && pgScores.length > 0) {
        categoryScores = pgScores.map((s) => ({
          id: String(s.id),
          assessment_id: String(s.assessment_id),
          student_id: String(s.student_id),
          category: String(s.category),
          correct_answers: Number(s.correct_answers) || 0,
          total_questions: Number(s.total_questions) || 10,
          score_percentage: Number(s.score_percentage) || 0,
          performance_level:
            (s.performance_level as PerformanceLevel) || 'Needs Practice',
          created_at: String(s.created_at),
        }));
      }
    }

    return {
      assessment,
      answers,
      categoryScores,
    };
  },

  /**
   * Record a completed Skill Game attempt (kept strictly separate from official assessments)
   */
  async recordGameAttempt(params: {
    studentId: string;
    authUserId: string;
    gameType: SkillGameType;
    gameTitle: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    timeTakenSeconds: number;
  }): Promise<GameAttemptRow> {
    const now = new Date().toISOString();
    const id = `game_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const row: GameAttemptRow = {
      id,
      student_id: params.studentId,
      auth_user_id: params.authUserId,
      game_type: params.gameType,
      game_title: params.gameTitle,
      score: Math.max(0, Math.round(params.score)),
      total_questions: Math.max(1, Math.round(params.totalQuestions)),
      correct_answers: Math.max(0, Math.round(params.correctAnswers)),
      accuracy: Math.min(100, Math.max(0, Math.round(params.accuracy))),
      time_taken_seconds: Math.max(0, Math.round(params.timeTakenSeconds)),
      completed_at: now,
    };

    dbStore.game_attempts.push(row);
    savePersistentStore();

    if (supabaseAdmin) {
      await supabaseAdmin
        .from('game_attempts')
        .insert({
          id: row.id,
          student_id: row.student_id,
          auth_user_id: row.auth_user_id,
          game_type: row.game_type,
          game_title: row.game_title,
          score: row.score,
          total_questions: row.total_questions,
          correct_answers: row.correct_answers,
          accuracy: row.accuracy,
          time_taken_seconds: row.time_taken_seconds,
          completed_at: row.completed_at,
        })
        .select('*')
        .maybeSingle();
    }

    return row;
  },

  /**
   * Retrieve all completed Skill Game attempts for the authenticated student
   */
  async getStudentGameAttempts(params: {
    studentId: string;
    authUserId: string;
  }): Promise<GameAttemptRow[]> {
    if (supabaseAdmin) {
      const { data: pgGames, error: pgErr } = await supabaseAdmin
        .from('game_attempts')
        .select('*')
        .or(`student_id.eq.${params.studentId},auth_user_id.eq.${params.authUserId}`)
        .order('completed_at', { ascending: false });

      if (!pgErr && Array.isArray(pgGames) && pgGames.length > 0) {
        return pgGames.map((g) => ({
          id: String(g.id),
          student_id: String(g.student_id),
          auth_user_id: String(g.auth_user_id || params.authUserId),
          game_type: (g.game_type as SkillGameType) || 'code_debugger',
          game_title: String(g.game_title || 'Skill Game'),
          score: Number(g.score) || 0,
          total_questions: Number(g.total_questions) || 0,
          correct_answers: Number(g.correct_answers) || 0,
          accuracy: Number(g.accuracy) || 0,
          time_taken_seconds: Number(g.time_taken_seconds) || 0,
          completed_at: String(g.completed_at),
        }));
      }
    }

    return dbStore.game_attempts
      .filter(
        (g) =>
          g.student_id === params.studentId ||
          g.auth_user_id === params.authUserId
      )
      .sort(
        (a, b) =>
          new Date(b.completed_at).getTime() -
          new Date(a.completed_at).getTime()
      );
  },
};
