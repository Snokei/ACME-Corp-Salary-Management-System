import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export type SelectShape = 'pill' | 'rounded';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  shape?: SelectShape;
  size?: SelectSize;
  containerClassName?: string;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: 'py-1.5 pl-3 pr-8 text-xs',
  md: 'py-2 pl-3.5 pr-8 text-xs',
  lg: 'py-2.5 pl-4 pr-9 text-sm',
};

const shapeStyles: Record<SelectShape, string> = {
  pill: 'rounded-full',
  rounded: 'rounded-xl',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      children,
      label,
      error,
      shape = 'rounded',
      size = 'md',
      className = '',
      containerClassName = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1"
          >
            {label}
            {props.required && <span className="text-amber-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full appearance-none ${shapeStyles[shape]} ${sizeStyles[size]} bg-white/90 dark:bg-stone-800/90 border ${
              error
                ? 'border-red-500 focus:ring-red-400/40'
                : 'border-stone-200/80 dark:border-stone-700/80 focus:ring-amber-400/50'
            } text-stone-800 dark:text-stone-100 outline-none focus:ring-2 shadow-xs cursor-pointer transition-all duration-150 ${
              disabled ? 'opacity-50 cursor-not-allowed bg-stone-100 dark:bg-stone-900' : ''
            } ${className}`}
            {...props}
          >
            {children}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
        </div>

        {error && <p className="mt-1 text-[10px] text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
