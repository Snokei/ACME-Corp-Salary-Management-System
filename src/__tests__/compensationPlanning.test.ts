import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  createCompensationPlan,
  getCompensationPlanById,
  updateDepartmentAllocations,
  getPlanItems,
  updatePlanItem,
  getScenarioSimulations,
  validatePlan,
  updatePlanStatus,
  deleteCompensationPlan,
} from '@/lib/compensationPlanningService';

describe('Compensation Planning / Budget Module', () => {
  let testPlanId: string;
  let testEmployeeId: string;

  beforeEach(async () => {
    // Clean existing test plans and test employees
    await (prisma as any).compensationPlan.deleteMany({
      where: { name: { contains: 'TEST-PLAN' } },
    });
    await prisma.employee.deleteMany({
      where: { email: { contains: 'test.plan.' } },
    });

    // Create single clean test employee
    const emp = await prisma.employee.create({
      data: {
        employeeId: `TP-${Math.floor(10000 + Math.random() * 90000)}`,
        firstName: 'Plan',
        lastName: 'Tester',
        email: `test.plan.${Date.now()}@acme.com`,
        department: 'Engineering',
        role: 'Software Engineer',
        country: 'United States',
        city: 'San Francisco',
        currency: 'USD',
        baseSalary: 100000,
        baseSalaryUSD: 100000,
        bonusUSD: 10000,
        payGrade: 'L4',
        gender: 'Male',
        hireDate: new Date('2024-01-01'),
        performanceRating: 4,
        status: 'Active',
      },
    });
    testEmployeeId = emp.id;

    // Ensure salary band exists for L4
    await prisma.salaryBand.upsert({
      where: {
        payGrade_currency: { payGrade: 'L4', currency: 'USD' },
      },
      update: { minSalary: 80000, midpointSalary: 100000, maxSalary: 120000 },
      create: { payGrade: 'L4', currency: 'USD', minSalary: 80000, midpointSalary: 100000, maxSalary: 120000 },
    });

    // Create a test plan without populating 10,000 DB employees for fast unit test execution
    const plan = await createCompensationPlan({
      name: 'TEST-PLAN-FY2027',
      fiscalYear: 'FY2027',
      totalBudgetUSD: 500000,
      autoPopulateEmployees: false,
    });
    testPlanId = plan!.id;

    // Add specific test item
    await (prisma as any).compensationPlanItem.create({
      data: {
        planId: testPlanId,
        employeeId: testEmployeeId,
        currentSalaryUSD: 100000,
        proposedSalaryUSD: 100000,
        increaseAmountUSD: 0,
        increasePercentage: 0,
        status: 'Proposed',
      },
    });
  });

  afterAll(async () => {
    await (prisma as any).compensationPlan.deleteMany({
      where: { name: { contains: 'TEST-PLAN' } },
    });
    await prisma.employee.deleteMany({
      where: { email: { contains: 'test.plan.' } },
    });
  });

  it('1. Successfully creates a CompensationPlan', async () => {
    const plan = await getCompensationPlanById(testPlanId);
    expect(plan).toBeDefined();
    expect(plan?.name).toBe('TEST-PLAN-FY2027');
    expect(plan?.totalBudgetUSD).toBe(500000);
    expect(plan?.status).toBe('Draft');
    expect(plan?.metrics.employeesCount).toBe(1);
  });

  it('2. Validates plan total budget cannot be negative', async () => {
    await expect(
      createCompensationPlan({
        name: 'TEST-PLAN-INVALID',
        fiscalYear: 'FY2027',
        totalBudgetUSD: -100,
        autoPopulateEmployees: false,
      })
    ).rejects.toThrowError('Total budget must be a non-negative number');
  });

  it('3. Updates department allocations and validates totals', async () => {
    const allocations = [
      { department: 'Engineering', allocatedBudgetUSD: 300000 },
      { department: 'Sales', allocatedBudgetUSD: 100000 },
    ];
    await updateDepartmentAllocations(testPlanId, allocations);

    const plan = await getCompensationPlanById(testPlanId);
    expect(plan?.metrics.allocatedBudgetUSD).toBe(400000);

    const validation = await validatePlan(testPlanId);
    expect(validation.isValid).toBe(true);
  });

  it('4. Detects validation error when department allocations exceed total budget', async () => {
    const allocations = [
      { department: 'Engineering', allocatedBudgetUSD: 600000 },
    ];
    await updateDepartmentAllocations(testPlanId, allocations);

    const validation = await validatePlan(testPlanId);
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain('exceeds plan budget');
  });

  it('5. Dual-input updates employee proposal: percentage -> salary amount', async () => {
    const itemsRes = await getPlanItems(testPlanId, { search: 'Tester', limit: 50 });
    const targetItem = itemsRes.items.find((i) => i.employeeId === testEmployeeId);

    expect(targetItem).toBeDefined();
    if (targetItem) {
      // 5% increase on $100,000 -> $5,000 increase -> $105,000 proposed salary
      await updatePlanItem(testPlanId, targetItem.id, { increasePercentage: 5.0 });

      const updatedRes = await getPlanItems(testPlanId, { search: 'Tester', limit: 50 });
      const updatedItem = updatedRes.items.find((i) => i.id === targetItem.id);

      expect(updatedItem?.increasePercentage).toBe(5.0);
      expect(updatedItem?.increaseAmountUSD).toBe(5000);
      expect(updatedItem?.proposedSalaryUSD).toBe(105000);
      expect(updatedItem?.newCompaRatio).toBe(105.0); // Midpoint $100k
    }
  });

  it('6. Dual-input updates employee proposal: proposed salary -> percentage', async () => {
    const itemsRes = await getPlanItems(testPlanId, { search: 'Tester', limit: 50 });
    const targetItem = itemsRes.items.find((i) => i.employeeId === testEmployeeId);

    expect(targetItem).toBeDefined();
    if (targetItem) {
      // Proposed salary $110,000 -> 10% increase
      await updatePlanItem(testPlanId, targetItem.id, { proposedSalaryUSD: 110000 });

      const updatedRes = await getPlanItems(testPlanId, { search: 'Tester', limit: 50 });
      const updatedItem = updatedRes.items.find((i) => i.id === targetItem.id);

      expect(updatedItem?.proposedSalaryUSD).toBe(110000);
      expect(updatedItem?.increasePercentage).toBe(10.0);
      expect(updatedItem?.newCompaRatio).toBe(110.0);
    }
  });

  it('7. Disallows salary decreases in proposals', async () => {
    const itemsRes = await getPlanItems(testPlanId, { search: 'Tester', limit: 50 });
    const targetItem = itemsRes.items.find((i) => i.employeeId === testEmployeeId);

    expect(targetItem).toBeDefined();
    if (targetItem) {
      await expect(
        updatePlanItem(testPlanId, targetItem.id, { proposedSalaryUSD: 90000 })
      ).rejects.toThrowError('Salary decreases are not allowed');
    }
  });

  it('8. Scenario planning calculates impact without mutating actual proposals', async () => {
    const scenarios = await getScenarioSimulations(testPlanId, [3, 5, 7]);
    expect(scenarios.length).toBe(3);
    expect(scenarios[0].name).toBe('Scenario A — 3% Increase');
    expect(scenarios[0].averageIncreasePct).toBe(3);
    expect(scenarios[1].name).toBe('Scenario B — 5% Increase');
    expect(scenarios[2].name).toBe('Scenario C — 7% Increase');
  });

  it('9. Executes workflow status transitions correctly', async () => {
    // Draft -> In Review
    await updatePlanStatus(testPlanId, 'In Review');
    let plan = await getCompensationPlanById(testPlanId);
    expect(plan?.status).toBe('In Review');

    // In Review -> Approved
    await updatePlanStatus(testPlanId, 'Approved');
    plan = await getCompensationPlanById(testPlanId);
    expect(plan?.status).toBe('Approved');
  });

  it('10. Finalizing plan applies salary increases to Employee and creates SalaryHistory records', async () => {
    // Set 8% increase for test employee
    const itemsRes = await getPlanItems(testPlanId, { search: 'Tester', limit: 50 });
    const targetItem = itemsRes.items.find((i) => i.employeeId === testEmployeeId);
    if (targetItem) {
      await updatePlanItem(testPlanId, targetItem.id, { increasePercentage: 8.0 });
    }

    // Move to Approved then Finalized
    await updatePlanStatus(testPlanId, 'In Review');
    await updatePlanStatus(testPlanId, 'Approved');
    await updatePlanStatus(testPlanId, 'Finalized');

    // Check Employee base salary updated to $108,000
    const emp = await prisma.employee.findUnique({ where: { id: testEmployeeId } });
    expect(emp?.baseSalaryUSD).toBe(108000);

    // Check SalaryHistory record created
    const history = await prisma.salaryHistory.findFirst({
      where: { employeeId: testEmployeeId, reason: { contains: 'Annual Compensation Review' } },
    });
    expect(history).toBeDefined();
    expect(history?.amountUSD).toBe(108000);
    expect(history?.previousAmountUSD).toBe(100000);
  });

  it('11. Blocks deletion of Finalized plans unless force flag is specified', async () => {
    // Move to Finalized
    await updatePlanStatus(testPlanId, 'In Review');
    await updatePlanStatus(testPlanId, 'Approved');
    await updatePlanStatus(testPlanId, 'Finalized');

    // Attempt deletion without force -> throws error
    await expect(deleteCompensationPlan(testPlanId, false)).rejects.toThrowError(
      'Cannot delete plan in "Finalized" status. Use force delete to remove as Admin.'
    );

    // Attempt deletion with force = true -> succeeds
    const res = await deleteCompensationPlan(testPlanId, true);
    expect(res.success).toBe(true);

    const check = await prisma.compensationPlan.findUnique({ where: { id: testPlanId } });
    expect(check).toBeNull();
  });
});
