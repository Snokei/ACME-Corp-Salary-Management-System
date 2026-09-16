import { NextRequest, NextResponse } from 'next/server';
import { getCompensationAnalytics } from '@/lib/compensationAnalyticsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const department = searchParams.get('department') || undefined;
    const country = searchParams.get('country') || undefined;
    const payGrade = searchParams.get('payGrade') || undefined;
    const currency = searchParams.get('currency') || undefined;
    const period = (searchParams.get('period') as 'quarter' | 'month') || 'quarter';

    const data = await getCompensationAnalytics({
      department,
      country,
      payGrade,
      currency,
      period,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching compensation analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch compensation analytics',
      },
      { status: 500 }
    );
  }
}
