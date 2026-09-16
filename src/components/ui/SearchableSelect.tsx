'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface SearchableSelectProps {
  name: string;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  shape?: 'pill' | 'rounded';
  onChange?: (value: string) => void;
}

export function SearchableSelect({
  name,
  options,
  defaultValue = 'All',
  placeholder = 'Select...',
  className = '',
  containerClassName = '',
  shape = 'pill',
  onChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [value, setValue] = useState(defaultValue);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal value if defaultValue changes (e.g. form reset)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // Derive the display value
  const displayValue = isOpen ? search : (value === 'All' ? placeholder : value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch(''); // Reset search when closing
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: string) => {
    setValue(option);
    setSearch('');
    setIsOpen(false);
    if (onChange) {
      // Use setTimeout to allow React to flush the updated value to the hidden input before form submission
      setTimeout(() => onChange(option), 0);
    }
  };

  const shapeClass = shape === 'pill' ? 'rounded-full' : 'rounded-xl';

  return (
    <div ref={containerRef} className={`relative min-w-[140px] ${isOpen ? 'z-40' : 'z-10'} ${containerClassName}`}>
      {/* Hidden input for native form submission */}
      <input type="hidden" name={name} value={value} />
      
      <div 
        className="relative cursor-text"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className={`w-full py-2 pl-3 pr-8 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors ${shapeClass} ${className}`}
          placeholder={value === 'All' ? placeholder : value}
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
          {isOpen ? <Search className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-1.5 py-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto animate-fade-in">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-stone-500 text-center">
              No results found
            </div>
          ) : (
            <ul className="flex flex-col">
              {filteredOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                    value === option
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-100 font-medium'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {option === 'All' ? placeholder : option}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
