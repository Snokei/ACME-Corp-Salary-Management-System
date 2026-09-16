import { NextResponse } from 'next/server';
import {
  updatePlanItem,
  removeEmployeeFromPlan,
} from '@/lib/compensationPlanningService';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const body = await request.json();
    const result = await updatePlanItem(params.id, params.itemId, {
      proposedSalaryUSD: body.proposedSalaryUSD,
      increasePercentage: body.increasePercentage,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error updating item ${params.itemId} in plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update item' },
      { status: error.statusCode || 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const result = await removeEmployeeFromPlan(params.id, params.itemId);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error deleting item ${params.itemId} from plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete item' },
      { status: error.statusCode || 400 }
    );
  }
}
