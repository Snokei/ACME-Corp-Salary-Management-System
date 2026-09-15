'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showButton?: boolean;
  buttonLabel?: string;
  kbdShortcut?: string;
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  className = '',
  inputClassName = '',
  showButton = false,
  buttonLabel = 'Search',
  kbdShortcut,
}: SearchInputProps) {
  const content = (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2 rounded-full bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400/50 shadow-sm transition-all ${inputClassName}`}
      />
      {kbdShortcut && (
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-400 pointer-events-none">
          {kbdShortcut}
        </kbd>
      )}
    </div>
  );

  if (onSubmit || showButton) {
    return (
      <form onSubmit={onSubmit} className="flex items-center gap-2 flex-1 min-w-[280px]">
        {content}
        {showButton && (
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-stone-900 text-white dark:bg-white dark:text-stone-900 text-xs font-medium shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {buttonLabel}
          </button>
        )}
      </form>
    );
  }

  return content;
}
