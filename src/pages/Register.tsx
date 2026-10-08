import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard.tsx';
import { Button } from '../components/Button.tsx';
import { ErrorMessage } from '../components/ErrorMessage.tsx';
import {
  GoogleLogoSvg,
  GoogleSignInModal,
} from '../components/GoogleSignInModal.tsx';
import { Input } from '../components/Input.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { AcademicYear } from '../utils/validation.ts';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { registerWithEmail, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('Easy');
  const [division, setDivision] = useState('A');
  const [college, setCollege] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }
    if (!division.trim()) {
      setError('Please enter your section or group (e.g., A, B, Self-Learner).');
      return;
    }
    if (college.trim().length < 2) {
      setError('Please enter your school, college, or institution name.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        academicYear,
        division: division.trim(),
        college: college.trim(),
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConfirm = async (payload: {
    email: string;
    fullName: string;
  }) => {
    setError('');
    setGoogleLoading(true);
    try {
      const existingProfile = await signInWithGoogle(payload);
      setGoogleModalOpen(false);
      if (existingProfile && existingProfile.academicYear) {
        navigate('/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err?.message || 'Google sign-up failed. Please try again.');
      setGoogleModalOpen(false);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <AuthCard
        title="Create Student Account"
        subtitle="Register to explore programming languages and technology domains at your preferred learning level."
        footerText="Already have a SkillQuest account?"
        footerLinkText="Sign In"
        footerLinkTo="/login"
      >
        <ErrorMessage message={error} />

        <div className="space-y-4">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={loading}
            onClick={() => setGoogleModalOpen(true)}
          >
            <GoogleLogoSvg className="w-4 h-4" />
            <span>Continue with Google</span>
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0B1630] px-3 text-xs text-slate-500 whitespace-nowrap">
              or register with email
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g., Aarav Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label
                  htmlFor="register-learning-level"
                  className="block text-sm font-medium text-slate-200 tracking-wide"
                >
                  Learning Level
                </label>
                <select
                  id="register-learning-level"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value as AcademicYear)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg bg-[#07111F] border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/25"
                >
                  <option value="Easy">Easy (Beginner Exploration)</option>
                  <option value="Moderate">Moderate (Developing Understanding)</option>
                  <option value="Difficult">Difficult (Deeper Application)</option>
                </select>
              </div>

              <Input
                label="Section / Group"
                type="text"
                placeholder="e.g., A"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                required
              />
            </div>

            <Input
              label="Institution / School / College"
              type="text"
              placeholder="e.g., Institute of Technology"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={googleLoading}
            >
              Create Student Account
            </Button>
          </form>
        </div>
      </AuthCard>

      <GoogleSignInModal
        isOpen={googleModalOpen}
        loading={googleLoading}
        onClose={() => setGoogleModalOpen(false)}
        onConfirm={handleGoogleConfirm}
      />
    </>
  );
};
