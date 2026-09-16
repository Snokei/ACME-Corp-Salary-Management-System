import { NextResponse } from 'next/server';
import {
  getCompensationPlanById,
  updateCompensationPlan,
  deleteCompensationPlan,
} from '@/lib/compensationPlanningService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await getCompensationPlanById(params.id);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Compensation plan not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: plan });
  } catch (error: any) {
    console.error(`Error fetching plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateCompensationPlan(params.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error(`Error updating plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update plan' },
      { status: error.statusCode || 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const result = await deleteCompensationPlan(params.id, force);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error deleting plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete plan' },
      { status: error.statusCode || 400 }
    );
  }
}
