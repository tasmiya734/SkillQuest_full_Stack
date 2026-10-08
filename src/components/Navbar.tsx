import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';
import { Button } from './Button.tsx';

export const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    const existingEl = document.getElementById(sectionId);
    if (
      existingEl &&
      (location.pathname === '/' || location.pathname === '/dashboard')
    ) {
      existingEl.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(
        null,
        '',
        `${location.pathname}#${sectionId}`
      );
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-[#07111F]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-white hover:text-[#3B82F6] transition-colors whitespace-nowrap shrink-0"
        >
          SkillQuest
        </Link>

        {/* Zone 2: Clean, Uncluttered Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          {user && (
            <Link
              to="/dashboard"
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                isActive('/dashboard') && !location.hash
                  ? 'text-white border-[#3B82F6]'
                  : 'border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/assessment"
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              isActive('/assessment')
                ? 'text-white border-[#3B82F6]'
                : 'border-transparent hover:text-white hover:border-slate-600'
            }`}
          >
            Assessment
          </Link>

          <a
            href="/#methodology"
            onClick={(e) => handleSectionClick(e, 'methodology')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              location.hash === '#methodology'
                ? 'text-white border-[#3B82F6]'
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            How It Works
          </a>

          <a
            href="/#scale"
            onClick={(e) => handleSectionClick(e, 'scale')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              location.hash === '#scale'
                ? 'text-white border-[#3B82F6]'
                : 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            Performance Scale
          </a>

          <Link
            to="/games"
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              isActive('/games')
                ? 'text-white border-[#3B82F6]'
                : 'border-transparent hover:text-white hover:border-slate-600'
            }`}
          >
            Skill Games
          </Link>

          {user && (
            <Link
              to="/history"
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                isActive('/history')
                  ? 'text-white border-[#3B82F6]'
                  : 'border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              History
            </Link>
          )}
        </nav>

        {/* Zone 3: Far-Right Corner Profile Icon / Auth Actions */}
        <div className="flex items-center justify-end gap-2.5 shrink-0">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="md:hidden text-xs font-medium text-slate-300 hover:text-white px-2 py-1.5 whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                to="/assessment"
                className="md:hidden text-xs font-medium text-slate-300 hover:text-white px-2 py-1.5 whitespace-nowrap"
              >
                Assessment
              </Link>
              <Link
                to="/games"
                className="md:hidden text-xs font-medium text-slate-300 hover:text-white px-2 py-1.5 whitespace-nowrap"
              >
                Games
              </Link>
              <Link
                to="/history"
                className="md:hidden text-xs font-medium text-slate-300 hover:text-white px-2 py-1.5 whitespace-nowrap"
              >
                History
              </Link>

              {/* Profile Logo Positioned in the Far-Right Corner */}
              <Link
                to="/profile"
                title={`Student Profile (${profile?.fullName || user.fullName})`}
                aria-label="Student Profile"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                  isActive('/profile')
                    ? 'bg-[#2563EB] border-[#3B82F6] text-white shadow-sm shadow-blue-950'
                    : 'bg-[#0B1630] border-slate-700/90 text-slate-300 hover:text-white hover:border-[#3B82F6]'
                }`}
              >
                <User className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium px-3 py-2 transition-colors whitespace-nowrap ${
                  location.pathname === '/login'
                    ? 'text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign In
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
