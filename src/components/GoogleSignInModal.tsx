import React, { useEffect, useState } from 'react';
import { CheckCircle2, UserCheck, X } from 'lucide-react';
import { Button } from './Button.tsx';
import { Input } from './Input.tsx';

interface GoogleSignInModalProps {
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { email: string; fullName: string }) => void;
}

interface SavedGoogleAccount {
  email: string;
  fullName: string;
}

const SAVED_GOOGLE_ACCOUNTS_KEY = 'skillquest_saved_google_accounts_v1';

function loadSavedGoogleAccounts(): SavedGoogleAccount[] {
  try {
    const raw = localStorage.getItem(SAVED_GOOGLE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return [];
}

function saveGoogleAccountToHistory(account: SavedGoogleAccount) {
  try {
    const current = loadSavedGoogleAccounts().filter(
      (a) => a.email.toLowerCase() !== account.email.toLowerCase()
    );
    current.unshift(account);
    localStorage.setItem(
      SAVED_GOOGLE_ACCOUNTS_KEY,
      JSON.stringify(current.slice(0, 4))
    );
  } catch {
    // Ignore storage errors
  }
}

export const GoogleLogoSvg: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const [savedAccounts, setSavedAccounts] = useState<SavedGoogleAccount[]>([]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSavedAccounts(loadSavedGoogleAccounts());
      setLocalError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerGoogleLogin = (targetEmail: string, targetName: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLocalError('Please enter a valid Google email address.');
      return;
    }
    const resolvedName =
      targetName.trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

    saveGoogleAccountToHistory({ email: cleanEmail, fullName: resolvedName });
    onConfirm({ email: cleanEmail, fullName: resolvedName });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    triggerGoogleLogin(email, fullName);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07111F]/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-signin-modal-title"
    >
      <div className="w-full max-w-md rounded-xl bg-[#0B1630] border border-slate-700/80 shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#07111F] border border-slate-800 flex items-center justify-center shrink-0">
              <GoogleLogoSvg className="w-4 h-4" />
            </div>
            <div>
              <h3
                id="google-signin-modal-title"
                className="font-display text-lg font-bold text-white"
              >
                Continue with Google
              </h3>
              <p className="text-xs text-slate-400">
                Sign in to SkillQuest with your Google account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Google sign-in modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {localError && (
          <div className="rounded-lg bg-rose-950/40 border border-rose-500/40 px-3.5 py-2.5 text-xs text-rose-200">
            {localError}
          </div>
        )}

        {savedAccounts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">
              Choose a saved Google account
            </p>
            <div className="space-y-2">
              {savedAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => triggerGoogleLogin(acc.email, acc.fullName)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-[#07111F] border border-slate-800 hover:border-[#3B82F6] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] font-display font-bold text-xs flex items-center justify-center shrink-0">
                      {acc.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {acc.fullName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {acc.email}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0" />
                </button>
              ))}
            </div>
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#0B1630] px-2.5 text-[11px] text-slate-500 whitespace-nowrap">
                or use another Google account
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Google Email Address"
            type="email"
            placeholder="yourname@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Full Name"
            type="text"
            placeholder="e.g., Aarav Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                triggerGoogleLogin('student.cs@gmail.com', 'CS Student')
              }
              className="inline-flex items-center gap-1.5 text-xs text-[#06B6D4] hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Quick Demo Google Sign-In</span>
            </button>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={loading}
              >
                <GoogleLogoSvg className="w-3.5 h-3.5" />
                <span>Continue</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
