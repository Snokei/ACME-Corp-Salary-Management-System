import { NextResponse } from 'next/server';
import {
  getAllCompensationPlans,
  createCompensationPlan,
  CompensationPlanningError,
} from '@/lib/compensationPlanningService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const plans = await getAllCompensationPlans({ fiscalYear, status, search });
    return NextResponse.json({ success: true, data: plans });
  } catch (error: any) {
    console.error('Error fetching compensation plans:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const plan = await createCompensationPlan({
      name: body.name,
      fiscalYear: body.fiscalYear,
      totalBudgetUSD: Number(body.totalBudgetUSD),
      createdBy: body.createdBy,
      initialDepartmentAllocations: body.initialDepartmentAllocations,
      autoPopulateEmployees: body.autoPopulateEmployees,
    });

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating compensation plan:', error);
    let errorMsg = error.message || 'Failed to create compensation plan';
    if (errorMsg.includes('invocation in') || errorMsg.includes('Unknown argument')) {
      const lines = errorMsg.split('\n').map((l: string) => l.trim()).filter(Boolean);
      errorMsg = lines.find((l: string) => l.startsWith('Unknown argument')) ||
                 lines[lines.length - 1] ||
                 'Database error creating compensation plan';
    }
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: error.statusCode || 400 }
    );
  }
}
