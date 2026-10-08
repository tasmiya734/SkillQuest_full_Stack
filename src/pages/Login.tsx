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

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const existingProfile = await loginWithEmail(email, password);
      if (existingProfile && existingProfile.academicYear) {
        navigate('/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
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
      setError(err?.message || 'Google sign-in failed. Please try again.');
      setGoogleModalOpen(false);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <AuthCard
        title="Welcome Back"
        subtitle="Sign in to access your SkillQuest assessments, games, and progress history."
        footerText="Don't have a student account yet?"
        footerLinkText="Create Account"
        footerLinkTo="/register"
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
              or sign in with email
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={googleLoading}
            >
              Sign In
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
