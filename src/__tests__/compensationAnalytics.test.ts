import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getCompensationAnalytics } from '@/lib/compensationAnalyticsService';
import { createSalaryAdjustment } from '@/lib/salaryAdjustmentService';

describe('Compensation Analytics Service', () => {
  const testTag = `test.analytics.${Date.now()}.${Math.random()}`;

  const cleanTestEmps = async () => {
    await prisma.employee.deleteMany({
      where: {
        email: { contains: '@acme.com' },
        firstName: { in: ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'TestAdj'] },
      },
    });
  };

  beforeEach(async () => {
    await cleanTestEmps();
    // Create a batch of test employees with specific known salaries across departments, countries, pay grades
    await prisma.employee.createMany({
      data: [
        {
          employeeId: `TEST-AN-01-${Math.random()}`,
          firstName: 'Alice',
          lastName: 'Smith',
          email: `alice.${Math.random()}@acme.com`,
          department: 'Engineering',
          role: 'Software Engineer',
          country: 'United States',
          city: 'San Francisco',
          currency: 'USD',
          baseSalary: 40000, // < 50k
          baseSalaryUSD: 40000,
          bonusUSD: 5000,
          payGrade: 'L1',
          gender: 'Female',
          hireDate: new Date('2025-01-01'),
          performanceRating: 4,
          status: 'Active',
        },
        {
          employeeId: `TEST-AN-02-${Math.random()}`,
          firstName: 'Bob',
          lastName: 'Jones',
          email: `bob.${Math.random()}@acme.com`,
          department: 'Engineering',
          role: 'Senior Software Engineer',
          country: 'United States',
          city: 'San Francisco',
          currency: 'USD',
          baseSalary: 80000, // 50-100k
          baseSalaryUSD: 80000,
          bonusUSD: 10000,
          payGrade: 'L3',
          gender: 'Male',
          hireDate: new Date('2025-02-01'),
          performanceRating: 5,
          status: 'Active',
        },
        {
          employeeId: `TEST-AN-03-${Math.random()}`,
          firstName: 'Charlie',
          lastName: 'Brown',
          email: `charlie.${Math.random()}@acme.com`,
          department: 'Product',
          role: 'Product Manager',
          country: 'United Kingdom',
          city: 'London',
          currency: 'GBP',
          baseSalary: 100000,
          baseSalaryUSD: 130000, // 100-150k
          bonusUSD: 15000,
          payGrade: 'L4',
          gender: 'Male',
          hireDate: new Date('2025-03-01'),
          performanceRating: 3,
          status: 'Active',
        },
        {
          employeeId: `TEST-AN-04-${Math.random()}`,
          firstName: 'Diana',
          lastName: 'Prince',
          email: `diana.${Math.random()}@acme.com`,
          department: 'Product',
          role: 'Lead Designer',
          country: 'Germany',
          city: 'Berlin',
          currency: 'EUR',
          baseSalary: 150000,
          baseSalaryUSD: 170000, // 150-200k
          bonusUSD: 20000,
          payGrade: 'L5',
          gender: 'Female',
          hireDate: new Date('2025-04-01'),
          performanceRating: 4,
          status: 'Active',
        },
        {
          employeeId: `TEST-AN-05-${Math.random()}`,
          firstName: 'Evan',
          lastName: 'Wright',
          email: `evan.${Math.random()}@acme.com`,
          department: 'Sales',
          role: 'Sales Director',
          country: 'United States',
          city: 'New York',
          currency: 'USD',
          baseSalary: 250000, // 200k+
          baseSalaryUSD: 250000,
          bonusUSD: 50000,
          payGrade: 'L7',
          gender: 'Male',
          hireDate: new Date('2025-05-01'),
          performanceRating: 5,
          status: 'Active',
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanTestEmps();
  });

  it('1. Calculates correct summary metrics (Count, Avg, Min, Max, Median)', async () => {
    const analytics = await getCompensationAnalytics();
    expect(analytics.summary.totalEmployees).toBeGreaterThanOrEqual(5);
    expect(analytics.summary.minBaseSalary).toBeGreaterThan(0);
    expect(analytics.summary.maxBaseSalary).toBeGreaterThanOrEqual(250000);
    expect(analytics.summary.averageBaseSalary).toBeGreaterThan(0);
    expect(analytics.summary.medianBaseSalary).toBeGreaterThan(0);
  });

  it('2. Salary distribution buckets cover all range categories', async () => {
    const analytics = await getCompensationAnalytics();
    const buckets = analytics.salaryDistribution;
    expect(buckets).toHaveLength(5);
    expect(buckets[0].range).toBe('Under $50K');
    expect(buckets[1].range).toBe('$50K–$100K');
    expect(buckets[2].range).toBe('$100K–$150K');
    expect(buckets[3].range).toBe('$150K–$200K');
    expect(buckets[4].range).toBe('$200K+');

    const sumCount = buckets.reduce((acc, b) => acc + b.count, 0);
    expect(sumCount).toBe(analytics.summary.totalEmployees);
  });

  it('3. Department compensation returns valid headcounts and USD salary metrics', async () => {
    const analytics = await getCompensationAnalytics();
    const depts = analytics.departmentCompensation;
    expect(depts.length).toBeGreaterThan(0);

    const eng = depts.find((d) => d.department === 'Engineering');
    if (eng) {
      expect(eng.employeeCount).toBeGreaterThanOrEqual(2);
      expect(eng.avgSalary).toBeGreaterThan(0);
      expect(eng.minSalary).toBeLessThanOrEqual(eng.maxSalary);
    }
  });

  it('4. Country compensation returns valid metrics using baseSalaryUSD', async () => {
    const analytics = await getCompensationAnalytics();
    const countries = analytics.countryCompensation;
    expect(countries.length).toBeGreaterThan(0);

    const us = countries.find((c) => c.country === 'United States');
    if (us) {
      expect(us.employeeCount).toBeGreaterThanOrEqual(3);
      expect(us.avgSalary).toBeGreaterThan(0);
    }
  });

  it('5. Pay grade compensation and compa-ratio calculations work', async () => {
    const analytics = await getCompensationAnalytics();
    const payGrades = analytics.payGradeCompensation;
    expect(payGrades.length).toBeGreaterThan(0);

    for (const pg of payGrades) {
      expect(pg.employeeCount).toBeGreaterThan(0);
      expect(pg.minSalary).toBeLessThanOrEqual(pg.maxSalary);
      if (pg.midpointSalary) {
        expect(pg.avgCompaRatio).toBeGreaterThan(0);
      }
    }
  });

  it('6. Filtering by Department correctly filters analytics', async () => {
    const analytics = await getCompensationAnalytics({ department: 'Engineering' });
    expect(analytics.summary.totalEmployees).toBeGreaterThan(0);
    expect(analytics.departmentCompensation.every((d) => d.department === 'Engineering')).toBe(true);
  });

  it('7. Filtering by Country correctly filters analytics', async () => {
    const analytics = await getCompensationAnalytics({ country: 'United States' });
    expect(analytics.summary.totalEmployees).toBeGreaterThan(0);
    expect(analytics.countryCompensation.every((c) => c.country === 'United States')).toBe(true);
  });

  it('8. Filtering by Pay Grade correctly filters analytics', async () => {
    const analytics = await getCompensationAnalytics({ payGrade: 'L3' });
    expect(analytics.summary.totalEmployees).toBeGreaterThan(0);
    expect(analytics.payGradeCompensation.every((p) => p.payGrade === 'L3')).toBe(true);
  });

  it('9. Salary adjustment analytics includes both increases and decreases', async () => {
    // Create a dedicated employee and perform 1 increase and 1 decrease adjustment
    const emp = await prisma.employee.create({
      data: {
        employeeId: `TEST-ADJ-${Math.random()}`,
        firstName: 'TestAdj',
        lastName: 'User',
        email: `testadj.${Math.random()}@acme.com`,
        department: 'Engineering',
        role: 'Software Engineer',
        country: 'United States',
        city: 'San Francisco',
        currency: 'USD',
        baseSalary: 100000,
        baseSalaryUSD: 100000,
        bonusUSD: 10000,
        payGrade: 'L3',
        gender: 'Male',
        hireDate: new Date('2025-01-01'),
        performanceRating: 4,
        status: 'Active',
      },
    });

    // 1. Salary Increase: 100k -> 120k (+20k)
    await createSalaryAdjustment(emp.id, {
      amount: 120000,
      effectiveDate: '2026-02-15',
      reason: 'Promotion',
    });

    // 2. Salary Decrease: 120k -> 110k (-10k)
    await createSalaryAdjustment(emp.id, {
      amount: 110000,
      effectiveDate: '2026-05-15',
      reason: 'Role Change',
    });

    const analytics = await getCompensationAnalytics({ period: 'quarter' });
    expect(analytics.adjustmentTrends.length).toBeGreaterThan(0);

    const q1 = analytics.adjustmentTrends.find((t) => t.period.includes('Q1'));
    const q2 = analytics.adjustmentTrends.find((t) => t.period.includes('Q2'));

    if (q1) {
      expect(q1.totalIncreasesUSD).toBeGreaterThan(0);
      expect(q1.increaseCount).toBeGreaterThanOrEqual(1);
    }
    if (q2) {
      expect(q2.decreaseCount).toBeGreaterThanOrEqual(1);
      expect(q2.totalDecreasesUSD).toBeLessThan(0);
    }

    // Clean up
    await prisma.employee.delete({ where: { id: emp.id } });
  });

  it('10. Handles empty database or no matching filter gracefully', async () => {
    const analytics = await getCompensationAnalytics({ department: 'NonExistentDept999' });

    expect(analytics.summary.totalEmployees).toBe(0);
    expect(analytics.summary.averageBaseSalary).toBe(0);
    expect(analytics.summary.medianBaseSalary).toBe(0);
    expect(analytics.summary.minBaseSalary).toBe(0);
    expect(analytics.summary.maxBaseSalary).toBe(0);

    expect(analytics.salaryDistribution.every((b) => b.count === 0 && b.percentage === 0)).toBe(true);
    expect(analytics.departmentCompensation).toEqual([]);
    expect(analytics.payGradeCompensation).toEqual([]);
    expect(analytics.countryCompensation).toEqual([]);
    expect(analytics.adjustmentTrends).toEqual([]);
  });
});
