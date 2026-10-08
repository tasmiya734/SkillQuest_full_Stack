import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Code2, Compass, History as HistoryIcon } from 'lucide-react';
import { AssessmentCard } from '../components/AssessmentCard.tsx';
import { Button } from '../components/Button.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import {
  AssessmentResultData,
  fetchGameAttemptsHistory,
  fetchStudentAssessmentHistory,
  GameAttemptData,
} from '../services/api.ts';
import { normalizeLearningLevel } from '../utils/validation.ts';
import progImg from '../assets/images/card_programming_assessment_1791229967404.jpg';
import domainImg from '../assets/images/card_domain_assessment_1791229977276.jpg';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [history, setHistory] = useState<AssessmentResultData[]>([]);
  const [gameAttempts, setGameAttempts] = useState<GameAttemptData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const studentName = profile?.fullName || user?.fullName || 'Student';
  const academicYear = normalizeLearningLevel(profile?.academicYear);

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
    }
  }, [location.hash]);

  useEffect(() => {
    let active = true;
    if (!user) return;

    Promise.all([
      fetchStudentAssessmentHistory(),
      fetchGameAttemptsHistory(),
    ])
      .then(([assessmentItems, gameItems]) => {
        if (!active) return;
        setHistory(assessmentItems);
        setGameAttempts(gameItems);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingHistory(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const bestGameScore =
    gameAttempts.length > 0
      ? Math.max(...gameAttempts.map((g) => g.score))
      : 0;
  const lastGameType = gameAttempts[0]?.gameType || 'code_debugger';

  const latestProgramming = history.find(
    (h) => h.assessmentType === 'programming'
  );
  const latestDomain = history.find((h) => h.assessmentType === 'domain');

  const programmingCategories = [
    'Python',
    'C/C++',
    'Java',
    'JavaScript',
    'SQL',
  ];

  const domainCategories = [
    'Data Analytics',
    'Data Science & AI',
    'Web Development',
    'Cybersecurity',
    'Cloud Computing',
    'Database Management',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
      {/* 1. Student Welcome & Status Area */}
      <section className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-[#06B6D4] font-semibold">
              Technology Exploration &amp; Skill Discovery
            </span>
            <span aria-hidden="true">·</span>
            <span>{academicYear} Learning Level</span>
            {profile?.division && (
              <>
                <span aria-hidden="true">·</span>
                <span>Section {profile.division}</span>
              </>
            )}
            {profile?.college && (
              <>
                <span aria-hidden="true">·</span>
                <span>{profile.college}</span>
              </>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Welcome back, {studentName}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Explore different programming languages and technology domains before deciding
            what to learn further. Choose either assessment below to learn what each area
            is used for and check your current familiarity.
          </p>
          <p className="text-xs font-mono text-[#06B6D4] pt-0.5">
            EXPLORE → LEARN → ASSESS → UNDERSTAND → EXPLORE FURTHER
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 shrink-0">
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">Learning Level</p>
            <p className="font-mono tabular-nums text-lg font-bold text-white">
              {academicYear} Level
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">Completed Attempts</p>
            <p className="font-mono tabular-nums text-lg font-bold text-[#3B82F6]">
              {history.length}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/history')}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>History</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Assessment Tracks Section */}
      <section id="tracks" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#3B82F6] tracking-wide mb-1">
              01. Two Separate Exploration Tracks
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Select Your Exploration Assessment
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              These two separate assessments help you understand what each programming
              language and technology domain involves. Your results highlight your current
              familiarity and areas to explore further—never a fixed career label.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/assessment')}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Technology Guide</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AssessmentCard
            title="Programming Language Assessment"
            description="Understand and explore different programming languages—what each language is used for, what can be built with it, and beginner-friendly concepts."
            questionCount={50}
            categories={programmingCategories}
            academicYear={academicYear}
            imageSrc={progImg}
            imageAlt="Programming Language Assessment visual"
            accentColor="blue"
            lastScore={latestProgramming ? latestProgramming.overallPercentage : null}
            onStart={() => navigate('/assessment/programming')}
          />

          <AssessmentCard
            title="Technical Domain Assessment"
            description="Explore what major areas of technology involve, what real-world problems they solve, and which domains you find most interesting."
            questionCount={60}
            categories={domainCategories}
            academicYear={academicYear}
            imageSrc={domainImg}
            imageAlt="Technical Domain Assessment visual"
            accentColor="purple"
            lastScore={latestDomain ? latestDomain.overallPercentage : null}
            onStart={() => navigate('/assessment/domain')}
          />
        </div>
      </section>

      {/* 3. Compact Skill Games Practice Section (Smaller than main assessments) */}
      <section className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#07111F] border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
            <Code2 className="w-5 h-5 text-[#06B6D4]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#06B6D4] font-medium">
              <span>Optional Interactive Practice</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">
                Code Debugger · Output Predictor · Tech Match · SQL Challenge
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              Practice Your Skills
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Strengthen your technical knowledge through quick challenges.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 shrink-0">
          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">Best Score</p>
            <p className="font-mono tabular-nums text-base font-bold text-[#06B6D4]">
              {gameAttempts.length > 0 ? `${bestGameScore} pts` : '—'}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="text-xs text-slate-400">Games Completed</p>
            <p className="font-mono tabular-nums text-base font-bold text-white">
              {gameAttempts.length}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {gameAttempts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/games/${lastGameType}`)}
              >
                Continue Playing
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/games')}
            >
              <span>{gameAttempts.length > 0 ? 'All Games' : 'Continue Playing'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Recent Assessment History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">
              Recent Assessment History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your previous attempts are preserved so you can review category breakdowns and explanations at any time.
            </p>
          </div>
          {!loadingHistory && history.length > 0 && (
            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6] hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              <span>View All ({history.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loadingHistory ? (
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/80 p-6 space-y-3">
            <div className="h-10 bg-slate-800/50 rounded animate-pulse" />
            <div className="h-10 bg-slate-800/50 rounded animate-pulse" />
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-200">
              You haven&apos;t completed an assessment yet.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Start either the Programming Language Assessment (50 questions) or the
              Technical Domain Assessment (60 questions) above to explore each category
              and see your familiarity breakdown.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 overflow-hidden">
            <div className="divide-y divide-slate-800/80">
              {history.slice(0, 5).map((item) => (
                <div
                  key={item.assessmentId}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0F172A]/60 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                      <span>{item.academicYear} Level</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {item.correctAnswers}/{item.totalQuestions} Marks
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {new Date(item.evaluatedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-right">
                      <p className="font-mono tabular-nums text-lg font-bold text-white">
                        {item.overallPercentage}%
                      </p>
                      <p className="text-xs text-[#06B6D4]">
                        {item.performanceLevel}
                      </p>
                    </div>

                    <Link
                      to={`/results/${item.assessmentId}`}
                      state={{ result: item }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B82F6] hover:text-blue-400 transition-colors whitespace-nowrap"
                    >
                      <span>View Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. How It Works (Guided Discovery) & Familiarity Scale */}
      <section
        id="methodology"
        className="pt-8 border-t border-slate-800/80 space-y-6 scroll-mt-20"
      >
        <div className="max-w-2xl space-y-1.5">
          <p className="text-xs font-medium text-[#06B6D4] tracking-wide">
            02. How It Works
          </p>
          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
            Guided Technology Exploration (Easy · Moderate · Difficult)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            SkillQuest organizes exploration questions into three progressive learning levels so you can learn what
            each language and domain involves without overwhelming jargon or career labels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-2">
            <p className="font-mono text-xs font-semibold text-[#3B82F6]">
              01. Easy Level
            </p>
            <h3 className="text-sm font-semibold text-white">Beginner Exploration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Introduces what each programming language and tech domain is, what can be
              built with it, and simple real-world use cases.
            </p>
          </div>
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-2">
            <p className="font-mono text-xs font-semibold text-[#8B5CF6]">
              02. Moderate Level
            </p>
            <h3 className="text-sm font-semibold text-white">Developing Understanding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explores conceptual understanding, common tools/libraries, and how different
              languages and domains work in practical situations.
            </p>
          </div>
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-2">
            <p className="font-mono text-xs font-semibold text-[#06B6D4]">
              03. Difficult Level
            </p>
            <h3 className="text-sm font-semibold text-white">Application &amp; Scenario Reasoning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connects deeper conceptual understanding and scenario reasoning to choose
              appropriate technologies for real software projects.
            </p>
          </div>
        </div>
      </section>

      <section
        id="scale"
        className="pt-8 border-t border-slate-800/80 space-y-6 scroll-mt-20"
      >
        <div className="max-w-2xl space-y-1.5">
          <p className="text-xs font-medium text-[#3B82F6] tracking-wide">
            03. Performance Scale
          </p>
          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
            Familiarity & Exploration Tiers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Each correct answer awards 1 mark. Scores reflect your current familiarity and
            awareness to help guide what you explore next:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-1.5">
            <p className="font-mono tabular-nums text-lg font-bold text-emerald-400">
              80–100%
            </p>
            <h3 className="text-sm font-semibold text-white">Strong</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strong familiarity with what this area involves and how it is used—ready for
              hands-on mini-projects.
            </p>
          </div>
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-1.5">
            <p className="font-mono tabular-nums text-lg font-bold text-[#3B82F6]">
              60–79%
            </p>
            <h3 className="text-sm font-semibold text-white">Good</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Good foundational awareness of core use cases and concepts, with room to
              explore practical examples further.
            </p>
          </div>
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-1.5">
            <p className="font-mono tabular-nums text-lg font-bold text-amber-400">
              40–59%
            </p>
            <h3 className="text-sm font-semibold text-white">Developing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Growing familiarity with basic ideas; reviewing question explanations will
              help clarify what this technology does.
            </p>
          </div>
          <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-1.5">
            <p className="font-mono tabular-nums text-lg font-bold text-rose-400">
              0–39%
            </p>
            <h3 className="text-sm font-semibold text-white">Needs Practice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A brand-new or less-explored area for you—use our beginner-friendly guides to
              discover what it is all about!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
