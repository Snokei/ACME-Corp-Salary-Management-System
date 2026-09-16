import React from 'react';

interface MetricsSkeletonProps {
  count?: number;
}

export function MetricsSkeleton({ count = 4 }: MetricsSkeletonProps) {
  const getGridClass = (c: number) => {
    switch(c) {
      case 4: return 'lg:grid-cols-4';
      case 5: return 'lg:grid-cols-5';
      case 6: return 'lg:grid-cols-6';
      default: return 'lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${getGridClass(count)} gap-4 w-full animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl flex flex-col justify-between border border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-900/50 h-[104px]">
          <div className="flex items-center justify-between">
            <div className="w-24 h-3 bg-stone-200 dark:bg-stone-800 rounded-md" />
            <div className="w-8 h-8 rounded-xl bg-stone-200 dark:bg-stone-800" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="w-32 h-6 bg-stone-200 dark:bg-stone-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
