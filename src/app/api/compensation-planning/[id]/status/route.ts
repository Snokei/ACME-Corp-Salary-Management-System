import { NextResponse } from 'next/server';
import { updatePlanStatus, PlanStatus } from '@/lib/compensationPlanningService';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const status = body.status as PlanStatus;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const updatedPlan = await updatePlanStatus(params.id, status);
    return NextResponse.json({ success: true, data: updatedPlan });
  } catch (error: any) {
    console.error(`Error updating status for plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update plan status' },
      { status: error.statusCode || 400 }
    );
  }
}
