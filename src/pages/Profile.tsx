import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Compass,
  GraduationCap,
  LogOut,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '../components/Button.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { AcademicYear, normalizeLearningLevel } from '../utils/validation.ts';

const LEARNING_LEVEL_OPTIONS: { value: AcademicYear; label: string; desc: string }[] = [
  {
    value: 'Easy',
    label: 'Easy — Beginner Exploration',
    desc: 'Basic awareness, everyday analogies, and simple real-world use cases for each programming language and technology domain.',
  },
  {
    value: 'Moderate',
    label: 'Moderate — Developing Understanding',
    desc: 'Conceptual understanding, common tools/libraries, and how languages, databases, APIs, cloud platforms, and security work in practical situations.',
  },
  {
    value: 'Difficult',
    label: 'Difficult — Deeper Conceptual & Application Understanding',
    desc: 'Scenario-based reasoning and choosing appropriate technologies for real-world software projects without requiring advanced university exams.',
  },
];

export const Profile: React.FC = () => {
  const { user, profile, isProfileComplete, saveProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(
    profile?.fullName || user?.fullName || ''
  );
  const [academicYear, setAcademicYear] = useState<AcademicYear>(
    normalizeLearningLevel(profile?.academicYear)
  );
  const [division, setDivision] = useState(profile?.division || '');
  const [college, setCollege] = useState(profile?.college || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const wasIncomplete = !isProfileComplete;
      await saveProfile({
        fullName,
        email: profile?.email || user?.email || '',
        academicYear,
        division,
        college,
      });

      setSuccess(
        'Student profile updated! Future exploration assessments will use your selected learning level.'
      );

      if (wasIncomplete) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-[#06B6D4] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          Student Settings
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
          Student Profile &amp; Learning Level
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Choose your preferred learning level (Easy, Moderate, or Difficult) to calibrate the questions and real-world scenarios in your Programming Language and Technical Domain assessments.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-800/90 bg-[#0B1630] p-6 sm:p-8 space-y-6 shadow-xl"
      >
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#07111F] pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Registered Email (Read-only)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={profile?.email || user?.email || ''}
                className="w-full rounded-xl border border-slate-800/60 bg-[#07111F]/50 pl-10 pr-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Institution / School / College
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Institute of Technology"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#07111F] pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Section / Group
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. A"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-[#07111F] pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-[#3B82F6]" />
            Select Learning Level (Easy, Moderate, or Difficult)
          </label>
          <div className="grid grid-cols-1 gap-3">
            {LEARNING_LEVEL_OPTIONS.map((item) => {
              const active = academicYear === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setAcademicYear(item.value)}
                  className={`w-full text-left rounded-xl border p-4 transition-all flex items-start justify-between gap-4 cursor-pointer ${
                    active
                      ? 'border-[#3B82F6] bg-[#2563EB]/10'
                      : 'border-slate-800 bg-[#07111F] hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {item.label}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-mono font-semibold shrink-0 ${
                      active
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#0B1630] text-slate-400 border border-slate-800'
                    }`}
                  >
                    {item.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
          {isProfileComplete ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          ) : (
            <span className="text-xs text-slate-400">
              Complete your profile to unlock exploration assessments
            </span>
          )}

          <Button type="submit" variant="primary" loading={saving}>
            <span>Save Profile Changes</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Account Session / Logout Section at Bottom of Profile Page */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#0B1630] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-white">Account Session</h2>
          <p className="text-xs text-slate-400">
            Signed in as{' '}
            <span className="text-slate-200 font-mono">
              {profile?.email || user?.email}
            </span>
            . You can sign out of your SkillQuest account anytime.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};
