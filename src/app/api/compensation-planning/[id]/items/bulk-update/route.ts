import { NextResponse } from 'next/server';
import { bulkUpdatePlanItems } from '@/lib/compensationPlanningService';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const department = body.department || undefined;
    const increasePercentage = Number(body.increasePercentage);

    const result = await bulkUpdatePlanItems(
      params.id,
      { department },
      increasePercentage
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error bulk updating items for plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to bulk update items' },
      { status: error.statusCode || 400 }
    );
  }
}
