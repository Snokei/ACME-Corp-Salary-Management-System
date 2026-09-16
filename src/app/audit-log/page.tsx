import { Suspense } from 'react';
import { AuditLogView } from '@/components/AuditLogView';
import { getAuditLogs } from '@/lib/auditLogService';

export const metadata = {
  title: 'Audit Log | ACME HR',
  description: 'Centralized audit logging and compliance history for ACME Salary Management System.',
};

interface AuditLogPageProps {
  searchParams?: {
    page?: string;
    search?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default async function AuditLogPage({ searchParams }: AuditLogPageProps) {
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);
  const search = searchParams?.search || '';
  const action = searchParams?.action || 'ALL';
  const entityType = searchParams?.entityType || 'ALL';
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';

  let result = { logs: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  try {
    result = await getAuditLogs({
      page,
      limit: 10,
      search: search || undefined,
      action: action !== 'ALL' ? action : undefined,
      entityType: entityType !== 'ALL' ? entityType : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  } catch (error) {
    console.error('Failed to load audit logs server-side:', error);
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-stone-500 text-sm">
            <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Loading Audit Logs...</span>
          </div>
        </div>
      }
    >
      <AuditLogView
        logs={result.logs}
        pagination={result.pagination}
        searchParams={{ page: String(page), search, action, entityType, startDate, endDate }}
      />
    </Suspense>
  );
}
