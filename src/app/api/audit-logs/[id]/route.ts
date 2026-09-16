import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogById } from '@/lib/auditLogService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const log = await getAuditLogById(params.id);
    if (!log) {
      return NextResponse.json({ success: false, error: 'Audit log not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
