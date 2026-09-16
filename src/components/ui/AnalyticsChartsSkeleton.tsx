import React from 'react';

export function AnalyticsChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      {/* Salary Distribution Skeleton (col-span-2) */}
      <div className="p-5 rounded-2xl lg:col-span-2 border border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-900/50 flex flex-col justify-between min-h-[400px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="w-48 h-5 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="w-64 h-3 bg-stone-200 dark:bg-stone-800 rounded-md" />
            </div>
          </div>
          
          <div className="h-64 w-full flex items-end justify-between gap-4 pt-10">
            {[40, 60, 80, 50, 30].map((h, i) => (
              <div key={i} className="w-full bg-stone-200/70 dark:bg-stone-800/70 rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Bucket summary badges skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/60">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-2 rounded-xl bg-stone-100/50 dark:bg-stone-800/40 h-[56px] flex flex-col items-center justify-center space-y-1.5">
              <div className="w-12 h-2 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="w-8 h-3 bg-stone-200 dark:bg-stone-800 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Salary Band Positioning Skeleton (col-span-1) */}
      <div className="p-5 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-900/50 flex flex-col justify-between min-h-[400px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-2">
              <div className="w-40 h-5 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="w-56 h-3 bg-stone-200 dark:bg-stone-800 rounded-md" />
            </div>
            <div className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-stone-800" />
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {/* Donut chart skeleton */}
            <div className="w-32 h-32 rounded-full border-[16px] border-stone-200/70 dark:border-stone-800/70" />
          </div>
        </div>

        {/* Band Legend Stats Skeleton */}
        <div className="space-y-3 mt-2 pt-4 border-t border-stone-100 dark:border-stone-800/60">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-200 dark:bg-stone-800" />
                <div className="w-20 h-3 bg-stone-200 dark:bg-stone-800 rounded-md" />
              </div>
              <div className="w-16 h-3 bg-stone-200 dark:bg-stone-800 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
