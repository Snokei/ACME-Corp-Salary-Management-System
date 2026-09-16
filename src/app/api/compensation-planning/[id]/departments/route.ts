import { NextResponse } from 'next/server';
import {
  getDepartmentBudgetSummary,
  updateDepartmentAllocations,
} from '@/lib/compensationPlanningService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const departments = await getDepartmentBudgetSummary(params.id);
    return NextResponse.json({ success: true, data: departments });
  } catch (error: any) {
    console.error(`Error fetching department summary for plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const allocations = Array.isArray(body.allocations) ? body.allocations : [];
    const result = await updateDepartmentAllocations(params.id, allocations);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error updating department allocations for plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update department allocations' },
      { status: error.statusCode || 400 }
    );
  }
}
