import { Suspense } from 'react';
import { AnalyticsDataFetcher } from '@/components/analytics/AnalyticsDataFetcher';
import { FilterSkeleton, MetricsSkeleton, TableSkeleton, AnalyticsChartsSkeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { BarChart3 } from 'lucide-react';

export const metadata = {
  title: 'Compensation Analytics - ACME Salary Management System',
  description: 'HR Manager analytics and salary insights across 10,000 employees.',
};

interface CompensationAnalyticsPageProps {
  searchParams?: {
    department?: string;
    country?: string;
    payGrade?: string;
    currency?: string;
    period?: 'quarter' | 'month';
  };
}

export default function CompensationAnalyticsPage({ searchParams }: CompensationAnalyticsPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Compensation Analytics"
        description="HR Manager Dashboard & Deep-Dive Compensation Insights"
        icon={BarChart3}
      />
      
      <Suspense
        fallback={
          <div className="space-y-6">
            <FilterSkeleton />
            <MetricsSkeleton count={5} />
            <AnalyticsChartsSkeleton />
            <TableSkeleton />
          </div>
        }
      >
        <AnalyticsDataFetcher searchParams={searchParams || {}} />
      </Suspense>
    </div>
  );
}
