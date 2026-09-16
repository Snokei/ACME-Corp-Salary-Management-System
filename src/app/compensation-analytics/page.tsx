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

  return <CompensationAnalyticsView initialData={initialData} />;
}
