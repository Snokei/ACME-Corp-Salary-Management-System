import React from 'react';
import { getAllSalaryBands } from '@/lib/compaRatioService';
import { SalaryBandsTable } from './SalaryBandsTable';

interface SalaryBandsDataFetcherProps {
  searchParams: {
    search?: string;
    currency?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export async function SalaryBandsDataFetcher({ searchParams }: SalaryBandsDataFetcherProps) {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const currency = typeof searchParams?.currency === 'string' ? searchParams.currency : 'All';
  const page = parseInt(searchParams?.page || '1', 10) || 1;
  const sortBy = typeof searchParams?.sortBy === 'string' ? searchParams.sortBy : undefined;
  const sortOrder = searchParams?.sortOrder === 'desc' ? 'desc' : 'asc';

  const data = await getAllSalaryBands({ search, currency, page, limit: 10, sortBy, sortOrder });

  return <SalaryBandsTable data={data} />;
}
