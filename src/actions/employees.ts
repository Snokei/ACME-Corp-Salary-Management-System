'use server';

import { getEmployeesData, GetEmployeesParams, EmployeesResponseData } from '@/lib/employeeData';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Server Action to fetch employees directly based on filters, search query, and pagination.
 */
export async function getEmployeesAction(params: GetEmployeesParams): Promise<EmployeesResponseData> {
  return await getEmployeesData(params);
}

/**
 * Server Action to handle employee filter and search submissions by redirecting with new URL parameters.
 * Eliminates the need for client-side state management for filters.
 */
export async function filterEmployeesAction(formData: FormData) {
  const search = formData.get('search')?.toString() || '';
  const department = formData.get('department')?.toString() || 'All';
  const tab = formData.get('tab')?.toString() || 'Active';
  const page = formData.get('page')?.toString() || '1';

  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (department !== 'All') params.set('department', department);
  if (tab !== 'Active' && tab !== 'All') params.set('tab', tab);
  if (page !== '1') params.set('page', page);

  const queryString = params.toString();
  redirect(queryString ? `/people?${queryString}` : '/people');
}

/**
 * Server Action to create a new employee and revalidate people pages.
 */
export async function createEmployeeAction(data: {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  country?: string;
  city?: string;
  currency?: string;
  baseSalary: number | string;
  baseSalaryUSD?: number | string;
  bonusUSD?: number | string;
  payGrade?: string;
  gender?: string;
}) {
  try {
    const salary = typeof data.baseSalary === 'string' ? parseFloat(data.baseSalary) || 0 : data.baseSalary;
    const salaryUSD = data.baseSalaryUSD
      ? typeof data.baseSalaryUSD === 'string'
        ? parseFloat(data.baseSalaryUSD) || salary
        : data.baseSalaryUSD
      : salary;
    const bonus = data.bonusUSD
      ? typeof data.bonusUSD === 'string'
        ? parseFloat(data.bonusUSD) || 0
        : data.bonusUSD
      : 0;

    const newEmployee = await prisma.employee.create({
      data: {
        employeeId: `ACM-${Math.floor(10000 + Math.random() * 90000)}`,
        firstName: data.firstName || 'Jane',
        lastName: data.lastName || 'Doe',
        email: data.email || `jane.doe${Date.now()}@acme.com`,
        department: data.department || 'Engineering',
        role: data.role || 'Software Engineer',
        country: data.country || 'United States',
        city: data.city || 'San Francisco',
        currency: data.currency || 'USD',
        baseSalary: salary,
        baseSalaryUSD: salaryUSD,
        bonusUSD: bonus,
        payGrade: data.payGrade || 'L4',
        gender: data.gender || 'Female',
        hireDate: new Date(),
        performanceRating: 5,
      },
    });

    revalidatePath('/people');
    revalidatePath('/');

    return { success: true, employee: newEmployee };
  } catch (error: any) {
    console.error('Server action createEmployeeAction failed:', error);
    return { success: false, error: error.message || 'Failed to create employee' };
  }
}
