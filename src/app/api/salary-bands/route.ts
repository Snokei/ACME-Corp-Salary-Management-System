import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSalaryBands,
  createSalaryBand,
  getCompensationAnalysis,
  SalaryBandError,
} from '@/lib/compaRatioService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const payGrade = searchParams.get('payGrade');
    const salary = searchParams.get('salary');

    // If query contains salary and payGrade, return compensation analysis
    if (payGrade && salary) {
      const numSalary = parseFloat(salary) || 0;
      const analysis = await getCompensationAnalysis(numSalary, payGrade);
      return NextResponse.json({ success: true, analysis });
    }

    const bands = await getAllSalaryBands(search);
    return NextResponse.json({ success: true, bands });
  } catch (error: any) {
    if (error instanceof SalaryBandError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const newBand = await createSalaryBand(body);
    return NextResponse.json({ success: true, band: newBand }, { status: 201 });
  } catch (error: any) {
    if (error instanceof SalaryBandError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
