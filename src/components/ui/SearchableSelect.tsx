'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

export interface SearchableSelectProps {
  name: string;
  options: string[];
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  label?: string;
  className?: string;
  containerClassName?: string;
  shape?: 'pill' | 'rounded';
  onChange?: (value: string) => void;
}

export function SearchableSelect({
  name,
  options,
  defaultValue = 'All',
  value,
  placeholder = 'Select...',
  label,
  className = '',
  containerClassName = '',
  shape = 'pill',
  onChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [internalValue, setInternalValue] = useState(value !== undefined ? value : defaultValue);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal value if controlled value or defaultValue changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    } else {
      setInternalValue(defaultValue);
    }
  }, [value, defaultValue]);

  const activeValue = value !== undefined ? value : internalValue;

  // Derive the display value
  const displayValue = isOpen ? search : (activeValue === 'All' ? placeholder : activeValue);

  // Compute dropdown position from the trigger's bounding rect
  const openDropdown = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 180),
        zIndex: 9999,
      });
    }
    setIsOpen(true);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    const reposition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 6,
          left: rect.left,
          width: Math.max(rect.width, 180),
          zIndex: 9999,
        });
      }
    };
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: string) => {
    if (value === undefined) {
      setInternalValue(option);
    }
    setSearch('');
    setIsOpen(false);
    if (onChange) {
      setTimeout(() => onChange(option), 0);
    }
  };

  const shapeClass = shape === 'pill' ? 'rounded-full' : 'rounded-xl';

  const dropdownEl = isOpen && mounted ? createPortal(
    <div
      style={dropdownStyle}
      className="py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in"
    >
      {filteredOptions.length === 0 ? (
        <div className="px-3 py-2 text-xs text-stone-500 text-center">
          No results found
        </div>
      ) : (
        <ul className="flex flex-col">
          {filteredOptions.map((option) => (
            <li
              key={option}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option)}
              className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                activeValue === option
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-100 font-medium'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {option === 'All' ? placeholder : option}
            </li>
          ))}
        </ul>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div ref={containerRef} className={`relative min-w-[140px] ${containerClassName}`}>
      {label && (
        <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
          {label}
        </label>
      )}
      {/* Hidden input for native form submission */}
      <input type="hidden" name={name} value={activeValue} />

      <div
        className="relative cursor-text"
        onClick={openDropdown}
      >
        <input
          ref={inputRef}
          type="text"
          className={`w-full py-2 pl-3 pr-8 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors ${shapeClass} ${className}`}
          placeholder={activeValue === 'All' ? placeholder : activeValue}
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) openDropdown();
          }}
          onFocus={openDropdown}
          onBlur={() => {
            // Delay close to allow click on option to fire first
            setTimeout(() => {
              setIsOpen(false);
              setSearch('');
            }, 150);
          }}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
          {isOpen ? <Search className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {dropdownEl}
    </div>
  );
}
