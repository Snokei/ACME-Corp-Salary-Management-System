import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  rounded?: '2xl' | '3xl' | 'xl' | 'rounded-full';
}

export function GlassCard({
  children,
  className = '',
  title,
  description,
  headerAction,
  rounded = '3xl',
}: GlassCardProps) {
  const roundedClass =
    rounded === '2xl'
      ? 'rounded-2xl'
      : rounded === 'xl'
      ? 'rounded-xl'
      : rounded === 'rounded-full'
      ? 'rounded-full'
      : 'rounded-3xl';

  return (
    <div
      className={`bg-white/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-md ${roundedClass} ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-center justify-between pb-4">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
