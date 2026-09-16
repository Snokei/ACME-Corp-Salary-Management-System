import { prisma } from '@/lib/prisma';
import { calculateCompaRatio } from '@/lib/compaRatioService';

export interface CompensationAnalyticsFilters {
  department?: string;
  country?: string;
  payGrade?: string;
  currency?: string;
  period?: 'quarter' | 'month';
}

export interface SummaryMetrics {
  totalEmployees: number;
  averageBaseSalary: number;
  medianBaseSalary: number;
  minBaseSalary: number;
  maxBaseSalary: number;
}

export interface DistributionBucket {
  range: string;
  min: number;
  max: number | null;
  count: number;
  percentage: number;
}

export interface DepartmentCompensation {
  department: string;
  employeeCount: number;
  avgSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
}

export interface PayGradeCompensation {
  payGrade: string;
  employeeCount: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  midpointSalary: number | null;
  avgCompaRatio: number | null;
  belowBandCount: number;
  withinBandCount: number;
  aboveBandCount: number;
  belowBandPercentage: number;
  withinBandPercentage: number;
  aboveBandPercentage: number;
}

export interface BandDistribution {
  below: { count: number; percentage: number };
  within: { count: number; percentage: number };
  above: { count: number; percentage: number };
  noBand: { count: number; percentage: number };
}

export interface CountryCompensation {
  country: string;
  employeeCount: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
}

export interface AdjustmentTrendPeriod {
  period: string; // e.g. "2026 Q1" or "2026-03"
  adjustmentsCount: number;
  totalChangeUSD: number;
  avgChangeUSD: number;
  totalIncreasesUSD: number;
  totalDecreasesUSD: number;
  increaseCount: number;
  decreaseCount: number;
}

export interface CompensationAnalyticsResult {
  filters: CompensationAnalyticsFilters;
  summary: SummaryMetrics;
  salaryDistribution: DistributionBucket[];
  departmentCompensation: DepartmentCompensation[];
  payGradeCompensation: PayGradeCompensation[];
  bandDistribution: BandDistribution;
  countryCompensation: CountryCompensation[];
  adjustmentTrends: AdjustmentTrendPeriod[];
  filterOptions: {
    departments: string[];
    countries: string[];
    payGrades: string[];
    currencies: string[];
  };
}

/** Returns the median of a list of salary values (0 when empty). */
function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
  }
  return Math.round(sorted[mid] * 100) / 100;
}

const FILTER_OPTIONS_TTL_MS = 60_000; // 60 seconds
type FilterOptions = {
  departments: string[];
  countries: string[];
  payGrades: string[];
  currencies: string[];
};
// Module-level cache so filter dropdown options are not re-queried on every analytics load.
let filterOptionsCache: { data: FilterOptions | null; expiresAt: number } = { data: null, expiresAt: 0 };

async function getFilterOptions(): Promise<FilterOptions> {
  const now = Date.now();
  if (filterOptionsCache.data && filterOptionsCache.expiresAt > now) {
    return filterOptionsCache.data;
  }

  const [deptGroups, countryGroups, payGradeGroups, currencyGroups] = await Promise.all([
    prisma.employee.groupBy({ by: ['department'], _count: { _all: true }, orderBy: { department: 'asc' } }),
    prisma.employee.groupBy({ by: ['country'], _count: { _all: true }, orderBy: { country: 'asc' } }),
    prisma.employee.groupBy({ by: ['payGrade'], _count: { _all: true }, orderBy: { payGrade: 'asc' } }),
    prisma.employee.groupBy({ by: ['currency'], _count: { _all: true }, orderBy: { currency: 'asc' } }),
  ]);

  const data: FilterOptions = {
    departments: deptGroups.map((g) => g.department),
    countries: countryGroups.map((g) => g.country),
    payGrades: payGradeGroups.map((g) => g.payGrade),
    currencies: currencyGroups.map((g) => g.currency),
  };

  filterOptionsCache = { data, expiresAt: now + FILTER_OPTIONS_TTL_MS };
  return data;
}

/**
 * Calculates organization-wide or filtered compensation analytics using server-side database aggregations.
 */
export async function getCompensationAnalytics(
  filters: CompensationAnalyticsFilters = {}
): Promise<CompensationAnalyticsResult> {
  const { department, country, payGrade, currency, period = 'quarter' } = filters;

  const where: any = {};
  if (department && department !== 'All') where.department = department;
  if (country && country !== 'All') where.country = country;
  if (payGrade && payGrade !== 'All') where.payGrade = payGrade;
  if (currency && currency !== 'All') where.currency = currency;

  // 1. Filter options for UI dropdowns (cached server-side with a short TTL)
  const filterOptions = await getFilterOptions();

  // 2. Total Employees & Summary Metrics
  const totalEmployees = await prisma.employee.count({ where });

  if (totalEmployees === 0) {
    return {
      filters,
      summary: {
        totalEmployees: 0,
        averageBaseSalary: 0,
        medianBaseSalary: 0,
        minBaseSalary: 0,
        maxBaseSalary: 0,
      },
      salaryDistribution: [
        { range: 'Under $50K', min: 0, max: 50000, count: 0, percentage: 0 },
        { range: '$50K–$100K', min: 50000, max: 100000, count: 0, percentage: 0 },
        { range: '$100K–$150K', min: 100000, max: 150000, count: 0, percentage: 0 },
        { range: '$150K–$200K', min: 150000, max: 200000, count: 0, percentage: 0 },
        { range: '$200K+', min: 200000, max: null, count: 0, percentage: 0 },
      ],
      departmentCompensation: [],
      payGradeCompensation: [],
      bandDistribution: {
        below: { count: 0, percentage: 0 },
        within: { count: 0, percentage: 0 },
        above: { count: 0, percentage: 0 },
        noBand: { count: 0, percentage: 0 },
      },
      countryCompensation: [],
      adjustmentTrends: [],
      filterOptions,
    };
  }

  // Aggregations on baseSalaryUSD
  const aggregate = await prisma.employee.aggregate({
    where,
    _avg: { baseSalaryUSD: true },
    _min: { baseSalaryUSD: true },
    _max: { baseSalaryUSD: true },
  });

  const averageBaseSalary = Math.round((aggregate._avg.baseSalaryUSD || 0) * 100) / 100;
  const minBaseSalary = Math.round((aggregate._min.baseSalaryUSD || 0) * 100) / 100;
  const maxBaseSalary = Math.round((aggregate._max.baseSalaryUSD || 0) * 100) / 100;

  // Server-side Median using indexed query with skip and take
  const midIndex = Math.floor(totalEmployees / 2);
  const isEven = totalEmployees % 2 === 0;
  const medianRows = await prisma.employee.findMany({
    where,
    select: { baseSalaryUSD: true },
    orderBy: { baseSalaryUSD: 'asc' },
    skip: isEven ? Math.max(0, midIndex - 1) : midIndex,
    take: isEven ? 2 : 1,
  });

  let medianBaseSalary = 0;
  if (medianRows.length === 1) {
    medianBaseSalary = medianRows[0].baseSalaryUSD;
  } else if (medianRows.length === 2) {
    medianBaseSalary = Math.round(((medianRows[0].baseSalaryUSD + medianRows[1].baseSalaryUSD) / 2) * 100) / 100;
  }

  // 3. Salary Distribution Buckets — single fetch, bucket counts computed in-memory
  // Also reused for department medians and pay-grade band positioning below (no N+1).
  const employeesForMetrics = await prisma.employee.findMany({
    where,
    select: { department: true, payGrade: true, baseSalaryUSD: true },
  });

  let bUnder50k = 0;
  let b50to100k = 0;
  let b100to150k = 0;
  let b150to200k = 0;
  let bOver200k = 0;
  for (const e of employeesForMetrics) {
    const s = e.baseSalaryUSD ?? 0;
    if (s < 50000) bUnder50k += 1;
    else if (s < 100000) b50to100k += 1;
    else if (s < 150000) b100to150k += 1;
    else if (s < 200000) b150to200k += 1;
    else bOver200k += 1;
  }

  const calcPct = (count: number) => Math.round((count / totalEmployees) * 1000) / 10;

  const salaryDistribution: DistributionBucket[] = [
    { range: 'Under $50K', min: 0, max: 50000, count: bUnder50k, percentage: calcPct(bUnder50k) },
    { range: '$50K–$100K', min: 50000, max: 100000, count: b50to100k, percentage: calcPct(b50to100k) },
    { range: '$100K–$150K', min: 100000, max: 150000, count: b100to150k, percentage: calcPct(b100to150k) },
    { range: '$150K–$200K', min: 150000, max: 200000, count: b150to200k, percentage: calcPct(b150to200k) },
    { range: '$200K+', min: 200000, max: null, count: bOver200k, percentage: calcPct(bOver200k) },
  ];

  // 4. Department Compensation — one query for aggregates + in-memory medians
  const deptSalaryMap = new Map<string, number[]>();
  for (const e of employeesForMetrics) {
    const dep = e.department || 'Unassigned';
    if (!deptSalaryMap.has(dep)) deptSalaryMap.set(dep, []);
    deptSalaryMap.get(dep)!.push(e.baseSalaryUSD ?? 0);
  }

  const deptAggregates = await prisma.employee.groupBy({
    by: ['department'],
    where,
    _count: { _all: true },
    _avg: { baseSalaryUSD: true },
    _min: { baseSalaryUSD: true },
    _max: { baseSalaryUSD: true },
    orderBy: {
      _avg: {
        baseSalaryUSD: 'desc',
      },
    },
  });

  const departmentCompensation: DepartmentCompensation[] = deptAggregates.map((g) => {
    const count = g._count._all;
    return {
      department: g.department,
      employeeCount: count,
      avgSalary: Math.round((g._avg.baseSalaryUSD || 0) * 100) / 100,
      medianSalary: computeMedian(deptSalaryMap.get(g.department) || []),
      minSalary: Math.round((g._min.baseSalaryUSD || 0) * 100) / 100,
      maxSalary: Math.round((g._max.baseSalaryUSD || 0) * 100) / 100,
    };
  });

  // 5. Pay-Grade Analysis & Compa-Ratio / Band Positioning
  const salaryBands = await prisma.salaryBand.findMany({
    where: { currency: 'USD' },
  });

  const bandMap = new Map<string, { minSalary: number; midpointSalary: number; maxSalary: number }>();
  for (const b of salaryBands) {
    bandMap.set(b.payGrade, { minSalary: b.minSalary, midpointSalary: b.midpointSalary, maxSalary: b.maxSalary });
  }

  const payGradeAggregates = await prisma.employee.groupBy({
    by: ['payGrade'],
    where,
    _count: { _all: true },
    _avg: { baseSalaryUSD: true },
    _min: { baseSalaryUSD: true },
    _max: { baseSalaryUSD: true },
    orderBy: { payGrade: 'asc' },
  });

  // Count below/within/above band positioning across all pay grades in a single pass (no N+1).
  const bandCounts = new Map<string, { below: number; within: number; above: number }>();
  let totalNoBand = 0;
  for (const e of employeesForMetrics) {
    const band = bandMap.get(e.payGrade);
    if (!band) {
      totalNoBand += 1;
      continue;
    }
    const salary = e.baseSalaryUSD ?? 0;
    const counts = bandCounts.get(e.payGrade) || { below: 0, within: 0, above: 0 };
    if (salary < band.minSalary) counts.below += 1;
    else if (salary > band.maxSalary) counts.above += 1;
    else counts.within += 1;
    bandCounts.set(e.payGrade, counts);
  }

  let totalBelowBand = 0;
  let totalWithinBand = 0;
  let totalAboveBand = 0;
  for (const counts of bandCounts.values()) {
    totalBelowBand += counts.below;
    totalWithinBand += counts.within;
    totalAboveBand += counts.above;
  }

  const payGradeCompensation: PayGradeCompensation[] = payGradeAggregates.map((g) => {
    const pg = g.payGrade;
    const count = g._count._all;
    const avgSalary = Math.round((g._avg.baseSalaryUSD || 0) * 100) / 100;
    const minSalary = Math.round((g._min.baseSalaryUSD || 0) * 100) / 100;
    const maxSalary = Math.round((g._max.baseSalaryUSD || 0) * 100) / 100;

    const band = bandMap.get(pg);
    if (!band) {
      return {
        payGrade: pg,
        employeeCount: count,
        avgSalary,
        minSalary,
        maxSalary,
        midpointSalary: null,
        avgCompaRatio: null,
        belowBandCount: 0,
        withinBandCount: 0,
        aboveBandCount: 0,
        belowBandPercentage: 0,
        withinBandPercentage: 0,
        aboveBandPercentage: 0,
      };
    }

    const avgCompaRatio = calculateCompaRatio(avgSalary, band.midpointSalary);
    const bandCount = bandCounts.get(pg) || { below: 0, within: 0, above: 0 };

    return {
      payGrade: pg,
      employeeCount: count,
      avgSalary,
      minSalary,
      maxSalary,
      midpointSalary: band.midpointSalary,
      avgCompaRatio,
      belowBandCount: bandCount.below,
      withinBandCount: bandCount.within,
      aboveBandCount: bandCount.above,
      belowBandPercentage: count > 0 ? Math.round((bandCount.below / count) * 1000) / 10 : 0,
      withinBandPercentage: count > 0 ? Math.round((bandCount.within / count) * 1000) / 10 : 0,
      aboveBandPercentage: count > 0 ? Math.round((bandCount.above / count) * 1000) / 10 : 0,
    };
  });

  // 6. Overall Salary Band Distribution
  const bandDistribution: BandDistribution = {
    below: { count: totalBelowBand, percentage: calcPct(totalBelowBand) },
    within: { count: totalWithinBand, percentage: calcPct(totalWithinBand) },
    above: { count: totalAboveBand, percentage: calcPct(totalAboveBand) },
    noBand: { count: totalNoBand, percentage: calcPct(totalNoBand) },
  };

  // 7. Country / Location Compensation
  const countryAggregates = await prisma.employee.groupBy({
    by: ['country'],
    where,
    _count: { _all: true },
    _avg: { baseSalaryUSD: true },
    _min: { baseSalaryUSD: true },
    _max: { baseSalaryUSD: true },
    orderBy: {
      _count: {
        country: 'desc',
      },
    },
  });

  const countryCompensation: CountryCompensation[] = countryAggregates.map((g) => ({
    country: g.country,
    employeeCount: g._count._all,
    avgSalary: Math.round((g._avg.baseSalaryUSD || 0) * 100) / 100,
    minSalary: Math.round((g._min.baseSalaryUSD || 0) * 100) / 100,
    maxSalary: Math.round((g._max.baseSalaryUSD || 0) * 100) / 100,
  }));

  // 8. Salary Adjustment Trends (Using SalaryHistory)
  const salaryHistories = await prisma.salaryHistory.findMany({
    where: {
      employee: where,
    },
    orderBy: { effectiveDate: 'asc' },
    select: {
      id: true,
      employeeId: true,
      amountUSD: true,
      previousAmountUSD: true,
      effectiveDate: true,
      reason: true,
    },
  });

  const periodMap = new Map<
    string,
    {
      adjustmentsCount: number;
      totalChangeUSD: number;
      totalIncreasesUSD: number;
      totalDecreasesUSD: number;
      increaseCount: number;
      decreaseCount: number;
    }
  >();

  // Helper to map date to period key (Month "YYYY-MM" or Quarter "YYYY QX")
  const getPeriodKey = (date: Date) => {
    const year = date.getFullYear();
    if (period === 'month') {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    } else {
      const q = Math.floor(date.getMonth() / 3) + 1;
      return `${year} Q${q}`;
    }
  };

  // Keep track of preceding employee salaries if previousAmountUSD is not present
  const employeeSalaryTracker = new Map<string, number>();

  for (const h of salaryHistories) {
    const date = new Date(h.effectiveDate);
    if (isNaN(date.getTime())) continue;

    const periodKey = getPeriodKey(date);
    let changeUSD = 0;

    if (h.previousAmountUSD !== null && h.previousAmountUSD !== undefined) {
      changeUSD = h.amountUSD - h.previousAmountUSD;
    } else if (employeeSalaryTracker.has(h.employeeId)) {
      const prevSalary = employeeSalaryTracker.get(h.employeeId)!;
      changeUSD = h.amountUSD - prevSalary;
    } else {
      // If no recorded prior salary, assume 0 or amountUSD
      changeUSD = h.amountUSD;
    }

    // Update tracker with latest salary for employee
    employeeSalaryTracker.set(h.employeeId, h.amountUSD);

    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, {
        adjustmentsCount: 0,
        totalChangeUSD: 0,
        totalIncreasesUSD: 0,
        totalDecreasesUSD: 0,
        increaseCount: 0,
        decreaseCount: 0,
      });
    }

    const curr = periodMap.get(periodKey)!;
    curr.adjustmentsCount += 1;
    curr.totalChangeUSD += changeUSD;

    if (changeUSD > 0) {
      curr.totalIncreasesUSD += changeUSD;
      curr.increaseCount += 1;
    } else if (changeUSD < 0) {
      curr.totalDecreasesUSD += changeUSD;
      curr.decreaseCount += 1;
    }
  }

  const adjustmentTrends: AdjustmentTrendPeriod[] = Array.from(periodMap.entries()).map(([pKey, val]) => {
    return {
      period: pKey,
      adjustmentsCount: val.adjustmentsCount,
      totalChangeUSD: Math.round(val.totalChangeUSD * 100) / 100,
      avgChangeUSD:
        val.adjustmentsCount > 0 ? Math.round((val.totalChangeUSD / val.adjustmentsCount) * 100) / 100 : 0,
      totalIncreasesUSD: Math.round(val.totalIncreasesUSD * 100) / 100,
      totalDecreasesUSD: Math.round(val.totalDecreasesUSD * 100) / 100,
      increaseCount: val.increaseCount,
      decreaseCount: val.decreaseCount,
    };
  });

  return {
    filters,
    summary: {
      totalEmployees,
      averageBaseSalary,
      medianBaseSalary,
      minBaseSalary,
      maxBaseSalary,
    },
    salaryDistribution,
    departmentCompensation,
    payGradeCompensation,
    bandDistribution,
    countryCompensation,
    adjustmentTrends,
    filterOptions,
  };
}
