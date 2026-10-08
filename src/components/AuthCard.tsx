import React from 'react';
import { Link } from 'react-router-dom';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[540px] h-[320px] rounded-full bg-[#3B82F6]/10 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 w-[420px] h-[260px] rounded-full bg-[#8B5CF6]/10 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#3B82F6] tracking-wide">
            SkillQuest Student Portal
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">{subtitle}</p>
        </div>

        {children}

        <div className="pt-4 border-t border-slate-800/80 text-center text-sm text-slate-400">
          {footerText}{' '}
          <Link
            to={footerLinkTo}
            className="font-semibold text-[#3B82F6] hover:text-blue-400 transition-colors"
          >
            {footerLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
};
