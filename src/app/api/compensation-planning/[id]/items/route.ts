import { NextResponse } from 'next/server';
import {
  getPlanItems,
  addEmployeesToPlan,
} from '@/lib/compensationPlanningService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const department = searchParams.get('department') || undefined;
    const page = searchParams.get('page') || undefined;
    const limit = searchParams.get('limit') || undefined;

    const result = await getPlanItems(params.id, {
      search,
      department,
      page,
      limit,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error fetching items for plan ${params.id}:`, error);
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
    const result = await addEmployeesToPlan(params.id, body.employeeIds);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    console.error(`Error adding employees to plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add employees' },
      { status: error.statusCode || 400 }
    );
  }
}
