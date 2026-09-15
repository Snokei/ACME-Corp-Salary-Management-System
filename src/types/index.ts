export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  country: string;
  city: string;
  currency: string;
  baseSalary: number;
  baseSalaryUSD: number;
  bonusUSD: number;
  payGrade: string;
  gender: string;
  hireDate: string | Date;
  performanceRating: number;
  status?: 'Active' | 'On Leave' | 'Probation' | 'Full Time' | 'Contract';
  avatarUrl?: string;
}

export interface DashboardStats {
  activeCount: number;
  onLeaveCount: number;
  totalEmployees: number;
  medianSalaryUSD: number;
  totalPayrollUSD: number;
  averageBonusUSD: number;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  category: 'Design' | 'HR' | 'Review' | 'Meeting';
  tagColor: string;
  attendees: { name: string; avatar: string }[];
}

export interface SalaryHistoryPoint {
  month: string;
  payroll: number;
  median: number;
  bonus: number;
}

export interface DepartmentDistribution {
  name: string;
  count: number;
  percentage: number;
  color: string;
}
