import React from 'react';

export function TableSkeleton() {
  return (
    <div className="w-full rounded-3xl border border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm overflow-hidden animate-pulse shadow-sm">
      {/* Table Header Skeleton */}
      <div className="flex items-center border-b border-stone-100 dark:border-stone-800/50 px-6 py-4 bg-stone-50/50 dark:bg-stone-900/80">
        <div className="w-5 h-5 rounded bg-stone-200 dark:bg-stone-800 mr-4 shrink-0" /> {/* Checkbox */}
        <div className="w-32 h-4 rounded-md bg-stone-200 dark:bg-stone-800 mr-auto" /> {/* Name Col */}
        <div className="w-24 h-4 rounded-md bg-stone-200 dark:bg-stone-800 hidden md:block mx-4" /> {/* Title Col */}
        <div className="w-20 h-4 rounded-md bg-stone-200 dark:bg-stone-800 hidden lg:block mx-4" /> {/* Dept Col */}
        <div className="w-24 h-4 rounded-md bg-stone-200 dark:bg-stone-800 hidden xl:block mx-4" /> {/* Loc Col */}
        <div className="w-20 h-4 rounded-md bg-stone-200 dark:bg-stone-800 mx-4" /> {/* Salary Col */}
        <div className="w-24 h-4 rounded-md bg-stone-200 dark:bg-stone-800 mx-4 hidden sm:block" /> {/* Date Joined Col */}
        <div className="w-16 h-4 rounded-md bg-stone-200 dark:bg-stone-800 mx-4" /> {/* Status Col */}
        <div className="w-16 h-4 rounded-md bg-stone-200 dark:bg-stone-800 ml-4" /> {/* Actions Col */}
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center px-6 py-4">
            <div className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 mr-4 shrink-0" /> {/* Checkbox */}
            
            {/* Avatar & Name */}
            <div className="flex items-center gap-3 mr-auto w-48 shrink-0">
              <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-800 shrink-0" />
              <div className="space-y-2 w-full">
                <div className="w-3/4 h-3.5 rounded bg-stone-200 dark:bg-stone-800" />
                <div className="w-1/2 h-3 rounded bg-stone-100 dark:bg-stone-800/70" />
              </div>
            </div>

            {/* Job Title */}
            <div className="w-32 hidden md:block mx-4 shrink-0">
              <div className="w-full h-3.5 rounded bg-stone-100 dark:bg-stone-800" />
            </div>

            {/* Department */}
            <div className="w-24 hidden lg:block mx-4 shrink-0">
              <div className="w-16 h-6 rounded-full bg-stone-100 dark:bg-stone-800" />
            </div>

            {/* Location */}
            <div className="w-24 hidden xl:block mx-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-stone-100 dark:bg-stone-800" />
                <div className="w-16 h-3 rounded bg-stone-100 dark:bg-stone-800" />
              </div>
            </div>

            {/* Salary */}
            <div className="w-24 mx-4 shrink-0">
              <div className="w-20 h-3.5 rounded bg-stone-100 dark:bg-stone-800" />
            </div>

            {/* Date Joined */}
            <div className="w-24 mx-4 shrink-0 hidden sm:block">
              <div className="w-20 h-3.5 rounded bg-stone-100 dark:bg-stone-800" />
            </div>

            {/* Status */}
            <div className="w-20 mx-4 shrink-0 flex justify-center">
              <div className="w-16 h-6 rounded-full bg-stone-200 dark:bg-stone-800" />
            </div>

            {/* Actions */}
            <div className="w-16 ml-4 shrink-0 flex items-center justify-end gap-2">
              <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800" />
              <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800/50 px-6 py-4 bg-stone-50/50 dark:bg-stone-900/80">
        <div className="w-32 h-4 rounded bg-stone-200 dark:bg-stone-800" />
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>
    </div>
  );
}
