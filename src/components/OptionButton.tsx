import React from 'react';
import { OptionKey } from '../utils/validation.ts';

interface OptionButtonProps {
  optionKey: OptionKey;
  optionText: string;
  selected: boolean;
  onSelect: (key: OptionKey) => void;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  optionKey,
  optionText,
  selected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(optionKey)}
      aria-pressed={selected}
      className={`w-full text-left p-4 min-h-[56px] rounded-lg border transition-all duration-150 flex items-start gap-3.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
        selected
          ? 'bg-[#2563EB]/15 border-[#3B82F6] text-white'
          : 'bg-[#07111F] border-slate-800/90 text-slate-200 hover:border-slate-600 hover:bg-[#0F172A]'
      }`}
    >
      <span
        className={`w-7 h-7 rounded-md font-mono text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
          selected
            ? 'bg-[#3B82F6] text-white'
            : 'bg-slate-800/90 text-slate-300'
        }`}
      >
        {optionKey}
      </span>
      <span className="text-sm sm:text-base leading-relaxed">{optionText}</span>
    </button>
  );
};
