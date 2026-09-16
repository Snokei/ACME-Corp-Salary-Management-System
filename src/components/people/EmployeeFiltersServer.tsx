import { prisma } from '@/lib/prisma';
import { EmployeeFilters } from './EmployeeFilters';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function EmployeeFiltersServer({ searchParams }: Props) {
  const search = typeof searchParams?.search === 'string' ? searchParams.search : '';
  const department = typeof searchParams?.department === 'string' ? searchParams.department : 'All';
  const role = typeof searchParams?.role === 'string' ? searchParams.role : 'All';
  const location = typeof searchParams?.location === 'string' ? searchParams.location : 'All';
  const tabRaw = searchParams?.tab;
  const tab = (typeof tabRaw === 'string' && ['Active', 'On Leave', 'Contract', 'All'].includes(tabRaw)) 
    ? (tabRaw as 'Active' | 'On Leave' | 'Contract' | 'All') 
    : 'Active';

  const [uniqueRolesResult, uniqueLocationsResult] = await Promise.all([
    prisma.employee.findMany({ select: { role: true }, distinct: ['role'] }),
    prisma.employee.findMany({ select: { country: true }, distinct: ['country'] })
  ]);

  const uniqueRoles = ['All', ...uniqueRolesResult.map(r => r.role).filter(Boolean).sort()];
  const uniqueLocations = ['All', ...uniqueLocationsResult.map(l => l.country).filter(Boolean).sort()];

  return (
    <EmployeeFilters
      search={search}
      selectedTab={tab}
      department={department}
      role={role}
      location={location}
      uniqueRoles={uniqueRoles}
      uniqueLocations={uniqueLocations}
    />
  );
}
