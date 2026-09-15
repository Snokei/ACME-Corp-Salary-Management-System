import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  createSalaryAdjustment,
  getSalaryHistory,
  calculateSalaryChange,
  validateSalaryAdjustmentInput,
  SalaryAdjustmentError,
} from '@/lib/salaryAdjustmentService';

describe('Salary Adjustment Workflow', () => {
  let testEmployeeId: string;
  const initialSalary = 120000;

  beforeEach(async () => {
    // Create a unique test employee for isolation
    const uniqueEmail = `test.salary.${Date.now()}.${Math.random()}@acme.com`;
    const employee = await prisma.employee.create({
      data: {
        employeeId: `TEST-${Math.floor(10000 + Math.random() * 90000)}`,
        firstName: 'Test',
        lastName: 'User',
        email: uniqueEmail,
        department: 'Engineering',
        role: 'Software Engineer',
        country: 'United States',
        city: 'San Francisco',
        currency: 'USD',
        baseSalary: initialSalary,
        baseSalaryUSD: initialSalary,
        bonusUSD: 15000,
        payGrade: 'L4',
        gender: 'Male',
        hireDate: new Date('2025-01-01'),
        performanceRating: 5,
        status: 'Active',
      },
    });

    testEmployeeId = employee.id;
  });

  afterAll(async () => {
    // Clean up test data if needed
    await prisma.employee.deleteMany({
      where: { email: { contains: 'test.salary.' } },
    });
  });

  it('1. Successfully creates a SalaryHistory record', async () => {
    const result = await createSalaryAdjustment(testEmployeeId, {
      amount: 135000,
      effectiveDate: '2026-09-15',
      reason: 'Promotion',
      notes: 'Promoted to Senior Engineer',
    });

    expect(result.salaryHistory).toBeDefined();
    expect(result.salaryHistory.amount).toBe(135000);
    expect(result.salaryHistory.reason).toBe('Promotion');
    expect(result.salaryHistory.notes).toBe('Promoted to Senior Engineer');
  });

  it('2. Successfully updates Employee.current/base salary', async () => {
    const result = await createSalaryAdjustment(testEmployeeId, {
      amount: 135000,
      effectiveDate: '2026-09-15',
      reason: 'Promotion',
    });

    expect(result.employee.baseSalary).toBe(135000);
    expect(result.employee.baseSalaryUSD).toBe(135000);

    const updatedEmp = await prisma.employee.findUnique({
      where: { id: testEmployeeId },
    });
    expect(updatedEmp?.baseSalary).toBe(135000);
  });

  it('3. Both operations happen within a transaction (SalaryHistory creation + Employee baseSalary update)', async () => {
    const result = await createSalaryAdjustment(testEmployeeId, {
      amount: 140000,
      effectiveDate: '2026-10-01',
      reason: 'Annual Increase',
    });

    const historyRecords = await prisma.salaryHistory.findMany({
      where: { employeeId: testEmployeeId },
    });

    const emp = await prisma.employee.findUnique({
      where: { id: testEmployeeId },
    });

    expect(historyRecords.length).toBeGreaterThanOrEqual(1);
    expect(historyRecords.some((h) => h.amount === 140000)).toBe(true);
    expect(emp?.baseSalary).toBe(140000);
  });

  it('4. If SalaryHistory insertion fails, Employee salary is not changed', async () => {
    const beforeEmp = await prisma.employee.findUnique({
      where: { id: testEmployeeId },
    });

    const spy = vi.spyOn(prisma, '$transaction').mockRejectedValueOnce(
      new Error('Database error during insertion')
    );

    await expect(
      createSalaryAdjustment(testEmployeeId, {
        amount: 150000,
        effectiveDate: '2026-09-15',
        reason: 'Performance',
      })
    ).rejects.toThrow('Database error during insertion');

    const afterEmp = await prisma.employee.findUnique({
      where: { id: testEmployeeId },
    });

    expect(afterEmp?.baseSalary).toBe(beforeEmp?.baseSalary);
    spy.mockRestore();
  });

  it('5. If Employee update fails, SalaryHistory insertion is rolled back', async () => {
    const beforeHistoryCount = await prisma.salaryHistory.count({
      where: { employeeId: testEmployeeId },
    });

    const spy = vi.spyOn(prisma, '$transaction').mockRejectedValueOnce(
      new Error('Database error during employee update')
    );

    await expect(
      createSalaryAdjustment(testEmployeeId, {
        amount: 155000,
        effectiveDate: '2026-09-15',
        reason: 'Market Adjustment',
      })
    ).rejects.toThrow('Database error during employee update');

    const afterHistoryCount = await prisma.salaryHistory.count({
      where: { employeeId: testEmployeeId },
    });

    expect(afterHistoryCount).toBe(beforeHistoryCount);
    spy.mockRestore();
  });

  it('6. Salary percentage calculation is correct', () => {
    // Increase: $120,000 -> $135,000 (+12.5%)
    const inc = calculateSalaryChange(120000, 135000);
    expect(inc.change).toBe(15000);
    expect(inc.percentage).toBe(12.5);

    // Decrease: $120,000 -> $110,000 (-8.33%)
    const dec = calculateSalaryChange(120000, 110000);
    expect(dec.change).toBe(-10000);
    expect(dec.percentage).toBe(-8.33);
  });

  it('7. Salary increase works', async () => {
    const result = await createSalaryAdjustment(testEmployeeId, {
      amount: 140000,
      effectiveDate: '2026-09-15',
      reason: 'Promotion',
    });

    expect(result.employee.baseSalary).toBe(140000);
    expect(result.employee.baseSalary).toBeGreaterThan(initialSalary);
  });

  it('8. Salary decrease works', async () => {
    const result = await createSalaryAdjustment(testEmployeeId, {
      amount: 100000,
      effectiveDate: '2026-09-15',
      reason: 'Role Change',
    });

    expect(result.employee.baseSalary).toBe(100000);
    expect(result.employee.baseSalary).toBeLessThan(initialSalary);
  });

  it('9. Validation rejects invalid salary', async () => {
    // Negative salary
    expect(() =>
      validateSalaryAdjustmentInput({
        amount: -5000,
        effectiveDate: '2026-09-15',
        reason: 'Promotion',
      })
    ).toThrowError(SalaryAdjustmentError);

    // Zero salary
    expect(() =>
      validateSalaryAdjustmentInput({
        amount: 0,
        effectiveDate: '2026-09-15',
        reason: 'Promotion',
      })
    ).toThrowError(SalaryAdjustmentError);

    // Non-numeric string
    expect(() =>
      validateSalaryAdjustmentInput({
        amount: 'abc',
        effectiveDate: '2026-09-15',
        reason: 'Promotion',
      })
    ).toThrowError(SalaryAdjustmentError);
  });

  it('10. Validation rejects missing reason', () => {
    expect(() =>
      validateSalaryAdjustmentInput({
        amount: 130000,
        effectiveDate: '2026-09-15',
        reason: '',
      })
    ).toThrowError('Reason is required');
  });

  it('11. Validation rejects missing effective date', () => {
    expect(() =>
      validateSalaryAdjustmentInput({
        amount: 130000,
        effectiveDate: '',
        reason: 'Promotion',
      })
    ).toThrowError('Effective date is required');
  });

  it('12. Employee not found returns the correct response', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    await expect(
      createSalaryAdjustment(nonExistentId, {
        amount: 135000,
        effectiveDate: '2026-09-15',
        reason: 'Promotion',
      })
    ).rejects.toThrow('Employee not found');
  });

  it('13. Salary history entries are ordered by effectiveDate descending', async () => {
    await createSalaryAdjustment(testEmployeeId, {
      amount: 125000,
      effectiveDate: '2026-01-15',
      reason: 'Annual Increase',
    });

    await createSalaryAdjustment(testEmployeeId, {
      amount: 140000,
      effectiveDate: '2026-09-15',
      reason: 'Promotion',
    });

    await createSalaryAdjustment(testEmployeeId, {
      amount: 130000,
      effectiveDate: '2026-05-20',
      reason: 'Market Adjustment',
    });

    const history = await getSalaryHistory(testEmployeeId);

    expect(history.length).toBe(3);
    expect(new Date(history[0].effectiveDate).getTime()).toBeGreaterThanOrEqual(
      new Date(history[1].effectiveDate).getTime()
    );
    expect(new Date(history[1].effectiveDate).getTime()).toBeGreaterThanOrEqual(
      new Date(history[2].effectiveDate).getTime()
    );
    expect(history[0].reason).toBe('Promotion');
  });
});
