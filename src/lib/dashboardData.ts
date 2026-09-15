import { prisma } from './prisma';

const COLORS = ['#18181B', '#F5C242', '#E2E8F0', '#94A3B8', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export async function getDashboardData() {
  // 1. Stats
  const totalEmployees = await prisma.employee.count();
  const activeCount = await prisma.employee.count({ where: { status: 'Active' } });
  
  // 2. Department Composition
  const deptGroups = await prisma.employee.groupBy({
    by: ['department'],
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        department: 'desc',
      },
    },
  });

  const departmentComposition = deptGroups.map((g, index) => ({
    name: g.department,
    count: g._count._all,
    percentage: Math.round((g._count._all / totalEmployees) * 100),
    color: COLORS[index % COLORS.length],
  }));

  // 3. Recent Salaries (3 most recently hired)
  const recentHires = await prisma.employee.findMany({
    orderBy: { hireDate: 'desc' },
    take: 3,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      baseSalaryUSD: true,
      gender: true,
    },
  });

  const recentSalaries = recentHires.map((emp) => {
    return {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      jobTitle: emp.role,
      netSalary: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(emp.baseSalaryUSD),
      status: 'Paid',
      avatar: `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=18181B&color=fff`, // Fallback for safety
    };
  });

  // 4. Salary Statistics (Payroll Growth over the last 9 months of 2026)
  const allEmployees = await prisma.employee.findMany({
    select: {
      hireDate: true,
      baseSalaryUSD: true,
      bonusUSD: true,
      country: true,
    },
    where: { status: 'Active' },
  });

  const totalGlobalPayroll = allEmployees.reduce((sum, emp) => sum + emp.baseSalaryUSD, 0);
  const averageBaseSalary = allEmployees.length > 0 ? totalGlobalPayroll / allEmployees.length : 0;
  
  const sortedSalaries = allEmployees.map(e => e.baseSalaryUSD).sort((a, b) => a - b);
  const mid = Math.floor(sortedSalaries.length / 2);
  const medianCompensation = sortedSalaries.length > 0 
    ? (sortedSalaries.length % 2 !== 0 ? sortedSalaries[mid] : (sortedSalaries[mid - 1] + sortedSalaries[mid]) / 2)
    : 0;
    
  const countriesCount = new Set(allEmployees.map(e => e.country)).size;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const salaryStatistics = months.map((month, index) => {
    // Construct a date for the end of the month in 2026
    const monthEnd = new Date(2026, index + 1, 0); 
    
    // Sum salaries of all employees hired on or before this month
    let currentPayroll = 0;
    let currentBonus = 0;
    let prevPayroll = 0;
    
    const prevMonthEnd = new Date(2026, index, 0);

    for (const emp of allEmployees) {
      if (emp.hireDate <= monthEnd) {
        currentPayroll += emp.baseSalaryUSD;
        currentBonus += emp.bonusUSD;
      }
      if (emp.hireDate <= prevMonthEnd) {
        prevPayroll += emp.baseSalaryUSD;
      }
    }

    return {
      month,
      current: Math.round(currentPayroll / 12), // Monthly payroll
      previous: Math.round(prevPayroll / 12),
      bonus: Math.round(currentBonus / 12),
    };
  });

  // 5. Average Salary by Department
  const deptAverages = await prisma.employee.groupBy({
    by: ['department'],
    _avg: {
      baseSalaryUSD: true,
    },
    orderBy: {
      _avg: {
        baseSalaryUSD: 'desc',
      },
    },
  });

  const avgSalaryByDept = deptAverages.map((g) => ({
    department: g.department,
    averageSalary: Math.round(g._avg.baseSalaryUSD || 0),
  }));

  // 6. Average Salary by Country (Top 6 by average salary)
  const countryAverages = await prisma.employee.groupBy({
    by: ['country'],
    _avg: {
      baseSalaryUSD: true,
    },
    orderBy: {
      _avg: {
        baseSalaryUSD: 'desc',
      },
    },
    take: 6,
  });

  const avgSalaryByCountry = countryAverages.map((g) => ({
    country: g.country,
    averageSalary: Math.round(g._avg.baseSalaryUSD || 0),
  }));

  // 7. Salary Band Distribution (Below, Within, Above)
  let belowBandCount = 0;
  let withinBandCount = 0;
  let aboveBandCount = 0;

  const salaryBandModel = (prisma as any).salaryBand;
  if (salaryBandModel) {
    try {
      const salaryBands = await salaryBandModel.findMany({ where: { currency: 'USD' } });
      for (const band of salaryBands) {
        const [below, within, above] = await Promise.all([
          prisma.employee.count({
            where: { payGrade: band.payGrade, baseSalaryUSD: { lt: band.minSalary } },
          }),
          prisma.employee.count({
            where: { payGrade: band.payGrade, baseSalaryUSD: { gte: band.minSalary, lte: band.maxSalary } },
          }),
          prisma.employee.count({
            where: { payGrade: band.payGrade, baseSalaryUSD: { gt: band.maxSalary } },
          }),
        ]);
        belowBandCount += below;
        withinBandCount += within;
        aboveBandCount += above;
      }
    } catch (e) {
      console.warn('SalaryBand query error:', e);
    }
  }

  return {
    stats: {
      activeCount,
      totalEmployees,
      totalGlobalPayroll,
      averageBaseSalary,
      medianCompensation,
      countriesCount,
    },
    bandDistribution: {
      below: belowBandCount,
      within: withinBandCount,
      above: aboveBandCount,
    },
    recentSalaries,
    salaryStatistics,
    departmentComposition,
    avgSalaryByDept,
    avgSalaryByCountry,
  };
}
