import { Suspense } from 'react';
import { EmployeesView } from '@/components/EmployeesView';
import { getEmployeesData } from '@/lib/employeeData';

interface PeoplePageProps {
  searchParams?: {
    search?: string;
    department?: string;
    role?: string;
    location?: string;
    status?: string;
    tab?: string;
    page?: string;
  };
}

import { prisma } from '@/lib/prisma';

export default async function PeoplePage({ searchParams }: PeoplePageProps) {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const department = typeof searchParams?.department === 'string' ? searchParams.department : 'All';
  const role = typeof searchParams?.role === 'string' ? searchParams.role : 'All';
  const location = typeof searchParams?.location === 'string' ? searchParams.location : 'All';
  const status = typeof searchParams?.status === 'string' ? searchParams.status : 'All';
  const tab = typeof searchParams?.tab === 'string' ? searchParams.tab : 'Active';
  const page = parseInt(searchParams?.page || '1', 10) || 1;

  // 1. Direct Server-Side Data Fetching from Database via Prisma
  const dataPromise = getEmployeesData({
    search,
    department,
    role,
    location,
    status,
    tab,
    page,
    limit: 10,
  });

  // Fetch unique options for dropdowns
  const uniqueRolesPromise = prisma.employee.findMany({ select: { role: true }, distinct: ['role'] });
  const uniqueLocationsPromise = prisma.employee.findMany({ select: { country: true }, distinct: ['country'] });

  const [data, uniqueRolesResult, uniqueLocationsResult] = await Promise.all([
    dataPromise,
    uniqueRolesPromise,
    uniqueLocationsPromise
  ]);

  const uniqueRoles = ['All', ...uniqueRolesResult.map(r => r.role).filter(Boolean).sort()];
  const uniqueLocations = ['All', ...uniqueLocationsResult.map(l => l.country).filter(Boolean).sort()];

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-stone-500 text-sm">
            <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Loading People Directory...</span>
          </div>
        </div>
      }
    >
      <EmployeesView
        data={data}
        uniqueRoles={uniqueRoles}
        uniqueLocations={uniqueLocations}
        searchParams={{
          search,
          department,
          role,
          location,
          tab,
          page: String(page),
        }}
      />
    </Suspense>
  );
}
