import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-2 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="p-2 sm:p-2.5 rounded-2xl bg-stone-900 text-amber-400 dark:bg-white dark:text-stone-900 shadow-sm shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-white truncate">
            {title}
          </h1>
          {description && (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
