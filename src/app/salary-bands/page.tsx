import { Suspense } from 'react';
import { TableSkeleton } from '@/components/ui';
import { SalaryBandsProvider } from '@/components/salary-bands/SalaryBandsProvider';
import { SalaryBandsHeader } from '@/components/salary-bands/SalaryBandsHeader';
import { SalaryBandsFilters } from '@/components/salary-bands/SalaryBandsFilters';
import { SalaryBandsDataFetcher } from '@/components/salary-bands/SalaryBandsDataFetcher';

export const metadata = {
  title: "Salary Bands - ACME Salary Management System",
  description: "View and manage salary bands across the organization.",
};

interface SalaryBandsPageProps {
  searchParams?: {
    search?: string;
    currency?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export default function SalaryBandsPage({ searchParams = {} }: SalaryBandsPageProps) {
  return (
    <SalaryBandsProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Instant UI Shell */}
        <SalaryBandsHeader />
        <SalaryBandsFilters />

        {/* Streaming Data Payload */}
        <Suspense fallback={<TableSkeleton />}>
          <SalaryBandsDataFetcher searchParams={searchParams} />
        </Suspense>
      </div>
    </SalaryBandsProvider>
  );
}
