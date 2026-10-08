import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-200 tracking-wide"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 min-h-[44px] rounded-lg bg-[#07111F] border ${
          error
            ? 'border-red-500/80 focus:border-red-400 focus:ring-red-500/30'
            : 'border-slate-800 focus:border-[#3B82F6] focus:ring-[#3B82F6]/25'
        } text-slate-100 placeholder-slate-500 text-sm transition-colors focus:outline-none focus:ring-2 ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};
