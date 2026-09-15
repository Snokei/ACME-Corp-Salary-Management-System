import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  calculateCompaRatio,
  calculatePositionInBand,
  validateSalaryBandInput,
  getCompensationAnalysis,
  createSalaryBand,
  SalaryBandError,
} from '@/lib/compaRatioService';
import { createSalaryAdjustment } from '@/lib/salaryAdjustmentService';

describe('Salary Bands & Compa-Ratio Feature', () => {
  let testBandId: string;
  let testEmployeeId: string;

  beforeEach(async () => {
    // Ensure clean state for test band grade 'TEST-L4'
    await prisma.salaryBand.deleteMany({
      where: { payGrade: 'TEST-L4' },
    });

    const band = await prisma.salaryBand.create({
      data: {
        payGrade: 'TEST-L4',
        currency: 'USD',
        minSalary: 90000,
        midpointSalary: 120000,
        maxSalary: 150000,
      },
    });
    testBandId = band.id;

    // Create test employee with pay grade 'TEST-L4'
    const uniqueEmail = `test.band.${Date.now()}.${Math.random()}@acme.com`;
    const emp = await prisma.employee.create({
      data: {
        employeeId: `TB-${Math.floor(10000 + Math.random() * 90000)}`,
        firstName: 'Band',
        lastName: 'Tester',
        email: uniqueEmail,
        department: 'Engineering',
        role: 'Senior Engineer',
        country: 'United States',
        city: 'San Francisco',
        currency: 'USD',
        baseSalary: 115000,
        baseSalaryUSD: 115000,
        bonusUSD: 15000,
        payGrade: 'TEST-L4',
        gender: 'Female',
        hireDate: new Date('2025-01-01'),
        performanceRating: 5,
        status: 'Active',
      },
    });
    testEmployeeId = emp.id;
  });

  afterAll(async () => {
    await prisma.salaryBand.deleteMany({
      where: { payGrade: { contains: 'TEST-' } },
    });
    await prisma.employee.deleteMany({
      where: { email: { contains: 'test.band.' } },
    });
  });

  it('1. Successfully creates a SalaryBand record', async () => {
    const created = await createSalaryBand({
      payGrade: 'TEST-L5',
      currency: 'USD',
      minSalary: 120000,
      midpointSalary: 150000,
      maxSalary: 190000,
    });

    expect(created).toBeDefined();
    expect(created.payGrade).toBe('TEST-L5');
    expect(created.midpointSalary).toBe(150000);
  });

  it('2. Validates positive salary values for SalaryBand', () => {
    expect(() =>
      validateSalaryBandInput({
        payGrade: 'TEST-ERR',
        minSalary: -1000,
        midpointSalary: 100000,
        maxSalary: 150000,
      })
    ).toThrowError('Minimum salary must be a valid positive number');
  });

  it('3. Validates min < midpoint < max restriction', () => {
    // min >= midpoint
    expect(() =>
      validateSalaryBandInput({
        payGrade: 'TEST-ERR',
        minSalary: 120000,
        midpointSalary: 100000,
        maxSalary: 150000,
      })
    ).toThrowError('Minimum salary must be less than midpoint salary');

    // midpoint >= max
    expect(() =>
      validateSalaryBandInput({
        payGrade: 'TEST-ERR',
        minSalary: 90000,
        midpointSalary: 160000,
        maxSalary: 150000,
      })
    ).toThrowError('Midpoint salary must be less than maximum salary');
  });

  it('4. Prevents duplicate payGrade + currency combinations', async () => {
    await expect(
      createSalaryBand({
        payGrade: 'TEST-L4',
        currency: 'USD',
        minSalary: 95000,
        midpointSalary: 125000,
        maxSalary: 155000,
      })
    ).rejects.toThrowError(SalaryBandError);
  });

  it('5. Compa-ratio calculation accuracy', () => {
    // $90,000 / $100,000 * 100 = 90.0%
    const compa = calculateCompaRatio(90000, 100000);
    expect(compa).toBe(90.0);
  });

  it('6. Compa-ratio rounding to one decimal place', () => {
    // $115,000 / $120,000 * 100 = 95.8333... -> 95.8%
    const compa = calculateCompaRatio(115000, 120000);
    expect(compa).toBe(95.8);
  });

  it('7. Position-in-band calculation accuracy', () => {
    // Salary = $90k, Min = $80k, Max = $120k -> (90k - 80k)/(120k - 80k) = 10k/40k = 25%
    const pos = calculatePositionInBand(90000, 80000, 120000);
    expect(pos.positionInBand).toBe(25.0);
    expect(pos.status).toBe('Within Band');
    expect(pos.displayPosition).toBe('25.0%');
  });

  it('8. Detects Employee Below Band correctly', () => {
    // Min = $90k, Max = $150k, Salary = $80k (< 90k)
    const pos = calculatePositionInBand(80000, 90000, 150000);
    expect(pos.status).toBe('Below Band');
    expect(pos.visualPercent).toBe(0);
    expect(pos.displayPosition).toBe('Below 0%');
  });

  it('9. Detects Employee Within Band correctly', () => {
    // Min = $90k, Max = $150k, Salary = $120k
    const pos = calculatePositionInBand(120000, 90000, 150000);
    expect(pos.status).toBe('Within Band');
    expect(pos.positionInBand).toBe(50.0);
  });

  it('10. Detects Employee Above Band correctly', () => {
    // Min = $90k, Max = $150k, Salary = $160k (> 150k)
    const pos = calculatePositionInBand(160000, 90000, 150000);
    expect(pos.status).toBe('Above Band');
    expect(pos.visualPercent).toBe(100);
    expect(pos.displayPosition).toBe('Above 100%');
  });

  it('11. Safely handles employee with no matching salary band', async () => {
    const analysis = await getCompensationAnalysis(100000, 'NON-EXISTENT-GRADE', 'USD');
    expect(analysis.hasBand).toBe(false);
    expect(analysis.status).toBe('No Matching Band');
    expect(analysis.compaRatio).toBeNull();
    expect(analysis.positionInBand).toBeNull();
  });

  it('12. Salary adjustment correctly reflects new compa-ratio dynamically', async () => {
    // Initial analysis ($115,000 salary against TEST-L4 band [90k - 120k - 150k])
    const initialAnalysis = await getCompensationAnalysis(115000, 'TEST-L4', 'USD');
    expect(initialAnalysis.compaRatio).toBe(95.8);

    // Apply salary adjustment to $135,000
    await createSalaryAdjustment(testEmployeeId, {
      amount: 135000,
      effectiveDate: '2026-09-16',
      reason: 'Promotion',
    });

    const updatedEmp = await prisma.employee.findUnique({
      where: { id: testEmployeeId },
    });
    expect(updatedEmp?.baseSalary).toBe(135000);

    // New compa-ratio analysis ($135,000 / $120,000 = 112.5%)
    const newAnalysis = await getCompensationAnalysis(updatedEmp!.baseSalary, updatedEmp!.payGrade, updatedEmp!.currency);
    expect(newAnalysis.compaRatio).toBe(112.5);
    expect(newAnalysis.positionInBand).toBe(75.0);
    expect(newAnalysis.status).toBe('Within Band');
  });
});
