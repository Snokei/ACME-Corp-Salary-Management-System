import { CompensationAnalyticsView } from '@/components/CompensationAnalyticsView';
import { getCompensationAnalytics } from '@/lib/compensationAnalyticsService';

export const metadata = {
  title: 'Compensation Analytics - ACME Salary Management System',
  description: 'HR Manager analytics and salary insights across 10,000 employees.',
};

export default async function CompensationAnalyticsPage() {
  let initialData;
  try {
    initialData = await getCompensationAnalytics();
  } catch (error) {
    console.error('Failed to pre-fetch compensation analytics server-side:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CompensationAnalyticsView initialData={initialData} />
    </div>
  );
}
