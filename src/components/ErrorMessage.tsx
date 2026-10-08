import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  actionButton?: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  actionButton,
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="w-full rounded-lg bg-red-950/40 border border-red-500/40 px-4 py-3.5 text-sm text-red-200 flex flex-col gap-2.5"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{message}</span>
      </div>
      {(onRetry || actionButton) && (
        <div className="flex items-center gap-3 pl-6">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-semibold text-red-300 underline hover:text-white cursor-pointer"
            >
              Try Again
            </button>
          )}
          {actionButton}
        </div>
      )}
    </div>
  );
};
