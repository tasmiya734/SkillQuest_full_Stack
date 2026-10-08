import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111F] whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]';

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-[#2563EB] hover:bg-[#3B82F6] text-white shadow-sm shadow-[#2563EB]/25 border border-[#3B82F6]/40',
    secondary:
      'bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-slate-700/80',
    outline:
      'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-500',
    ghost:
      'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white',
    danger:
      'bg-red-600/90 hover:bg-red-500 text-white border border-red-400/30',
  };

  const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-3.5 py-2 text-xs min-h-[38px]',
    md: 'px-5 py-2.5 text-sm min-h-[42px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};
