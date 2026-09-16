import React from 'react';
import { CompensationAnalyticsView } from '@/components/analytics/CompensationAnalyticsView';
import { getCompensationAnalytics } from '@/lib/compensationAnalyticsService';

interface AnalyticsDataFetcherProps {
  searchParams: {
    department?: string;
    country?: string;
    payGrade?: string;
    currency?: string;
    period?: 'quarter' | 'month';
  };
}

export async function AnalyticsDataFetcher({ searchParams }: AnalyticsDataFetcherProps) {
  const department = searchParams?.department || 'All';
  const country = searchParams?.country || 'All';
  const payGrade = searchParams?.payGrade || 'All';
  const currency = searchParams?.currency || 'All';
  const period = (searchParams?.period === 'month' ? 'month' : 'quarter') as 'quarter' | 'month';

  const data = await getCompensationAnalytics({
    department: department !== 'All' ? department : undefined,
    country: country !== 'All' ? country : undefined,
    payGrade: payGrade !== 'All' ? payGrade : undefined,
    currency: currency !== 'All' ? currency : undefined,
    period,
  });

  return (
    <CompensationAnalyticsView
      data={data}
      searchParams={{ department, country, payGrade, currency, period }}
    />
  );
}
