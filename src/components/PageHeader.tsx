import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 ${className}`}
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-3 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
