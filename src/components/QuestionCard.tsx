import React from 'react';
import { ClientQuestion } from '../services/api.ts';
import { OptionKey } from '../utils/validation.ts';
import { OptionButton } from './OptionButton.tsx';

interface QuestionCardProps {
  question: ClientQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedOption?: OptionKey;
  onSelectOption: (option: OptionKey) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
}) => {
  const options: { key: OptionKey; text: string }[] = [
    { key: 'A', text: question.optionA },
    { key: 'B', text: question.optionB },
    { key: 'C', text: question.optionC },
    { key: 'D', text: question.optionD },
  ];

  return (
    <div className="rounded-xl bg-[#0B1630] border border-slate-800/90 p-6 sm:p-8 space-y-6">
      {/* Unboxed metadata header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#06B6D4] font-semibold">{question.category}</span>
          <span aria-hidden="true">·</span>
          <span>{question.academicYear} Level</span>
        </div>
        <span className="font-mono tabular-nums text-slate-300">
          Item {String(questionIndex + 1).padStart(2, '0')} / {totalQuestions}
        </span>
      </div>

      {/* Question stem */}
      <h2 className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
        {question.questionText}
      </h2>

      {/* 4 options */}
      <div className="space-y-3 pt-1" role="radiogroup" aria-label="Answer options">
        {options.map((opt) => (
          <OptionButton
            key={opt.key}
            optionKey={opt.key}
            optionText={opt.text}
            selected={selectedOption === opt.key}
            onSelect={onSelectOption}
          />
        ))}
      </div>
    </div>
  );
};
