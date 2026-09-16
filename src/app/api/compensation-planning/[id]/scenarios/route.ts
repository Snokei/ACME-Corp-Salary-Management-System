import { NextResponse } from 'next/server';
import { getScenarioSimulations } from '@/lib/compensationPlanningService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const pctsParam = searchParams.get('percentages');
    let percentages = [3, 5, 7];

    if (pctsParam) {
      percentages = pctsParam
        .split(',')
        .map((p) => parseFloat(p.trim()))
        .filter((p) => !isNaN(p) && p >= 0);
    }

    const scenarios = await getScenarioSimulations(params.id, percentages);
    return NextResponse.json({ success: true, data: scenarios });
  } catch (error: any) {
    console.error(`Error calculating scenarios for plan ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
