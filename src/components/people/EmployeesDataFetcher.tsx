import React from 'react';
import { getEmployeesData } from '@/lib/employeeData';
import { EmployeesTable } from '@/components/people/EmployeesTable';

interface EmployeesDataFetcherProps {
  searchParams: {
    search?: string;
    department?: string;
    role?: string;
    location?: string;
    status?: string;
    tab?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export async function EmployeesDataFetcher({ searchParams }: EmployeesDataFetcherProps) {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const department = typeof searchParams?.department === 'string' ? searchParams.department : 'All';
  const role = typeof searchParams?.role === 'string' ? searchParams.role : 'All';
  const location = typeof searchParams?.location === 'string' ? searchParams.location : 'All';
  const status = typeof searchParams?.status === 'string' ? searchParams.status : 'All';
  const tab = typeof searchParams?.tab === 'string' ? searchParams.tab : 'Active';
  const page = parseInt(searchParams?.page || '1', 10) || 1;
  const sortBy = typeof searchParams?.sortBy === 'string' ? searchParams.sortBy : undefined;
  const sortOrder = searchParams?.sortOrder === 'asc' ? 'asc' : 'desc';

  const data = await getEmployeesData({
    search,
    department,
    role,
    location,
    status,
    tab,
    page,
    limit: 10,
    sortBy,
    sortOrder,
  });

  return (
    <EmployeesTable
      employees={data.employees}
      page={data.page}
      totalPages={data.totalPages}
      totalCount={data.total}
      pageSize={10}
    />
  );
}
