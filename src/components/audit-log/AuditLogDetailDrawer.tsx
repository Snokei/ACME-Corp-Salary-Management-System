'use client';

import React from 'react';
import { Drawer, Button } from '@/components/ui';
import { Clock, User, Shield, Tag, FileText, ArrowRight, Database } from 'lucide-react';

export interface AuditLogItem {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  previousData: any;
  newData: any;
  metadata: any;
  createdAt: string | Date;
}

interface AuditLogDetailDrawerProps {
  log: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDetailDrawer({ log, isOpen, onClose }: AuditLogDetailDrawerProps) {
  if (!log) return null;

  const formattedDate = new Date(log.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const getBadgeStyle = (action: string) => {
    const act = action.toUpperCase();
    if (['CREATE', 'APPROVE', 'FINALIZE'].includes(act)) {
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
    if (['UPDATE', 'SUBMIT'].includes(act)) {
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    }
    if (['DELETE', 'REJECT'].includes(act)) {
      return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }
    return 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700';
  };

  // Helper to format values for display
  const formatVal = (val: any): string => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'number') {
      if (Math.abs(val) > 100) {
        return `$${val.toLocaleString()}`;
      }
      return val.toString();
    }
    if (typeof val === 'boolean') return val ? 'True' : 'False';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  // Extract keys to build diff table
  const buildDiff = () => {
    const prev = log.previousData && typeof log.previousData === 'object' ? log.previousData : {};
    const curr = log.newData && typeof log.newData === 'object' ? log.newData : {};

    const keys = Array.from(new Set([...Object.keys(prev), ...Object.keys(curr)]));
    // Exclude internal timestamp fields from diff view if needed
    const ignoreKeys = new Set(['id', 'createdAt', 'updatedAt']);
    
    return keys
      .filter((k) => !ignoreKeys.has(k))
      .map((key) => {
        const prevVal = prev[key];
        const currVal = curr[key];
        const isChanged = JSON.stringify(prevVal) !== JSON.stringify(currVal);
        return { key, prevVal, currVal, isChanged };
      });
  };

  const diffItems = buildDiff();

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Audit Record Details" size="lg">
      <div className="space-y-6 text-stone-800 dark:text-stone-200">

        {/* Event Header Banner */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${getBadgeStyle(
                log.action
              )}`}
            >
              {log.action}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            {log.description}
          </h3>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>User / Performed By</span>
            </div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {log.userName || 'System'}
            </p>
            {log.userEmail && (
              <p className="text-xs text-stone-500 dark:text-stone-400">{log.userEmail}</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Module / Entity</span>
            </div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {log.entityType}
            </p>
            {log.entityId && (
              <p className="text-xs font-mono text-stone-500 dark:text-stone-400 truncate">
                ID: {log.entityId}
              </p>
            )}
          </div>
        </div>

        {/* Changed Fields Diff Comparison */}
        {diffItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Data Changes & Comparison
              </h4>
            </div>

            <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                    <th className="py-2.5 px-3 font-semibold">Field</th>
                    <th className="py-2.5 px-3 font-semibold">Previous Value</th>
                    <th className="py-2.5 px-3 font-semibold">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {diffItems.map((item) => (
                    <tr
                      key={item.key}
                      className={
                        item.isChanged
                          ? 'bg-amber-50/50 dark:bg-amber-950/20'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-900/40'
                      }
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-stone-700 dark:text-stone-300">
                        {item.key}
                      </td>
                      <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400 font-medium">
                        {formatVal(item.prevVal)}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatVal(item.currVal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raw Metadata Display if exists */}
        {log.metadata && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-stone-400" />
              <h4 className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Additional Metadata
              </h4>
            </div>
            <pre className="p-3 rounded-xl bg-stone-900 text-stone-200 text-xs font-mono overflow-x-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close Drawer
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
