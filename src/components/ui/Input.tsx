import React, { forwardRef } from 'react';

export type InputShape = 'pill' | 'rounded';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  shape?: InputShape;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const sizeStyles: Record<InputSize, { input: string; icon: string }> = {
  sm: { input: 'py-1.5 text-xs', icon: 'w-3.5 h-3.5' },
  md: { input: 'py-2 text-xs', icon: 'w-4 h-4' },
  lg: { input: 'py-2.5 text-sm', icon: 'w-4.5 h-4.5' },
};

const shapeStyles: Record<InputShape, string> = {
  pill: 'rounded-full',
  rounded: 'rounded-xl',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      shape = 'rounded',
      size = 'md',
      leftIcon,
      rightIcon,
      className = '',
      containerClassName = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1"
          >
            {label}
            {props.required && <span className="text-amber-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full ${shapeStyles[shape]} ${sizeStyles[size].input} ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} bg-white/90 dark:bg-stone-800/90 border ${
              error
                ? 'border-red-500 focus:ring-red-400/40'
                : 'border-stone-200/80 dark:border-stone-700/80 focus:ring-amber-400/50'
            } text-stone-800 dark:text-stone-100 placeholder:text-stone-400 outline-none focus:ring-2 shadow-xs transition-all duration-150 ${
              disabled ? 'opacity-50 cursor-not-allowed bg-stone-100 dark:bg-stone-900' : ''
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-1 text-[10px] text-red-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-[10px] text-stone-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
