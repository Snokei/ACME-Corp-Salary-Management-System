import React from 'react';
import { AuditLogView } from '@/components/audit-log/AuditLogView';
import { getAuditLogs } from '@/lib/auditLogService';

interface AuditLogDataFetcherProps {
  searchParams: {
    page?: string;
    search?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  };
}

export async function AuditLogDataFetcher({ searchParams }: AuditLogDataFetcherProps) {
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10) || 1);
  const search = searchParams?.search || '';
  const action = searchParams?.action || 'ALL';
  const entityType = searchParams?.entityType || 'ALL';
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';

  const result = await getAuditLogs({
    page,
    limit: 10,
    search: search || undefined,
    action: action !== 'ALL' ? action : undefined,
    entityType: entityType !== 'ALL' ? entityType : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  return (
    <AuditLogView
      logs={result.logs}
      pagination={result.pagination}
      searchParams={{ page: String(page), search, action, entityType, startDate, endDate }}
    />
  );
}
