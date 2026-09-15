import { NextRequest, NextResponse } from 'next/server';
import {
  createSalaryAdjustment,
  getSalaryHistory,
  SalaryAdjustmentError,
} from '@/lib/salaryAdjustmentService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const result = await createSalaryAdjustment(employeeId, body);

    return NextResponse.json(
      {
        success: true,
        data: result.salaryHistory,
        employee: result.employee,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof SalaryAdjustmentError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employeeId = params.id;
    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const history = await getSalaryHistory(employeeId);
    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    if (error instanceof SalaryAdjustmentError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
