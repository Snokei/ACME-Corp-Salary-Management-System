import { NextRequest, NextResponse } from 'next/server';
import { updateSalaryBand, SalaryBandError } from '@/lib/compaRatioService';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/auditLogService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json().catch(() => ({}));
    const updated = await updateSalaryBand(id, body);
    return NextResponse.json({ success: true, band: updated });
  } catch (error: any) {
    if (error instanceof SalaryBandError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const existingBand = await prisma.salaryBand.findUnique({ where: { id } });
    await prisma.salaryBand.delete({ where: { id } });

    if (existingBand) {
      await createAuditLog({
        action: 'DELETE',
        entityType: 'SALARY_BAND',
        entityId: id,
        description: `Salary Band deleted for Pay Grade ${existingBand.payGrade} (${existingBand.currency})`,
        previousData: existingBand,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete salary band' }, { status: 500 });
  }
}

