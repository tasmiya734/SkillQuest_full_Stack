import {
  CATEGORIES,
} from '../../server/config/constants.ts';
import {
  evaluateAssessmentSubmission,
} from '../../server/services/scoringService.ts';
import {
  getClientSafeQuestions,
} from '../../server/utils/questionBank.ts';
import {
  AcademicYear,
  AssessmentTrack,
  normalizeLearningLevel,
  OptionKey,
  PerformanceLevel,
  StudentProfile,
} from '../utils/validation.ts';

const SESSION_TOKEN_KEY = 'skillquest_supabase_access_token';
const LOCAL_FALLBACK_DB_KEY = 'skillquest_vercel_fallback_db_v1';

export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(SESSION_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface CategoryInfo {
  id: string;
  name: string;
  track: AssessmentTrack;
  questionCount: number;
  description: string;
}

export interface ClientQuestion {
  id: string;
  track: AssessmentTrack;
  category: string;
  academicYear: AcademicYear;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface CategoryScoreSummary {
  category: string;
  correct: number;
  total: number;
  percentage: number;
  performanceLevel: PerformanceLevel;
}

export interface LearningRecommendation {
  category: string;
  percentage: number;
  performanceLevel: PerformanceLevel;
  suggestion: string;
  focusTopics: string[];
}

export interface EvaluatedQuestionItem {
  questionId: string;
  category: string;
  questionText: string;
  selectedOption: OptionKey | null;
  correctOption: OptionKey;
  isCorrect: boolean;
  explanation: string;
}

export interface AssessmentResultData {
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

export interface AuthResponsePayload {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  student: StudentProfile | null;
  session: {
    accessToken: string;
  };
}

export type SkillGameType =
  | 'code_debugger'
  | 'output_predictor'
  | 'tech_match'
  | 'sql_challenge';

export interface GameAttemptData {
  id: string;
  studentId: string;
  gameType: SkillGameType;
  gameTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeTakenSeconds: number;
  completedAt: string;
}

// ============================================================================
// SELF-HEALING CLIENT FALLBACK STORE (FOR STATIC VERCEL DEPLOYMENTS)
// ============================================================================

interface LocalFallbackStore {
  users: Array<{
    id: string;
    email: string;
    password: string;
    fullName: string;
  }>;
  sessions: Record<string, string>; // token -> userId
  students: Record<string, StudentProfile>; // userId -> StudentProfile
  assessments: Record<string, AssessmentResultData[]>; // userId -> completed results
  gameAttempts: Record<string, GameAttemptData[]>; // userId -> game attempts
}

function loadLocalStore(): LocalFallbackStore {
  try {
    const raw = localStorage.getItem(LOCAL_FALLBACK_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const normalizedStudents: Record<string, StudentProfile> = {};
      if (parsed.students && typeof parsed.students === 'object') {
        for (const [k, v] of Object.entries(parsed.students)) {
          const st = v as StudentProfile;
          if (st) {
            normalizedStudents[k] = {
              ...st,
              academicYear: normalizeLearningLevel(st.academicYear),
            };
          }
        }
      }
      const normalizedAssessments: Record<string, AssessmentResultData[]> = {};
      if (parsed.assessments && typeof parsed.assessments === 'object') {
        for (const [k, v] of Object.entries(parsed.assessments)) {
          if (Array.isArray(v)) {
            normalizedAssessments[k] = v.map((item: AssessmentResultData) => ({
              ...item,
              academicYear: normalizeLearningLevel(item.academicYear),
            }));
          }
        }
      }
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        sessions: parsed.sessions || {},
        students: normalizedStudents,
        assessments: normalizedAssessments,
        gameAttempts: parsed.gameAttempts || {},
      };
    }
  } catch {
    // Ignore
  }
  return {
    users: [],
    sessions: {},
    students: {},
    assessments: {},
    gameAttempts: {},
  };
}

function saveLocalStore(store: LocalFallbackStore) {
  try {
    localStorage.setItem(LOCAL_FALLBACK_DB_KEY, JSON.stringify(store));
  } catch {
    // Ignore
  }
}

function getLocalCurrentUser(): {
  user: { id: string; email: string; fullName: string };
  student: StudentProfile | null;
} | null {
  const token = getStoredAccessToken();
  if (!token) return null;
  const store = loadLocalStore();
  const userId = store.sessions[token];
  if (!userId) return null;
  const u = store.users.find((item) => item.id === userId);
  if (!u) return null;
  const st = store.students[userId] || null;
  return {
    user: { id: u.id, email: u.email, fullName: st?.fullName || u.fullName },
    student: st,
  };
}

async function safeJsonParse(res: Response): Promise<any | null> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ============================================================================
// AUTHENTICATION API CALLS
// ============================================================================

export async function apiRegisterUser(payload: {
  fullName: string;
  email: string;
  password: string;
  academicYear?: AcademicYear;
  division?: string;
  college?: string;
}): Promise<AuthResponsePayload> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.user) {
      mirrorAuthPayloadLocally(data, payload.password);
      return data;
    }
  } catch {
    // Fall through to client-side store if /api/auth/register is unreachable or errors on Vercel
  }

  // Fallback for static Vercel deployment or offline/misconfigured backend
  const store = loadLocalStore();
  const cleanEmail = payload.email.trim().toLowerCase();
  const now = new Date().toISOString();

  let targetUser = store.users.find((u) => u.email === cleanEmail);
  if (targetUser) {
    targetUser.password = payload.password;
    targetUser.fullName = payload.fullName.trim();
  } else {
    targetUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      email: cleanEmail,
      password: payload.password,
      fullName: payload.fullName.trim(),
    };
    store.users.push(targetUser);
  }

  const userId = targetUser.id;
  const token = `sq_local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  store.sessions[token] = userId;

  let student: StudentProfile | null = store.students[userId] || null;
  if (payload.academicYear && payload.division && payload.college) {
    student = {
      id: student?.id || `std_${Date.now()}`,
      authUserId: userId,
      fullName: payload.fullName.trim(),
      email: cleanEmail,
      academicYear: payload.academicYear,
      division: payload.division.trim(),
      college: payload.college.trim(),
      createdAt: student?.createdAt || now,
      updatedAt: now,
    };
    store.students[userId] = student;
  }

  saveLocalStore(store);

  return {
    user: { id: userId, email: cleanEmail, fullName: targetUser.fullName },
    student,
    session: { accessToken: token },
  };
}

export async function apiLoginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthResponsePayload> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.user) {
      mirrorAuthPayloadLocally(data, payload.password);
      return data;
    }
    if (res.status === 401 && data && typeof data.error === 'string') {
      // Check if account exists in local fallback store before throwing 401
      const localCheck = loadLocalStore().users.find(
        (u) => u.email === payload.email.trim().toLowerCase()
      );
      if (!localCheck) {
        throw new Error(data.error);
      }
    }
  } catch (err: any) {
    if (
      err?.message &&
      err.message.toLowerCase().includes('invalid email or password')
    ) {
      throw err;
    }
  }

  // Fallback for static Vercel deployment
  const store = loadLocalStore();
  const cleanEmail = payload.email.trim().toLowerCase();
  const found = store.users.find((u) => u.email === cleanEmail);
  if (!found || found.password !== payload.password) {
    throw new Error('Invalid email or password. Please check your credentials.');
  }

  const token = `sq_local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  store.sessions[token] = found.id;
  saveLocalStore(store);

  const student = store.students[found.id] || null;
  return {
    user: {
      id: found.id,
      email: found.email,
      fullName: student?.fullName || found.fullName,
    },
    student,
    session: { accessToken: token },
  };
}

export async function apiGoogleAuth(payload: {
  email: string;
  fullName: string;
}): Promise<AuthResponsePayload> {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.user) {
      mirrorAuthPayloadLocally(data, 'google_oauth');
      return data;
    }
  } catch {
    // Fall through to client-side store on Vercel static deployment
  }

  // Fallback for static Vercel deployment
  const store = loadLocalStore();
  const cleanEmail = payload.email.trim().toLowerCase();
  const cleanName =
    payload.fullName.trim() ||
    cleanEmail
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

  let found = store.users.find((u) => u.email === cleanEmail);
  if (!found) {
    found = {
      id: `usr_google_${Date.now()}`,
      email: cleanEmail,
      password: 'google_oauth',
      fullName: cleanName,
    };
    store.users.push(found);
  }

  const token = `sq_local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  store.sessions[token] = found.id;
  saveLocalStore(store);

  const student = store.students[found.id] || null;
  return {
    user: {
      id: found.id,
      email: found.email,
      fullName: student?.fullName || found.fullName || cleanName,
    },
    student,
    session: { accessToken: token },
  };
}

function mirrorAuthPayloadLocally(
  data: AuthResponsePayload,
  passwordHint: string
) {
  try {
    const store = loadLocalStore();
    const existingIdx = store.users.findIndex(
      (u) => u.email === data.user.email.toLowerCase()
    );
    if (existingIdx >= 0) {
      store.users[existingIdx].id = data.user.id;
      store.users[existingIdx].fullName = data.user.fullName;
    } else {
      store.users.push({
        id: data.user.id,
        email: data.user.email.toLowerCase(),
        password: passwordHint,
        fullName: data.user.fullName,
      });
    }
    store.sessions[data.session.accessToken] = data.user.id;
    if (data.student) {
      store.students[data.user.id] = data.student;
    }
    saveLocalStore(store);
  } catch {
    // Ignore
  }
}

export async function apiLogoutUser(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: getAuthHeaders(),
  }).catch(() => {});
  setStoredAccessToken(null);
}

export async function apiFetchCurrentSession(): Promise<{
  user: { id: string; email: string; fullName: string };
  student: StudentProfile | null;
} | null> {
  const token = getStoredAccessToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/session', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.user) {
      return data;
    }
    if (res.status === 401) {
      const local = getLocalCurrentUser();
      if (local) return local;
      setStoredAccessToken(null);
      return null;
    }
  } catch {
    // Ignore network error and check local session
  }

  return getLocalCurrentUser();
}

// ============================================================================
// STUDENT PROFILE API CALLS
// ============================================================================

export async function loadStudentProfile(): Promise<StudentProfile | null> {
  try {
    const res = await fetch('/api/students/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.student) {
      return data.student;
    }
  } catch {
    // Fallback
  }
  const local = getLocalCurrentUser();
  return local?.student || null;
}

export async function saveStudentProfile(input: {
  fullName: string;
  email: string;
  academicYear: AcademicYear;
  division: string;
  college: string;
}): Promise<StudentProfile> {
  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && data.student) {
      const store = loadLocalStore();
      store.students[data.student.authUserId] = data.student;
      saveLocalStore(store);
      return data.student;
    }
  } catch {
    // Fallback
  }

  const local = getLocalCurrentUser();
  const userId = local?.user.id || `usr_${Date.now()}`;
  const now = new Date().toISOString();
  const saved: StudentProfile = {
    id: local?.student?.id || `std_${Date.now()}`,
    authUserId: userId,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    academicYear: input.academicYear,
    division: input.division.trim(),
    college: input.college.trim(),
    createdAt: local?.student?.createdAt || now,
    updatedAt: now,
  };

  const store = loadLocalStore();
  store.students[userId] = saved;
  saveLocalStore(store);
  return saved;
}

// ============================================================================
// CATEGORIES, QUESTIONS & ASSESSMENTS API CALLS
// ============================================================================

export async function fetchCategories(
  track?: AssessmentTrack
): Promise<CategoryInfo[]> {
  try {
    const url = track ? `/api/categories?track=${track}` : '/api/categories';
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && Array.isArray(data.categories)) {
      return data.categories;
    }
  } catch {
    // Fallback
  }
  if (track) {
    return CATEGORIES.filter((c) => c.track === track);
  }
  return CATEGORIES;
}

export async function fetchQuestionsForAssessment(
  track: AssessmentTrack,
  academicYear: AcademicYear
): Promise<ClientQuestion[]> {
  try {
    const res = await fetch(
      `/api/questions?track=${encodeURIComponent(
        track
      )}&academicYear=${encodeURIComponent(academicYear)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    const data = await safeJsonParse(res);
    if (res.ok && data && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }
  } catch {
    // Fallback
  }

  return getClientSafeQuestions(track, academicYear);
}

export async function startNewAssessmentSession(params: {
  assessmentType: AssessmentTrack;
  academicYear?: AcademicYear;
}): Promise<string> {
  try {
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        assessmentType: params.assessmentType,
        academicYear: params.academicYear,
      }),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data?.assessment?.assessmentId) {
      return data.assessment.assessmentId;
    }
  } catch {
    // Fallback
  }

  return `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function submitAssessmentToBackend(params: {
  assessmentId: string;
  assessmentType: AssessmentTrack;
  academicYear?: AcademicYear;
  answers: Record<string, OptionKey>;
}): Promise<AssessmentResultData> {
  try {
    const res = await fetch(
      `/api/assessments/${encodeURIComponent(params.assessmentId)}/submit`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          assessmentType: params.assessmentType,
          academicYear: params.academicYear,
          answers: params.answers,
        }),
      }
    );
    const data = await safeJsonParse(res);
    if (res.ok && data?.result) {
      saveAssessmentResultLocally(data.result);
      return data.result;
    }
  } catch {
    // Fallback
  }

  const local = getLocalCurrentUser();
  const studentId = local?.student?.id || local?.user.id || 'local_student';
  const academicYear: AcademicYear = normalizeLearningLevel(
    params.academicYear || local?.student?.academicYear || 'Easy'
  );

  const evaluated = evaluateAssessmentSubmission({
    assessmentId: params.assessmentId,
    studentId,
    assessmentType: params.assessmentType,
    academicYear,
    answers: params.answers,
  });

  saveAssessmentResultLocally(evaluated);
  return evaluated;
}

function saveAssessmentResultLocally(result: AssessmentResultData) {
  try {
    const local = getLocalCurrentUser();
    const userId = local?.user.id || result.studentId;
    const store = loadLocalStore();
    const list = store.assessments[userId] || [];
    const filtered = list.filter((r) => r.assessmentId !== result.assessmentId);
    filtered.unshift(result);
    store.assessments[userId] = filtered;
    saveLocalStore(store);
  } catch {
    // Ignore
  }
}

export async function fetchAssessmentResultById(
  assessmentId: string
): Promise<AssessmentResultData | null> {
  try {
    const res = await fetch(
      `/api/assessments/${encodeURIComponent(assessmentId)}/result`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    const data = await safeJsonParse(res);
    if (res.ok && data?.result) {
      return data.result;
    }
  } catch {
    // Fallback
  }

  const store = loadLocalStore();
  for (const list of Object.values(store.assessments)) {
    const match = list.find((r) => r.assessmentId === assessmentId);
    if (match) return match;
  }
  return null;
}

export async function fetchStudentAssessmentHistory(): Promise<
  AssessmentResultData[]
> {
  try {
    const res = await fetch('/api/assessments/history', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && Array.isArray(data.history)) {
      if (data.history.length > 0) {
        return data.history;
      }
    }
  } catch {
    // Fallback
  }

  const local = getLocalCurrentUser();
  if (!local) return [];
  const store = loadLocalStore();
  return store.assessments[local.user.id] || [];
}

// ============================================================================
// SKILL GAMES API CALLS (Separate from official assessments)
// ============================================================================

export async function fetchGameAttemptsHistory(): Promise<GameAttemptData[]> {
  try {
    const res = await fetch('/api/games/attempts', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data && Array.isArray(data.attempts)) {
      if (data.attempts.length > 0) {
        return data.attempts;
      }
    }
  } catch {
    // Fallback
  }

  const local = getLocalCurrentUser();
  if (!local) return [];
  const store = loadLocalStore();
  return store.gameAttempts[local.user.id] || [];
}

const GAME_TITLES_MAP: Record<SkillGameType, string> = {
  code_debugger: 'Code Debugger',
  output_predictor: 'Output Predictor',
  tech_match: 'Tech Match',
  sql_challenge: 'SQL Challenge',
};

export async function recordGameAttemptToBackend(params: {
  gameType: SkillGameType;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeTakenSeconds: number;
}): Promise<GameAttemptData | null> {
  try {
    const res = await fetch('/api/games/attempts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    const data = await safeJsonParse(res);
    if (res.ok && data?.attempt) {
      saveGameAttemptLocally(data.attempt);
      return data.attempt;
    }
  } catch {
    // Fallback
  }

  const local = getLocalCurrentUser();
  const fallbackAttempt: GameAttemptData = {
    id: `game_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    studentId: local?.student?.id || local?.user.id || 'local_student',
    gameType: params.gameType,
    gameTitle: GAME_TITLES_MAP[params.gameType],
    score: params.score,
    totalQuestions: params.totalQuestions,
    correctAnswers: params.correctAnswers,
    accuracy: params.accuracy,
    timeTakenSeconds: params.timeTakenSeconds,
    completedAt: new Date().toISOString(),
  };
  saveGameAttemptLocally(fallbackAttempt);
  return fallbackAttempt;
}

function saveGameAttemptLocally(attempt: GameAttemptData) {
  try {
    const local = getLocalCurrentUser();
    const userId = local?.user.id || attempt.studentId;
    const store = loadLocalStore();
    const list = store.gameAttempts[userId] || [];
    const filtered = list.filter((g) => g.id !== attempt.id);
    filtered.unshift(attempt);
    store.gameAttempts[userId] = filtered;
    saveLocalStore(store);
  } catch {
    // Ignore
  }
}
