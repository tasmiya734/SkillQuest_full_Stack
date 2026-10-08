import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  hideFooter = false,
}) => {
  return (
    <div className="min-h-screen bg-[#07111F] text-[#F8FAFC] flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {!hideFooter && (
        <footer className="border-t border-slate-800/80 bg-[#07111F] py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-slate-200">
                SkillQuest
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Technology Exploration &amp; Skill Discovery Platform (Easy · Moderate · Difficult)
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link to="/#tracks" className="hover:text-white transition-colors">
                Assessment Tracks
              </Link>
              <Link
                to="/#methodology"
                className="hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link to="/#scale" className="hover:text-white transition-colors">
                Performance Scale
              </Link>
              <Link
                to="/dashboard"
                className="hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link to="/games" className="hover:text-white transition-colors">
                Skill Games
              </Link>
              <Link to="/history" className="hover:text-white transition-colors">
                History
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
