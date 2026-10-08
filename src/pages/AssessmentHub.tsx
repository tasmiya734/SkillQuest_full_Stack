import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Compass,
  History as HistoryIcon,
} from 'lucide-react';
import { AssessmentCard } from '../components/AssessmentCard.tsx';
import { Button } from '../components/Button.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import {
  AssessmentResultData,
  fetchStudentAssessmentHistory,
} from '../services/api.ts';
import { TECH_EXPLORATION_GUIDES } from '../utils/techExplorerData.ts';
import { AcademicYear, normalizeLearningLevel } from '../utils/validation.ts';
import progImg from '../assets/images/card_programming_assessment_1791229967404.jpg';
import domainImg from '../assets/images/card_domain_assessment_1791229977276.jpg';

const LEVEL_OPTIONS: { level: AcademicYear; subtitle: string }[] = [
  { level: 'Easy', subtitle: 'Beginner Exploration' },
  { level: 'Moderate', subtitle: 'Developing Understanding' },
  { level: 'Difficult', subtitle: 'Deeper Conceptual & Application' },
];

export const AssessmentHub: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isProfileComplete } = useAuth();
  const [history, setHistory] = useState<AssessmentResultData[]>([]);
  const [selectedGuideName, setSelectedGuideName] = useState<string>('Python');
  const [selectedLevel, setSelectedLevel] = useState<AcademicYear>(
    normalizeLearningLevel(profile?.academicYear)
  );

  useEffect(() => {
    if (profile?.academicYear) {
      setSelectedLevel(normalizeLearningLevel(profile.academicYear));
    }
  }, [profile?.academicYear]);

  const handleStartTrack = (track: 'programming' | 'domain') => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isProfileComplete) {
      navigate('/profile');
      return;
    }
    navigate(`/assessment/${track}?level=${encodeURIComponent(selectedLevel)}`);
  };

  useEffect(() => {
    let active = true;
    if (!user) return;

    fetchStudentAssessmentHistory()
      .then((items) => {
        if (active) setHistory(items);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user]);

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

  const activeGuide =
    TECH_EXPLORATION_GUIDES[selectedGuideName] ||
    TECH_EXPLORATION_GUIDES.Python;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Page Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800/80 pb-8">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#06B6D4] font-semibold tracking-wide">
            <span>Technology Exploration &amp; Skill Discovery</span>
            <span aria-hidden="true">·</span>
            <span>{selectedLevel} Learning Level</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Explore &amp; Choose Your Assessment
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            SkillQuest helps you explore programming languages and technology domains
            before deciding what you want to learn further. Choose your preferred learning
            level (Easy, Moderate, or Difficult) and start either assessment below.
          </p>
          <p className="text-xs font-mono text-[#06B6D4] pt-0.5">
            EXPLORE → LEARN → ASSESS → UNDERSTAND → EXPLORE FURTHER
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/history')}
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Assessment History ({history.length})</span>
          </Button>
        </div>
      </section>

      {/* Learning Level Selector (Easy / Moderate / Difficult) */}
      <section className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-[#06B6D4]">
            Question Bank Learning Level
          </p>
          <h2 className="text-base font-bold text-white">
            Select Learning Level for Your Assessment
          </h2>
          <p className="text-xs text-slate-400">
            Questions are organized by learning progression—not college academic years.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
          {LEVEL_OPTIONS.map((opt) => {
            const active = selectedLevel === opt.level;
            return (
              <button
                key={opt.level}
                type="button"
                onClick={() => setSelectedLevel(opt.level)}
                className={`px-4 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[#3B82F6] bg-[#2563EB]/15 text-white'
                    : 'border-slate-800 bg-[#07111F] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-mono font-bold text-[#06B6D4]">
                  {opt.level}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {opt.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Assessment Tracks Section inside Assessment Page */}
      <section id="tracks" className="space-y-5 scroll-mt-20">
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-[#3B82F6]">
            Assessment Tracks · Two Separate Exploration Assessments
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            Choose Your Assessment Track
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Take either the Programming Language Assessment or the Technical Domain Assessment at your selected <strong className="text-slate-200">{selectedLevel}</strong> learning level.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AssessmentCard
            title="Programming Language Assessment"
            description="Understand and explore different programming languages—what each language is used for, what can be built with it, and beginner-friendly concepts across 50 questions."
            questionCount={50}
            categories={programmingCategories}
            academicYear={selectedLevel}
            imageSrc={progImg}
            imageAlt="Programming Language Assessment visual"
            accentColor="blue"
            lastScore={
              latestProgramming ? latestProgramming.overallPercentage : null
            }
            onStart={() => handleStartTrack('programming')}
          />

          <AssessmentCard
            title="Technical Domain Assessment"
            description="Explore what major technology fields actually involve, what real-world problems they solve, and which areas interest you across 60 questions."
            questionCount={60}
            categories={domainCategories}
            academicYear={selectedLevel}
            imageSrc={domainImg}
            imageAlt="Technical Domain Assessment visual"
            accentColor="purple"
            lastScore={latestDomain ? latestDomain.overallPercentage : null}
            onStart={() => handleStartTrack('domain')}
          />
        </div>
      </section>

      {/* Interactive Technology Explorer ("EXPLORE & LEARN" before or after taking an assessment) */}
      <section className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#06B6D4] font-semibold">
              <Compass className="w-4 h-4" />
              <span>Interactive Technology Guide · Explore Before You Assess</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              What Is Each Language & Technology Domain Used For?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Click any programming language or technology domain below to learn what it
              is and what can be built with it.
            </p>
          </div>
        </div>

        {/* Selector Tabs for 5 Languages + 6 Domains */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Programming Languages (Track A)
            </p>
            <div className="flex flex-wrap gap-2">
              {programmingCategories.map((name) => {
                const isSelected = selectedGuideName === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedGuideName(name)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#07111F] text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Technical Domains (Track B)
            </p>
            <div className="flex flex-wrap gap-2">
              {domainCategories.map((name) => {
                const isSelected = selectedGuideName === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedGuideName(name)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B5CF6] text-white'
                        : 'bg-[#07111F] text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Technology Guide Details Card */}
        <div className="rounded-xl bg-[#07111F] border border-slate-800 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#06B6D4] font-mono">
              <span>
                {activeGuide.track === 'programming'
                  ? 'Programming Language'
                  : 'Technical Domain'}
              </span>
              <span aria-hidden="true">·</span>
              <span>10 Questions in Assessment</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">
              {activeGuide.name}
            </h3>
            <p className="text-xs font-medium text-slate-300">
              {activeGuide.tagline}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
              {activeGuide.whatItIs}
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>What Can Be Built / Solved With It</span>
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeGuide.whatYouCanBuild.map((item) => (
                  <li key={item} className="leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Where It Is Commonly Used</span>
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeGuide.whereItIsUsed}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <p className="text-xs font-semibold text-[#06B6D4]">
                  How to Explore Further:
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {activeGuide.exploreNextTip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Guidelines Strip */}
      <section className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">
              Exploration, Not Career Prediction
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Questions are designed to teach you what each language and domain is used
              for while checking your current familiarity—never to restrict your future.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">
              Category-Wise Familiarity Breakdown
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every correct answer awards 1 mark. See which languages or domains you
              already understand well and which ones to explore next.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">
              Unlimited Historical Attempts
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Retake assessments anytime as you learn more. Every attempt is saved as a
              separate record in your Assessment History.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
