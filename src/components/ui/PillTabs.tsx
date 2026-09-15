'use client';

import React from 'react';

export interface PillTabOption<T extends string = string> {
  id: T;
  label: React.ReactNode;
}

interface PillTabsProps<T extends string = string> {
  options: readonly T[] | readonly PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'default' | 'amber';
  className?: string;
  size?: 'sm' | 'md';
}

export function PillTabs<T extends string = string>({
  options,
  value,
  onChange,
  variant = 'default',
  className = '',
  size = 'md',
}: PillTabsProps<T>) {
  const isAmber = variant === 'amber';
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs';

  return (
    <div
      className={`flex items-center gap-1.5 p-1 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-md ${className}`}
    >
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id;
        const label = typeof opt === 'string' ? opt : opt.label;
        const isActive = value === id;

        let activeClasses = 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs font-semibold';
        if (isAmber) {
          activeClasses = 'bg-amber-400 text-stone-950 font-bold shadow-xs';
        }

        const inactiveClasses =
          'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100/60 dark:hover:bg-stone-800/60';

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id as T)}
            className={`rounded-full font-medium transition-all duration-150 ${sizeClasses} ${
              isActive ? activeClasses : inactiveClasses
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
