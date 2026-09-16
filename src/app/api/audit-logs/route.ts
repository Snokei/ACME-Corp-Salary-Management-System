import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/auditLogService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const action = searchParams.get('action') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const sort = (searchParams.get('sort') as 'asc' | 'desc') || 'desc';

    const result = await getAuditLogs({
      search,
      action,
      entityType,
      userId,
      startDate,
      endDate,
      page,
      limit,
      sort,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
