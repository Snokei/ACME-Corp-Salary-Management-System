import React from 'react';

export type StatusType =
  | 'Active'
  | 'On Leave'
  | 'Contract'
  | 'Full Time'
  | 'Paid'
  | 'Pending'
  | 'On Time'
  | 'Remote'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  className = '',
  showDot = true,
}: StatusBadgeProps) {
  let badgeStyles = 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300';
  let dotColor = 'bg-stone-400';

  const normalized = (status || '').toLowerCase();

  if (normalized.includes('active') || normalized.includes('on time') || normalized.includes('paid')) {
    badgeStyles = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
    dotColor = 'bg-emerald-500';
  } else if (normalized.includes('leave') || normalized.includes('pending')) {
    badgeStyles = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';
    dotColor = 'bg-amber-500';
  } else if (normalized.includes('contract') || normalized.includes('remote') || normalized.includes('full time')) {
    badgeStyles = 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20';
    dotColor = 'bg-blue-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badgeStyles} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>}
      <span>{status}</span>
    </span>
  );
}
