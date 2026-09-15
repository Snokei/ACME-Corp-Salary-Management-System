import { Employee } from '@/types';
import { CSV_EXPORT_HEADERS, EmployeeStatusTab } from '@/constants';

const VERIFIED_AVATAR_SEEDS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=120&h=120&q=80',
];

/**
 * Deterministically resolves a safe verified avatar URL for an employee.
 */
export function getEmployeeAvatar(emp: Employee): string {
  if (emp.avatarUrl && emp.avatarUrl.startsWith('http') && !emp.avatarUrl.includes('photo-NaN')) {
    return emp.avatarUrl;
  }
  const key = `${emp.id || ''}${emp.firstName || ''}${emp.lastName || ''}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % VERIFIED_AVATAR_SEEDS.length;
  return VERIFIED_AVATAR_SEEDS[index];
}

/**
 * Filter employees based on active status tab.
 */
export function filterEmployeesByStatus(
  employees: Employee[],
  selectedTab: EmployeeStatusTab
): Employee[] {
  if (selectedTab === 'All') return employees;
  if (selectedTab === 'Active') {
    return employees.filter((e) => e.status === 'Active' || !e.status);
  }
  if (selectedTab === 'On Leave') {
    return employees.filter((e) => e.status === 'On Leave');
  }
  if (selectedTab === 'Contract') {
    return employees.filter((e) => e.status === 'Contract' || e.status === 'Full Time');
  }
  return employees;
}

/**
 * Exports employee list to a CSV file and triggers browser download.
 */
export function exportEmployeesToCSV(
  employees: Employee[],
  filename: string = 'ACME_Employees.csv'
): void {
  if (typeof window === 'undefined') return;

  const headers = [...CSV_EXPORT_HEADERS];
  const rows = employees.map((e) => [
    e.employeeId,
    `"${e.firstName} ${e.lastName}"`,
    e.email,
    e.department,
    `"${e.role}"`,
    `"${e.country}"`,
    e.baseSalaryUSD ?? e.baseSalary ?? 0,
    e.status || 'Active',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Construct URL with updated pagination page number.
 */
export function buildPaginationUrl(
  pathname: string,
  searchParams: { toString(): string },
  newPage: number
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (newPage > 1) {
    params.set('page', newPage.toString());
  } else {
    params.delete('page');
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Format currency to US English standard formatting to prevent hydration mismatches.
 */
export function formatSalaryUSD(amount?: number): string {
  return `$${(amount ?? 0).toLocaleString('en-US')}`;
}

/**
 * Format dates safely to ISO YYYY-MM-DD string.
 */
export function formatDateSafe(date?: string | Date): string {
  if (!date) return '—';
  if (typeof date === 'string') {
    return date.substring(0, 10);
  }
  try {
    return date.toISOString().substring(0, 10);
  } catch {
    return String(date);
  }
}
