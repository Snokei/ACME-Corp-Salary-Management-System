'use client';

import React, { useTransition, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { GlassCard, Button, SearchInput, SearchableSelect } from '@/components/ui';
import { AuditLogDetailDrawer, AuditLogItem } from '@/components/AuditLogDetailDrawer';
import {
  ShieldAlert,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  User,
  FileText,
  Loader2,
  Filter,
} from 'lucide-react';
import { useState } from 'react';

const ACTION_OPTIONS = ['All Actions', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUBMIT', 'FINALIZE'];
const MODULE_OPTIONS = ['All Modules', 'EMPLOYEE', 'SALARY', 'SALARY_HISTORY', 'SALARY_BAND', 'COMPENSATION_PLAN', 'COMPENSATION_BUDGET'];

interface AuditLogPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AuditLogViewProps {
  logs: AuditLogItem[];
  pagination: AuditLogPagination;
  searchParams: {
    page: string;
    search: string;
    action: string;
    entityType: string;
    startDate: string;
    endDate: string;
  };
}

export function AuditLogView({ logs, pagination, searchParams }: AuditLogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Drawer state — purely client-side, no server interaction
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Read current values from server-provided searchParams
  const search = searchParams.search;
  const action = searchParams.action;
  const entityType = searchParams.entityType;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;
  const page = parseInt(searchParams.page, 10) || 1;
  const { total, totalPages } = pagination;

  // Push updated URL params — triggers server re-render with new data
  const pushFilter = useCallback((updates: Record<string, string>) => {
    const merged = { search, action, entityType, startDate, endDate, page: '1', ...updates };
    const params = new URLSearchParams();
    if (merged.search) params.set('search', merged.search);
    if (merged.action !== 'ALL') params.set('action', merged.action);
    if (merged.entityType !== 'ALL') params.set('entityType', merged.entityType);
    if (merged.startDate) params.set('startDate', merged.startDate);
    if (merged.endDate) params.set('endDate', merged.endDate);
    if (merged.page !== '1') params.set('page', merged.page);
    startTransition(() => {
      router.push(`${pathname}${params.toString() ? '?' + params.toString() : ''}`);
    });
  }, [search, action, entityType, startDate, endDate, pathname, router]);

  const handleResetFilters = () => {
    startTransition(() => router.push(pathname));
  };

  const handleOpenDetail = (log: AuditLogItem) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const getActionBadgeStyle = (act: string) => {
    const uppercaseAct = act.toUpperCase();
    if (['CREATE', 'APPROVE', 'FINALIZE'].includes(uppercaseAct)) {
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
    if (['UPDATE', 'SUBMIT'].includes(uppercaseAct)) {
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    }
    if (['DELETE', 'REJECT'].includes(uppercaseAct)) {
      return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }
    return 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700';
  };

  return (
    <div className={`space-y-6 pb-12 transition-opacity duration-150 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Top Header Banner */}
      <PageHeader
        title="Audit Log"
        description="Centralized compliance and activity history for HR administrative operations."
        icon={ShieldAlert}
      >
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 px-3 py-2 rounded-xl backdrop-blur-md">
          {isPending
            ? <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            : <Clock className="w-4 h-4 text-amber-500" />
          }
          <span>Immutable Server Records</span>
        </div>
      </PageHeader>

      {/* Filter Toolbar — single inline row matching other modules */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-xs">
            <SearchInput
              value={search}
              onChange={(val) => pushFilter({ search: val, page: '1' })}
              placeholder="Search description, user, entity..."
            />
          </div>

          {/* Action */}
          <div className="min-w-[140px]">
            <SearchableSelect
              name="action"
              options={ACTION_OPTIONS}
              value={action === 'ALL' ? 'All Actions' : action}
              placeholder="All Actions"
              shape="pill"
              onChange={(val) => pushFilter({ action: val === 'All Actions' ? 'ALL' : val, page: '1' })}
            />
          </div>

          {/* Module */}
          <div className="min-w-[155px]">
            <SearchableSelect
              name="entityType"
              options={MODULE_OPTIONS}
              value={entityType === 'ALL' ? 'All Modules' : entityType}
              placeholder="All Modules"
              shape="pill"
              onChange={(val) => pushFilter({ entityType: val === 'All Modules' ? 'ALL' : val, page: '1' })}
            />
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 whitespace-nowrap">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => pushFilter({ startDate: e.target.value, page: '1' })}
              className="px-2.5 py-2 text-xs rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 h-9"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 whitespace-nowrap">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => pushFilter({ endDate: e.target.value, page: '1' })}
              className="px-2.5 py-2 text-xs rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 h-9"
            />
          </div>

          {/* Reset */}
          {(search || action !== 'ALL' || entityType !== 'ALL' || startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              shape="pill"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          )}
        </div>
      </GlassCard>

      {/* Main Audit Log Table Card */}
      <GlassCard className="p-0 overflow-hidden">
        {logs.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              No Audit Logs Found
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              No activity logs match your selected filter criteria or search query.
            </p>
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 dark:bg-stone-900/80 text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
                  <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Module</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Target Entity</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/50 dark:divide-stone-800/50">
                {logs.map((log) => {
                  const dateStr = new Date(log.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <tr
                      key={log.id}
                      onClick={() => handleOpenDetail(log)}
                      className="hover:bg-amber-500/5 dark:hover:bg-amber-500/10 cursor-pointer transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap text-stone-600 dark:text-stone-400">
                        {dateStr}
                      </td>

                      {/* User */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-stone-900 dark:text-stone-100">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span>{log.userName || 'System'}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getActionBadgeStyle(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="py-3 px-4 whitespace-nowrap text-stone-700 dark:text-stone-300 font-medium">
                        {log.entityType}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-stone-800 dark:text-stone-200 font-medium max-w-xs truncate">
                        {log.description}
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-stone-500 dark:text-stone-400 text-[11px]">
                        {log.entityId ? log.entityId.slice(0, 13) + '...' : '—'}
                      </td>

                      {/* View Action */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(log);
                          }}
                          className="h-7 px-2.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-950/50"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {logs.length > 0 && (
          <div className="p-4 border-t border-stone-200/60 dark:border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400">
            <div>
              Showing <span className="font-semibold">{logs.length}</span> of{' '}
              <span className="font-semibold">{total}</span> total records
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => pushFilter({ page: String(page - 1) })}
                className="h-8 px-2.5"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <span className="px-2 font-medium">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => pushFilter({ page: String(page + 1) })}
                className="h-8 px-2.5"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Audit Detail Drawer — client-only, no server interaction */}
      <AuditLogDetailDrawer
        log={selectedLog}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
