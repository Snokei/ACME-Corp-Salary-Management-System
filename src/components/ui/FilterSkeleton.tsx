import React from 'react';

interface FilterSkeletonProps {
  showSearch?: boolean;
  dropdownCount?: number;
  showTabs?: boolean;
}

export function FilterSkeleton({ 
  showSearch = true, 
  dropdownCount = 3, 
  showTabs = true 
}: FilterSkeletonProps = {}) {
  return (
    <div className="relative z-20 p-4 rounded-2xl bg-white/50 dark:bg-stone-900/50 border border-stone-200/50 dark:border-stone-800/50 shadow-sm backdrop-blur-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 animate-pulse">
      {/* Left side: Search field */}
      {showSearch && (
        <div className="flex-1 max-w-md flex items-center gap-2">
          <div className="h-10 w-full rounded-full bg-stone-200/50 dark:bg-stone-800/50" />
          <div className="h-10 w-24 rounded-full bg-stone-200/50 dark:bg-stone-800/50 shrink-0" />
        </div>
      )}

      {/* Right side: Dropdowns, Status tabs */}
      <div className={`flex items-center gap-2.5 flex-wrap shrink-0 ${!showSearch ? 'w-full' : ''}`}>
        {Array.from({ length: dropdownCount }).map((_, i) => (
          <div key={i} className="h-10 w-32 rounded-full bg-stone-200/50 dark:bg-stone-800/50" />
        ))}

        {/* Status Tabs */}
        {showTabs && (
          <div className="inline-flex p-1 rounded-full bg-stone-100/50 dark:bg-stone-800/50 border border-stone-200/30 dark:border-stone-700/30">
            <div className="h-7 w-16 rounded-full bg-stone-200/80 dark:bg-stone-700/80 mx-0.5" />
            <div className="h-7 w-16 rounded-full bg-stone-200/30 dark:bg-stone-700/30 mx-0.5" />
            <div className="h-7 w-16 rounded-full bg-stone-200/30 dark:bg-stone-700/30 mx-0.5" />
            <div className="h-7 w-16 rounded-full bg-stone-200/30 dark:bg-stone-700/30 mx-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}
