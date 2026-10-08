import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Compass } from 'lucide-react';
import { Button } from '../components/Button.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import heroImg from '../assets/images/hero_skill_constellation_1791229953110.jpg';
import progImg from '../assets/images/card_programming_assessment_1791229967404.jpg';
import domainImg from '../assets/images/card_domain_assessment_1791229977276.jpg';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [heroImgError, setHeroImgError] = useState(false);
  const [progImgError, setProgImgError] = useState(false);
  const [domainImgError, setDomainImgError] = useState(false);

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

  const previewScores = [
    { name: 'Python', score: 82, level: 'Strong', color: 'from-emerald-500 to-teal-400' },
    { name: 'JavaScript', score: 76, level: 'Good', color: 'from-[#2563EB] to-[#06B6D4]' },
    { name: 'C/C++', score: 67, level: 'Good', color: 'from-[#2563EB] to-[#3B82F6]' },
    { name: 'SQL', score: 61, level: 'Good', color: 'from-[#8B5CF6] to-[#3B82F6]' },
    { name: 'Java', score: 54, level: 'Developing', color: 'from-amber-500 to-yellow-400' },
  ];

  const discoverySteps = [
    {
      step: '01. EXPLORE',
      title: 'Discover What Exists',
      detail: 'See what programming languages and technology domains are actually used for in the real world.',
    },
    {
      step: '02. LEARN',
      title: 'Understand Use Cases',
      detail: 'Learn what can be built with each language and what kind of problems each tech field solves.',
    },
    {
      step: '03. ASSESS',
      title: 'Check Your Familiarity',
      detail: 'Take beginner-friendly, educational assessments across Easy, Moderate, and Difficult learning levels.',
    },
    {
      step: '04. UNDERSTAND',
      title: 'See Your Strengths',
      detail: 'Review category-wise scores and question explanations to see which areas you already grasp well.',
    },
    {
      step: '05. EXPLORE FURTHER',
      title: 'Choose What to Learn Next',
      detail: 'Use constructive learning pointers to explore the languages and domains that genuinely interest you.',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background lighting */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 w-[620px] h-[380px] rounded-full bg-[#3B82F6]/12 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-40 right-10 w-[480px] h-[360px] rounded-full bg-[#8B5CF6]/10 blur-[130px]"
        aria-hidden="true"
      />

      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#06B6D4] font-semibold tracking-wide">
              <span>Technology Exploration and Skill Discovery Platform</span>
              <span aria-hidden="true">·</span>
              <span>Easy · Moderate · Difficult Levels</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Explore Technology Before You Choose What to Learn.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Many students pick a programming language or tech field simply because friends
              are learning it or it is trending online—without knowing what it is actually
              used for. SkillQuest helps you explore core languages and technology domains,
              understand what can be built with them, and discover your current familiarity.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#06B6D4] pt-1">
              <span>EXPLORE</span>
              <span className="text-slate-500">→</span>
              <span>LEARN</span>
              <span className="text-slate-500">→</span>
              <span>ASSESS</span>
              <span className="text-slate-500">→</span>
              <span>UNDERSTAND</span>
              <span className="text-slate-500">→</span>
              <span>EXPLORE FURTHER</span>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
              >
                <span>Start Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(user ? '/assessment' : '/login')}
              >
                {user ? 'Explore Assessments' : 'Sign In'}
              </Button>
            </div>

            {/* Quantitative scope summary (unboxed metadata) */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <p className="font-mono tabular-nums text-2xl font-bold text-white">5</p>
                <p className="text-xs text-slate-400 mt-0.5">Programming Languages</p>
              </div>
              <div>
                <p className="font-mono tabular-nums text-2xl font-bold text-white">6</p>
                <p className="text-xs text-slate-400 mt-0.5">Technology Domains</p>
              </div>
              <div>
                <p className="font-mono tabular-nums text-lg sm:text-xl font-bold text-white">Easy · Mod · Diff</p>
                <p className="text-xs text-slate-400 mt-0.5">3 Learning Levels</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Composition (Skill Graph + Category Familiarity Preview) */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 overflow-hidden shadow-2xl">
              <div className="relative h-48 w-full bg-[#0F172A] overflow-hidden">
                {!heroImgError ? (
                  <img
                    src={heroImg}
                    alt="SkillQuest interconnected technology exploration and skill discovery visualization"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0B1630] via-[#0F172A] to-[#1E293B]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1630] via-[#0B1630]/40 to-transparent" />
                <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-medium text-white">
                    Language Familiarity Breakdown
                  </span>
                  <span className="font-mono tabular-nums text-[#06B6D4]">
                    Overall: 68% · Good
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  {previewScores.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">
                          {item.name}{' '}
                          <span className="text-slate-500">· {item.level}</span>
                        </span>
                        <span className="font-mono tabular-nums font-semibold text-white">
                          {item.score}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#07111F] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-[#06B6D4]">
                    Exploration Insight (Not a Career Label)
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    You already understand what Python and JavaScript are used for. Explore
                    how Java powers enterprise backends and how SQL connects database tables!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ASSESSMENT TRACKS SECTION */}
      <section
        id="tracks"
        className="scroll-mt-16 border-t border-slate-800/80 bg-[#0B1630]/40 py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-medium text-[#3B82F6] tracking-wide">
              01. Two Separate Exploration Tracks
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Explore Programming Languages and Technology Domains separately.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              SkillQuest does not claim that a few MCQs can decide your future career. Instead,
              our two separate assessments introduce you to real-world use cases, what can be
              built with each technology, and where your current understanding stands.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Track 1: Programming Languages */}
            <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-[#0F172A] overflow-hidden">
                  {!progImgError && (
                    <img
                      src={progImg}
                      alt="Programming Language Assessment visual"
                      referrerPolicy="no-referrer"
                      onError={() => setProgImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1630] via-[#0B1630]/40 to-transparent" />
                  <div className="absolute bottom-3 left-6 text-xs font-mono tabular-nums text-slate-300">
                    50 Questions Total · 5 Languages · 10 Questions Each
                  </div>
                </div>
                <div className="p-6 sm:p-8 space-y-4">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                    Programming Language Assessment
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Help you understand and explore different programming languages—what each
                    language is, what can be built with it, where it is used in the real world,
                    and basic beginner-friendly concepts.
                  </p>
                  <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                    <p className="text-slate-400 font-medium">Languages You Will Explore:</p>
                    <p className="text-white font-medium">
                      Python  ·  C/C++  ·  Java  ·  JavaScript  ·  SQL
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 sm:px-8 pb-6">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate(user ? '/assessment/programming' : '/register')}
                >
                  Explore Programming Languages
                </Button>
              </div>
            </div>

            {/* Track 2: Technical Domains */}
            <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-[#0F172A] overflow-hidden">
                  {!domainImgError && (
                    <img
                      src={domainImg}
                      alt="Technical Domain Assessment visual"
                      referrerPolicy="no-referrer"
                      onError={() => setDomainImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1630] via-[#0B1630]/40 to-transparent" />
                  <div className="absolute bottom-3 left-6 text-xs font-mono tabular-nums text-slate-300">
                    60 Questions Total · 6 Domains · 10 Questions Each
                  </div>
                </div>
                <div className="p-6 sm:p-8 space-y-4">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                    Technical Domain Assessment
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Help you understand and explore major technology domains—what each field
                    involves, what real-world problems it solves, and which areas you find most
                    interesting to learn further.
                  </p>
                  <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-1.5">
                    <p className="text-slate-400 font-medium">Domains You Will Explore:</p>
                    <p className="text-white font-medium">
                      Data Analytics  ·  Data Science & AI  ·  Web Development  ·  Cybersecurity  ·  Cloud Computing  ·  Database Management
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 sm:px-8 pb-6">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate(user ? '/assessment/domain' : '/register')}
                >
                  Explore Technology Domains
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. METHODOLOGY & GUIDED DISCOVERY JOURNEY */}
      <section
        id="methodology"
        className="scroll-mt-16 border-t border-slate-800/80 py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-medium text-[#06B6D4] tracking-wide">
                02. How SkillQuest Works
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Built for exploration and skill discovery—not career prediction.
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Choosing a technology path just because of social media trends or peer
                pressure often leads to confusion. SkillQuest guides you through a 5-step
                discovery cycle across three progressive learning levels (Easy, Moderate, and Difficult).
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 space-y-2.5">
                <p className="font-mono text-xs font-semibold text-[#3B82F6]">
                  01. Easy Level
                </p>
                <h3 className="text-base font-semibold text-white">
                  Beginner Exploration
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Introduces what each programming language and tech domain is, what can be
                  built with it, and simple real-world use cases.
                </p>
              </div>

              <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 space-y-2.5">
                <p className="font-mono text-xs font-semibold text-[#8B5CF6]">
                  02. Moderate Level
                </p>
                <h3 className="text-base font-semibold text-white">
                  Developing Understanding
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Explores conceptual understanding, common tools/libraries, and how different
                  languages and domains work in practical situations.
                </p>
              </div>

              <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 space-y-2.5">
                <p className="font-mono text-xs font-semibold text-[#06B6D4]">
                  03. Difficult Level
                </p>
                <h3 className="text-base font-semibold text-white">
                  Application &amp; Scenario Reasoning
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connects deeper conceptual understanding and scenario-based reasoning to choose
                  appropriate technologies for real software projects.
                </p>
              </div>
            </div>
          </div>

          {/* 5-Step Student Journey Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {discoverySteps.map((item) => (
              <div
                key={item.step}
                className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-5 space-y-2"
              >
                <p className="font-mono text-xs font-semibold text-[#06B6D4]">
                  {item.step}
                </p>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PERFORMANCE SCALE SECTION */}
      <section
        id="scale"
        className="scroll-mt-16 border-t border-slate-800/80 bg-[#0B1630]/40 py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium text-[#3B82F6] tracking-wide">
              03. Familiarity & Exploration Scale
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Constructive feedback for every language and domain.
            </h2>
            <p className="text-sm text-slate-400">
              Each correct answer awards 1 mark. Your score reflects your current familiarity
              and awareness in each category to help you decide what to explore next:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 space-y-2">
              <p className="font-mono tabular-nums text-xl font-bold text-emerald-400">
                80–100%
              </p>
              <h3 className="text-base font-semibold text-white">Strong</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You already have strong familiarity with what this area involves and how it is
                used—great for trying hands-on mini-projects.
              </p>
            </div>

            <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 space-y-2">
              <p className="font-mono tabular-nums text-xl font-bold text-[#3B82F6]">
                60–79%
              </p>
              <h3 className="text-base font-semibold text-white">Good</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Good foundational awareness of core use cases and concepts, with room to
                explore practical examples further.
              </p>
            </div>

            <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 space-y-2">
              <p className="font-mono tabular-nums text-xl font-bold text-amber-400">
                40–59%
              </p>
              <h3 className="text-base font-semibold text-white">Developing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Growing familiarity with basic ideas; reviewing question explanations will
                help clarify what this technology does.
              </p>
            </div>

            <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 space-y-2">
              <p className="font-mono tabular-nums text-xl font-bold text-rose-400">
                0–39%
              </p>
              <h3 className="text-base font-semibold text-white">Needs Practice</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A brand-new or less-explored area for you—use our beginner-friendly guides to
                discover what it is all about!
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-[#0B1630] border border-slate-800/90 p-6">
            <div className="flex items-start gap-3">
              <Compass className="w-5 h-5 text-[#06B6D4] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">
                  Ready to explore programming languages and technology domains?
                </p>
                <p className="text-xs text-slate-400">
                  Create your student profile, choose your learning level (Easy, Moderate, or Difficult), and
                  start discovering what interests you.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate(user ? '/dashboard' : '/register')}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
