'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean, e: React.MouseEvent) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  className = '',
  size = 'sm',
}: CheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onChange) {
      onChange(!checked, e);
    }
  };

  const sizeClasses =
    size === 'sm' ? 'w-4 h-4 rounded-md' : 'w-5 h-5 rounded-md';
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex items-center justify-center transition-all duration-150 border cursor-pointer select-none ${sizeClasses} ${
        checked
          ? 'bg-amber-400 border-amber-400 text-stone-900 shadow-xs'
          : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 hover:border-amber-400 dark:hover:border-amber-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${className}`}
    >
      {checked && (
        <Check className={`${iconSize} stroke-[3] text-stone-950 animate-fade-in`} />
      )}
    </button>
  );
}
