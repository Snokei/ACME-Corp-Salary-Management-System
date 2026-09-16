import { Suspense } from 'react';
import { CompensationAnalyticsView } from '@/components/CompensationAnalyticsView';
import { getCompensationAnalytics } from '@/lib/compensationAnalyticsService';

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
    period?: string;
  };
}

export default async function CompensationAnalyticsPage({ searchParams }: CompensationAnalyticsPageProps) {
  const department = searchParams?.department || 'All';
  const country = searchParams?.country || 'All';
  const payGrade = searchParams?.payGrade || 'All';
  const currency = searchParams?.currency || 'All';
  const period = (searchParams?.period === 'month' ? 'month' : 'quarter') as 'quarter' | 'month';

  let data;
  try {
    data = await getCompensationAnalytics({
      department: department !== 'All' ? department : undefined,
      country: country !== 'All' ? country : undefined,
      payGrade: payGrade !== 'All' ? payGrade : undefined,
      currency: currency !== 'All' ? currency : undefined,
      period,
    });
  } catch (error) {
    console.error('Failed to load compensation analytics server-side:', error);
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-stone-500 text-sm">
            <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Loading Analytics...</span>
          </div>
        </div>
      }
    >
      <CompensationAnalyticsView
        data={data}
        searchParams={{ department, country, payGrade, currency, period }}
      />
    </Suspense>
  );
}
