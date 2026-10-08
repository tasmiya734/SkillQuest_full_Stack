import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading SkillQuest...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="w-9 h-9 rounded-full border-2 border-slate-700 border-t-[#3B82F6] animate-spin" />
      {label && <p className="text-sm text-slate-400 font-medium">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#07111F] flex items-center justify-center px-4">
        {content}
      </div>
    );
  }

  return content;
};
