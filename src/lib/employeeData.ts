import { prisma } from '@/lib/prisma';
import { Employee } from '@/types';

export interface GetEmployeesParams {
  search?: string;
  department?: string;
  role?: string;
  location?: string;
  status?: string;
  tab?: string;
  page?: number | string;
  limit?: number | string;
}

export interface EmployeesResponseData {
  employees: Employee[];
  total: number;
  page: number;
  totalPages: number;
}

const VERIFIED_AVATARS = [
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

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    employeeId: 'ACM-0001',
    firstName: 'Valentino',
    lastName: 'Morales',
    email: 'v.morales@acme.com',
    department: 'Design',
    role: 'Lead Designer',
    country: 'United States',
    city: 'San Francisco',
    currency: 'USD',
    baseSalary: 145000,
    baseSalaryUSD: 145000,
    bonusUSD: 22000,
    payGrade: 'L6',
    gender: 'Male',
    hireDate: '2022-03-15',
    performanceRating: 5,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: '2',
    employeeId: 'ACM-0002',
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia.chen@acme.com',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    country: 'United States',
    city: 'Seattle',
    currency: 'USD',
    baseSalary: 168000,
    baseSalaryUSD: 168000,
    bonusUSD: 28000,
    payGrade: 'L5',
    gender: 'Female',
    hireDate: '2021-06-10',
    performanceRating: 5,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: '3',
    employeeId: 'ACM-0003',
    firstName: 'Lucas',
    lastName: 'Vandermeer',
    email: 'lucas.v@acme.com',
    department: 'Product',
    role: 'Product Manager',
    country: 'Germany',
    city: 'Berlin',
    currency: 'EUR',
    baseSalary: 110000,
    baseSalaryUSD: 122100,
    bonusUSD: 18500,
    payGrade: 'L5',
    gender: 'Male',
    hireDate: '2023-01-20',
    performanceRating: 4,
    status: 'On Leave',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: '4',
    employeeId: 'ACM-0004',
    firstName: 'Amara',
    lastName: 'Okafor',
    email: 'amara.okafor@acme.com',
    department: 'Marketing',
    role: 'Brand Director',
    country: 'United Kingdom',
    city: 'London',
    currency: 'GBP',
    baseSalary: 98000,
    baseSalaryUSD: 128380,
    bonusUSD: 21000,
    payGrade: 'L6',
    gender: 'Female',
    hireDate: '2020-11-04',
    performanceRating: 5,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: '5',
    employeeId: 'ACM-0005',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'e.rostova@acme.com',
    department: 'Human Resources',
    role: 'People Operations Lead',
    country: 'France',
    city: 'Paris',
    currency: 'EUR',
    baseSalary: 88000,
    baseSalaryUSD: 97680,
    bonusUSD: 12000,
    payGrade: 'L4',
    gender: 'Female',
    hireDate: '2022-08-14',
    performanceRating: 4,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: '6',
    employeeId: 'ACM-0006',
    firstName: 'Marcus',
    lastName: 'Brody',
    email: 'marcus.b@acme.com',
    department: 'Sales',
    role: 'Enterprise Account Exec',
    country: 'United States',
    city: 'New York',
    currency: 'USD',
    baseSalary: 135000,
    baseSalaryUSD: 135000,
    bonusUSD: 45000,
    payGrade: 'L5',
    gender: 'Male',
    hireDate: '2023-04-01',
    performanceRating: 4,
    status: 'Full Time',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: '7',
    employeeId: 'ACM-0007',
    firstName: 'Keiko',
    lastName: 'Tanaka',
    email: 'keiko.tanaka@acme.com',
    department: 'Engineering',
    role: 'DevOps Specialist',
    country: 'Japan',
    city: 'Tokyo',
    currency: 'JPY',
    baseSalary: 11500000,
    baseSalaryUSD: 80500,
    bonusUSD: 12000,
    payGrade: 'L4',
    gender: 'Female',
    hireDate: '2023-09-12',
    performanceRating: 5,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: '8',
    employeeId: 'ACM-0008',
    firstName: 'Liam',
    lastName: "O'Connor",
    email: 'liam.oc@acme.com',
    department: 'Finance',
    role: 'Senior Financial Analyst',
    country: 'Australia',
    city: 'Sydney',
    currency: 'AUD',
    baseSalary: 130000,
    baseSalaryUSD: 87100,
    bonusUSD: 14000,
    payGrade: 'L4',
    gender: 'Male',
    hireDate: '2021-12-01',
    performanceRating: 4,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80',
  },
];

export async function getEmployeesData(
  params: GetEmployeesParams = {}
): Promise<EmployeesResponseData> {
  const search = (params.search || '').trim();
  const department = params.department || 'All';
  const role = params.role || 'All';
  const page = Math.max(1, parseInt(String(params.page || '1'), 10) || 1);
  const limit = Math.max(1, parseInt(String(params.limit || '10'), 10) || 10);
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
    ];
  }

  if (department !== 'All') {
    whereClause.department = department;
  }

  if (role !== 'All') {
    whereClause.role = role;
  }

  if (params.location && params.location !== 'All') {
    whereClause.country = params.location;
  }

  if (params.tab && params.tab !== 'All') {
    whereClause.status = params.tab;
  }

  try {
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { hireDate: 'desc' },
      }),
      prisma.employee.count({ where: whereClause }),
    ]);

    if (employees && employees.length > 0) {
      const mappedEmployees: Employee[] = employees.map((emp, index) => {

        const avatarUrl =
          VERIFIED_AVATARS[index % VERIFIED_AVATARS.length] ||
          `https://ui-avatars.com/api/?background=f5c242&color=18181b&name=${encodeURIComponent(
            emp.firstName + ' ' + emp.lastName
          )}`;

        return {
          id: emp.id,
          employeeId: emp.employeeId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          department: emp.department,
          role: emp.role,
          country: emp.country,
          city: emp.city,
          currency: emp.currency,
          baseSalary: emp.baseSalary,
          baseSalaryUSD: emp.baseSalaryUSD,
          bonusUSD: emp.bonusUSD,
          payGrade: emp.payGrade,
          gender: emp.gender,
          hireDate: emp.hireDate instanceof Date ? emp.hireDate.toISOString() : String(emp.hireDate),
          performanceRating: emp.performanceRating,
          status: (emp as any).status || 'Active',
          avatarUrl,
        };
      });

      return {
        employees: mappedEmployees,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  } catch (dbErr) {
    console.warn('DB query error, falling back to curated realistic mock data:', dbErr);
  }

  // Fallback mock handling
  let filtered = MOCK_EMPLOYEES;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }
  if (department !== 'All') {
    filtered = filtered.filter((e) => e.department === department);
  }
  
  if (params.tab && params.tab !== 'All') {
    filtered = filtered.filter((e) => e.status === params.tab);
  }

  const paginated = filtered.slice(skip, skip + limit);

  return {
    employees: paginated,
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit) || 1,
  };
}

export async function getEmployeeById(idOrEmpId: string): Promise<Employee | null> {
  if (!idOrEmpId) return null;
  const targetId = decodeURIComponent(idOrEmpId).trim();

  try {
    const emp = await prisma.employee.findFirst({
      where: {
        OR: [
          { employeeId: targetId },
          { id: targetId },
        ],
      },
    });

    if (emp) {
      const avatarUrl =
        VERIFIED_AVATARS[0] ||
        `https://ui-avatars.com/api/?background=f5c242&color=18181b&name=${encodeURIComponent(
          emp.firstName + ' ' + emp.lastName
        )}`;

      return {
        id: emp.id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        department: emp.department,
        role: emp.role,
        country: emp.country,
        city: emp.city,
        currency: emp.currency,
        baseSalary: emp.baseSalary,
        baseSalaryUSD: emp.baseSalaryUSD,
        bonusUSD: emp.bonusUSD,
        payGrade: emp.payGrade,
        gender: emp.gender,
        hireDate: emp.hireDate instanceof Date ? emp.hireDate.toISOString() : String(emp.hireDate),
        performanceRating: emp.performanceRating,
        status: (emp as any).status || 'Active',
        avatarUrl,
      };
    }
  } catch (dbErr) {
    console.warn('DB query error in getEmployeeById, checking mock fallback:', dbErr);
  }

  // Fallback to MOCK_EMPLOYEES
  const found = MOCK_EMPLOYEES.find(
    (e) => e.employeeId.toLowerCase() === targetId.toLowerCase() || e.id.toLowerCase() === targetId.toLowerCase()
  );
  return found || null;
}

