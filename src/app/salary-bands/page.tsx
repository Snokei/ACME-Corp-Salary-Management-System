import { Suspense } from 'react';
import { getAllSalaryBands } from '@/lib/compaRatioService';
import { SalaryBandsView } from '@/components/SalaryBandsView';

interface SalaryBandsPageProps {
  searchParams?: {
    search?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export default async function SalaryBandsPage({ searchParams }: SalaryBandsPageProps) {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const page = parseInt(searchParams?.page || '1', 10) || 1;
  const sortBy = typeof searchParams?.sortBy === 'string' ? searchParams.sortBy : undefined;
  const sortOrder = searchParams?.sortOrder === 'desc' ? 'desc' : 'asc';

  const data = await getAllSalaryBands({ search, page, limit: 10, sortBy, sortOrder });

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-stone-500 text-sm">
            <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Loading Salary Bands...</span>
          </div>
        </div>
      }
    >
      <SalaryBandsView data={data} searchParams={{ search, page: String(page), sortBy, sortOrder }} />
    </Suspense>
  );
}
