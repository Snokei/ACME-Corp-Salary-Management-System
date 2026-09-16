import { prisma } from '@/lib/prisma';
import { calculateCompaRatio, getCompensationAnalysis } from '@/lib/compaRatioService';
import { createAuditLog } from '@/lib/auditLogService';

export type PlanStatus = 'Draft' | 'In Review' | 'Approved' | 'Rejected' | 'Finalized';


export interface PlanSummaryMetrics {
  totalBudgetUSD: number;
  allocatedBudgetUSD: number;
  plannedIncreaseUSD: number;
  remainingBudgetUSD: number;
  utilizationPercentage: number;
  employeesCount: number;
  averageIncreasePercentage: number;
}

export interface DepartmentBudgetSummary {
  department: string;
  employeeCount: number;
  currentPayrollUSD: number;
  allocatedBudgetUSD: number;
  plannedIncreaseUSD: number;
  remainingBudgetUSD: number;
  utilizationPercentage: number;
}

export interface EmployeePlanningItemWithAnalysis {
  id: string;
  planId: string;
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: string;
  role: string;
  payGrade: string;
  avatarUrl: string;
  currentSalaryUSD: number;
  proposedSalaryUSD: number;
  increaseAmountUSD: number;
  increasePercentage: number;
  currentCompaRatio: number | null;
  newCompaRatio: number | null;
  bandMin: number | null;
  bandMid: number | null;
  bandMax: number | null;
  bandStatus: string;
  status: string;
}

export interface ScenarioSimulationResult {
  id: string;
  name: string;
  increasePct: number;
  totalAdditionalCompUSD: number;
  remainingBudgetUSD: number;
  averageIncreasePct: number;
  employeesAffected: number;
  utilizationPercentage: number;
}

export interface PlanValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class CompensationPlanningError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'CompensationPlanningError';
    this.statusCode = statusCode;
  }
}

/**
 * Ensures Prisma model access is safe across development hot-reloads.
 */
function getModels() {
  const p = prisma as any;
  if (!p.compensationPlan || !p.compensationPlanDepartment || !p.compensationPlanItem) {
    throw new CompensationPlanningError('Compensation planning models are not available. Please restart the dev server.', 500);
  }
  return {
    plan: p.compensationPlan,
    dept: p.compensationPlanDepartment,
    item: p.compensationPlanItem,
    employee: p.employee,
    salaryHistory: p.salaryHistory,
    salaryBand: p.salaryBand,
  };
}

/**
 * Calculates overall plan summary metrics.
 */
export async function getPlanSummaryMetrics(planId: string): Promise<PlanSummaryMetrics> {
  const models = getModels();

  const plan = await models.plan.findUnique({
    where: { id: planId },
    include: {
      departments: true,
      items: true,
    },
  });

  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  const totalBudgetUSD = plan.totalBudgetUSD || 0;
  
  const allocatedBudgetUSD = plan.departments.reduce(
    (sum: number, d: any) => sum + (d.allocatedBudgetUSD || 0),
    0
  );

  const plannedIncreaseUSD = plan.items.reduce(
    (sum: number, i: any) => sum + (i.increaseAmountUSD || 0),
    0
  );

  const remainingBudgetUSD = totalBudgetUSD - plannedIncreaseUSD;

  const utilizationPercentage =
    totalBudgetUSD > 0
      ? Math.round((plannedIncreaseUSD / totalBudgetUSD) * 1000) / 10
      : 0;

  const employeesCount = plan.items.length;

  const sumIncreasePct = plan.items.reduce(
    (sum: number, i: any) => sum + (i.increasePercentage || 0),
    0
  );

  const averageIncreasePercentage =
    employeesCount > 0
      ? Math.round((sumIncreasePct / employeesCount) * 10) / 10
      : 0;

  return {
    totalBudgetUSD,
    allocatedBudgetUSD,
    plannedIncreaseUSD,
    remainingBudgetUSD,
    utilizationPercentage,
    employeesCount,
    averageIncreasePercentage,
  };
}

/**
 * Retrieves all compensation plans.
 */
export async function getAllCompensationPlans(filters?: {
  fiscalYear?: string;
  status?: string;
  search?: string;
}) {
  const models = getModels();

  const where: any = {};
  if (filters?.fiscalYear && filters.fiscalYear !== 'All') {
    where.fiscalYear = filters.fiscalYear;
  }
  if (filters?.status && filters.status !== 'All') {
    where.status = filters.status;
  }
  if (filters?.search && filters.search.trim()) {
    const s = filters.search.trim();
    where.OR = [
      { name: { contains: s } },
      { fiscalYear: { contains: s } },
      { createdBy: { contains: s } },
    ];
  }

  const plans = await models.plan.findMany({
    where,
    include: {
      departments: true,
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate summaries for each plan
  const result = plans.map((p: any) => {
    const totalBudgetUSD = p.totalBudgetUSD || 0;
    const allocatedBudgetUSD = p.departments.reduce(
      (sum: number, d: any) => sum + (d.allocatedBudgetUSD || 0),
      0
    );
    const plannedIncreaseUSD = p.items.reduce(
      (sum: number, i: any) => sum + (i.increaseAmountUSD || 0),
      0
    );
    const remainingBudgetUSD = totalBudgetUSD - plannedIncreaseUSD;
    const utilizationPercentage =
      totalBudgetUSD > 0
        ? Math.round((plannedIncreaseUSD / totalBudgetUSD) * 1000) / 10
        : 0;
    const employeesCount = p.items.length;
    const sumIncreasePct = p.items.reduce(
      (sum: number, i: any) => sum + (i.increasePercentage || 0),
      0
    );
    const averageIncreasePercentage =
      employeesCount > 0
        ? Math.round((sumIncreasePct / employeesCount) * 10) / 10
        : 0;

    return {
      id: p.id,
      name: p.name,
      fiscalYear: p.fiscalYear,
      totalBudgetUSD,
      status: p.status,
      createdBy: p.createdBy,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      metrics: {
        totalBudgetUSD,
        allocatedBudgetUSD,
        plannedIncreaseUSD,
        remainingBudgetUSD,
        utilizationPercentage,
        employeesCount,
        averageIncreasePercentage,
      },
    };
  });

  return result;
}

/**
 * Fetches single plan details with full summary metrics.
 */
export async function getCompensationPlanById(id: string) {
  const models = getModels();

  const plan = await models.plan.findUnique({
    where: { id },
    include: {
      departments: {
        orderBy: { department: 'asc' },
      },
    },
  });

  if (!plan) {
    return null;
  }

  const metrics = await getPlanSummaryMetrics(id);
  const validation = await validatePlan(id);

  return {
    ...plan,
    metrics,
    validation,
  };
}

/**
 * Creates a new compensation plan and optionally populates department allocations & employees.
 */
export async function createCompensationPlan(data: {
  name: string;
  fiscalYear: string;
  totalBudgetUSD: number;
  createdBy?: string;
  initialDepartmentAllocations?: Record<string, number>;
  autoPopulateEmployees?: boolean;
}) {
  const models = getModels();

  if (!data.name || !data.name.trim()) {
    throw new CompensationPlanningError('Plan name is required', 400);
  }
  if (!data.fiscalYear || !data.fiscalYear.trim()) {
    throw new CompensationPlanningError('Fiscal year is required', 400);
  }
  if (data.totalBudgetUSD === undefined || data.totalBudgetUSD < 0 || isNaN(data.totalBudgetUSD)) {
    throw new CompensationPlanningError('Total budget must be a non-negative number', 400);
  }

  // Check duplicate plan name/fiscalYear combination if desired
  const existing = await models.plan.findFirst({
    where: {
      name: { equals: data.name.trim() },
      fiscalYear: { equals: data.fiscalYear.trim() },
    },
  });

  if (existing) {
    throw new CompensationPlanningError(`A plan named "${data.name}" for ${data.fiscalYear} already exists`, 400);
  }

  const newPlan = await models.plan.create({
    data: {
      name: data.name.trim(),
      fiscalYear: data.fiscalYear.trim(),
      totalBudgetUSD: Number(data.totalBudgetUSD),
      status: 'Draft',
      createdBy: data.createdBy || 'Valentino Morales',
    },
  });

  // Auto-populate active employees and department allocations if requested (or by default)
  const shouldPopulate = data.autoPopulateEmployees !== false;
  if (shouldPopulate) {
    const activeEmployees = await models.employee.findMany({
      where: { status: 'Active' },
    });

    if (activeEmployees.length > 0) {
      // Group by department to calculate initial payrolls
      const deptPayrolls: Record<string, number> = {};
      activeEmployees.forEach((emp: any) => {
        const d = emp.department || 'Unassigned';
        deptPayrolls[d] = (deptPayrolls[d] || 0) + (emp.baseSalaryUSD || 0);
      });

      const totalPayroll = Object.values(deptPayrolls).reduce((a, b) => a + b, 0);

      // Create department allocations
      const deptData = Object.entries(deptPayrolls).map(([deptName, payroll]) => {
        let allocated = 0;
        if (data.initialDepartmentAllocations && data.initialDepartmentAllocations[deptName] !== undefined) {
          allocated = data.initialDepartmentAllocations[deptName];
        } else if (totalPayroll > 0) {
          // Pro-rate total budget proportional to department payroll
          allocated = Math.round((payroll / totalPayroll) * data.totalBudgetUSD);
        }

        return {
          id: crypto.randomUUID(),
          planId: newPlan.id,
          department: deptName,
          allocatedBudgetUSD: allocated,
        };
      });

      if (deptData.length > 0) {
        await models.dept.createMany({
          data: deptData,
        });
      }

      // Deduplicate active employees by ID
      const uniqueActiveEmployees = Array.from(
        new Map(activeEmployees.map((emp: any) => [emp.id, emp])).values()
      );

      // Create plan items for active employees with initial 0% increase
      const itemsData = uniqueActiveEmployees.map((emp: any) => ({
        id: crypto.randomUUID(),
        planId: newPlan.id,
        employeeId: emp.id,
        currentSalaryUSD: emp.baseSalaryUSD || 0,
        proposedSalaryUSD: emp.baseSalaryUSD || 0,
        increaseAmountUSD: 0,
        increasePercentage: 0,
        status: 'Proposed',
      }));

      // Chunk insertion to avoid huge SQLite query limits
      const chunkSize = 500;
      try {
        for (let i = 0; i < itemsData.length; i += chunkSize) {
          await models.item.createMany({
            data: itemsData.slice(i, i + chunkSize),
          });
        }
      } catch (err) {
        // Clean up partial plan on failure
        await models.plan.delete({ where: { id: newPlan.id } }).catch(() => {});
        throw err;
      }
    }
  }

  await createAuditLog({
    action: 'CREATE',
    entityType: 'COMPENSATION_PLAN',
    entityId: newPlan.id,
    userName: data.createdBy || undefined,
    description: `Compensation plan "${newPlan.name}" (${newPlan.fiscalYear}) created with budget $${newPlan.totalBudgetUSD.toLocaleString()}`,
    newData: newPlan,
  });

  return await getCompensationPlanById(newPlan.id);
}

/**
 * Updates plan metadata (e.g. name, total budget).
 */
export async function updateCompensationPlan(
  id: string,
  data: {
    name?: string;
    totalBudgetUSD?: number;
    fiscalYear?: string;
  }
) {
  const models = getModels();

  const plan = await models.plan.findUnique({ where: { id } });
  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  if (plan.status !== 'Draft' && plan.status !== 'Rejected') {
    throw new CompensationPlanningError(`Cannot modify plan metadata in "${plan.status}" status`, 400);
  }

  const updateData: any = {};
  if (data.name !== undefined) {
    if (!data.name.trim()) throw new CompensationPlanningError('Plan name cannot be empty', 400);
    updateData.name = data.name.trim();
  }
  if (data.fiscalYear !== undefined) {
    if (!data.fiscalYear.trim()) throw new CompensationPlanningError('Fiscal year cannot be empty', 400);
    updateData.fiscalYear = data.fiscalYear.trim();
  }
  if (data.totalBudgetUSD !== undefined) {
    if (data.totalBudgetUSD < 0 || isNaN(data.totalBudgetUSD)) {
      throw new CompensationPlanningError('Total budget must be a non-negative number', 400);
    }
    updateData.totalBudgetUSD = Number(data.totalBudgetUSD);
  }

  const updatedPlan = await models.plan.update({
    where: { id },
    data: updateData,
  });

  await createAuditLog({
    action: 'UPDATE',
    entityType: 'COMPENSATION_PLAN',
    entityId: id,
    description: `Compensation plan "${plan.name}" updated`,
    previousData: plan,
    newData: updatedPlan,
  });

  return await getCompensationPlanById(id);
}


/**
 * Deletes a compensation plan if it is in Draft or Rejected status.
 */
export async function deleteCompensationPlan(id: string, force: boolean = false) {
  const models = getModels();

  const plan = await models.plan.findUnique({ where: { id } });
  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  if (!force && plan.status !== 'Draft' && plan.status !== 'Rejected') {
    throw new CompensationPlanningError(`Cannot delete plan in "${plan.status}" status. Use force delete to remove as Admin.`, 400);
  }

  await models.plan.delete({ where: { id } });
  return { success: true };
}

/**
 * Updates workflow status (Draft -> In Review -> Approved -> Finalized, or Rejected -> Draft).
 */
export async function updatePlanStatus(id: string, newStatus: PlanStatus) {
  const models = getModels();

  const plan = await models.plan.findUnique({ where: { id } });
  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  const currentStatus = plan.status as PlanStatus;

  // Allowed transitions check
  const allowedTransitions: Record<PlanStatus, PlanStatus[]> = {
    Draft: ['In Review'],
    'In Review': ['Approved', 'Rejected'],
    Approved: ['Finalized', 'Draft'],
    Rejected: ['Draft'],
    Finalized: [],
  };

  if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
    throw new CompensationPlanningError(
      `Invalid status transition from "${currentStatus}" to "${newStatus}"`,
      400
    );
  }

  // If submitting or approving/finalizing, run budget validation
  if (['In Review', 'Approved', 'Finalized'].includes(newStatus)) {
    const validation = await validatePlan(id);
    if (!validation.isValid) {
      throw new CompensationPlanningError(
        `Cannot change status to "${newStatus}": ${validation.errors.join('; ')}`,
        400
      );
    }
  }

  // Map status transition to Audit Log action name
  let auditAction = 'UPDATE';
  if (newStatus === 'In Review') auditAction = 'SUBMIT';
  else if (newStatus === 'Approved') auditAction = 'APPROVE';
  else if (newStatus === 'Rejected') auditAction = 'REJECT';
  else if (newStatus === 'Finalized') auditAction = 'FINALIZE';

  // If status is Finalized, trigger salary application to actual employees & write SalaryHistory records!
  if (newStatus === 'Finalized') {
    await finalizeCompensationPlan(id);
    await createAuditLog({
      action: 'FINALIZE',
      entityType: 'COMPENSATION_PLAN',
      entityId: id,
      description: `Compensation plan "${plan.name}" (${plan.fiscalYear}) finalized and approved salary increases applied to employees`,
      previousData: { status: currentStatus },
      newData: { status: 'Finalized' },
    });
    return await getCompensationPlanById(id);
  }

  await models.plan.update({
    where: { id },
    data: { status: newStatus },
  });

  await createAuditLog({
    action: auditAction,
    entityType: 'COMPENSATION_PLAN',
    entityId: id,
    description: `Compensation plan "${plan.name}" status updated from ${currentStatus} to ${newStatus}`,
    previousData: { status: currentStatus },
    newData: { status: newStatus },
  });

  return await getCompensationPlanById(id);
}

/**
 * Returns department budget summaries for a plan.
 */
export async function getDepartmentBudgetSummary(planId: string): Promise<DepartmentBudgetSummary[]> {
  const models = getModels();

  const plan = await models.plan.findUnique({
    where: { id: planId },
    include: {
      departments: true,
      items: {
        include: {
          employee: {
            select: { department: true },
          },
        },
      },
    },
  });

  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  // Collect all distinct departments from department allocations and plan items
  const deptSet = new Set<string>();
  plan.departments.forEach((d: any) => deptSet.add(d.department));
  plan.items.forEach((i: any) => {
    if (i.employee?.department) deptSet.add(i.employee.department);
  });

  const departmentMap: Record<string, number> = {};
  plan.departments.forEach((d: any) => {
    departmentMap[d.department] = d.allocatedBudgetUSD || 0;
  });

  const result: DepartmentBudgetSummary[] = Array.from(deptSet).map((deptName) => {
    const deptItems = plan.items.filter((i: any) => i.employee?.department === deptName);
    const employeeCount = deptItems.length;
    const currentPayrollUSD = deptItems.reduce((sum: number, i: any) => sum + (i.currentSalaryUSD || 0), 0);
    const allocatedBudgetUSD = departmentMap[deptName] || 0;
    const plannedIncreaseUSD = deptItems.reduce((sum: number, i: any) => sum + (i.increaseAmountUSD || 0), 0);
    const remainingBudgetUSD = allocatedBudgetUSD - plannedIncreaseUSD;
    const utilizationPercentage =
      allocatedBudgetUSD > 0
        ? Math.round((plannedIncreaseUSD / allocatedBudgetUSD) * 1000) / 10
        : 0;

    return {
      department: deptName,
      employeeCount,
      currentPayrollUSD,
      allocatedBudgetUSD,
      plannedIncreaseUSD,
      remainingBudgetUSD,
      utilizationPercentage,
    };
  });

  return result.sort((a, b) => a.department.localeCompare(b.department));
}

/**
 * Updates department budget allocations for a plan.
 */
export async function updateDepartmentAllocations(
  planId: string,
  allocations: { department: string; allocatedBudgetUSD: number }[]
) {
  const models = getModels();

  const plan = await models.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  if (plan.status !== 'Draft' && plan.status !== 'Rejected') {
    throw new CompensationPlanningError(`Cannot modify department allocations in "${plan.status}" status`, 400);
  }

  // Upsert each department allocation
  for (const alloc of allocations) {
    if (alloc.allocatedBudgetUSD < 0 || isNaN(alloc.allocatedBudgetUSD)) {
      throw new CompensationPlanningError(`Allocated budget for ${alloc.department} must be a non-negative number`, 400);
    }

    await models.dept.upsert({
      where: {
        planId_department: {
          planId,
          department: alloc.department,
        },
      },
      update: {
        allocatedBudgetUSD: Number(alloc.allocatedBudgetUSD),
      },
      create: {
        planId,
        department: alloc.department,
        allocatedBudgetUSD: Number(alloc.allocatedBudgetUSD),
      },
    });
  }

  await createAuditLog({
    action: 'UPDATE',
    entityType: 'COMPENSATION_BUDGET',
    entityId: planId,
    description: `Department budget allocations updated for plan "${plan.name}"`,
    newData: allocations,
  });

  return await getDepartmentBudgetSummary(planId);
}


/**
 * Fetches paginated employee planning items with real-time Compa-Ratio derivation.
 */
export async function getPlanItems(
  planId: string,
  params: {
    search?: string;
    department?: string;
    page?: number | string;
    limit?: number | string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  const models = getModels();

  const search = (params.search || '').trim();
  const department = params.department || 'All';
  const page = Math.max(1, parseInt(String(params.page || '1'), 10) || 1);
  const limit = Math.max(1, parseInt(String(params.limit || '10'), 10) || 10);
  const skip = (page - 1) * limit;

  const whereClause: any = { planId };

  if (department !== 'All') {
    whereClause.employee = { department };
  }

  if (search) {
    whereClause.employee = {
      ...(whereClause.employee || {}),
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { employeeId: { contains: search } },
        { role: { contains: search } },
      ],
    };
  }

  const [total, rawItems] = await Promise.all([
    models.item.count({ where: whereClause }),
    models.item.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        employee: true,
      },
      orderBy: { employee: { lastName: 'asc' } },
    }),
  ]);

  // Pre-fetch all salary bands to calculate Compa-Ratios efficiently
  const allBands = await models.salaryBand.findMany({});

  const itemsWithAnalysis: EmployeePlanningItemWithAnalysis[] = rawItems.map((item: any) => {
    const emp = item.employee;
    const currentSalary = item.currentSalaryUSD || 0;
    const proposedSalary = item.proposedSalaryUSD || 0;
    const payGrade = emp?.payGrade || 'L4';
    const currency = emp?.currency || 'USD';

    // Find salary band for current & proposed compa-ratios
    const band = allBands.find(
      (b: any) => b.payGrade === payGrade && (b.currency === currency || b.currency === 'USD')
    );

    const currentCompaRatio = band ? calculateCompaRatio(currentSalary, band.midpointSalary) : null;
    const newCompaRatio = band ? calculateCompaRatio(proposedSalary, band.midpointSalary) : null;

    let bandStatus = 'Within Band';
    if (band) {
      if (proposedSalary < band.minSalary) bandStatus = 'Below Band';
      else if (proposedSalary > band.maxSalary) bandStatus = 'Above Band';
    } else {
      bandStatus = 'No Band';
    }

    const avatarUrl = `https://ui-avatars.com/api/?background=f5c242&color=18181b&name=${encodeURIComponent(
      (emp?.firstName || '') + ' ' + (emp?.lastName || '')
    )}`;

    return {
      id: item.id,
      planId: item.planId,
      employeeId: item.employeeId,
      employeeCode: emp?.employeeId || 'ACM-000',
      firstName: emp?.firstName || 'Employee',
      lastName: emp?.lastName || '',
      fullName: `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim(),
      email: emp?.email || '',
      department: emp?.department || 'General',
      role: emp?.role || 'Staff',
      payGrade,
      avatarUrl,
      currentSalaryUSD: currentSalary,
      proposedSalaryUSD: proposedSalary,
      increaseAmountUSD: item.increaseAmountUSD || 0,
      increasePercentage: item.increasePercentage || 0,
      currentCompaRatio,
      newCompaRatio,
      bandMin: band ? band.minSalary : null,
      bandMid: band ? band.midpointSalary : null,
      bandMax: band ? band.maxSalary : null,
      bandStatus,
      status: item.status || 'Proposed',
    };
  });

  return {
    items: itemsWithAnalysis,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Updates a single employee salary planning item in a plan.
 * Automatically recalculates either proposed salary or increase % to maintain dual-input sync.
 */
export async function updatePlanItem(
  planId: string,
  itemId: string,
  update: {
    proposedSalaryUSD?: number;
    increasePercentage?: number;
  }
) {
  const models = getModels();

  const plan = await models.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  if (plan.status !== 'Draft' && plan.status !== 'Rejected') {
    throw new CompensationPlanningError(`Cannot modify employee salary plan in "${plan.status}" status`, 400);
  }

  const item = await models.item.findFirst({
    where: { id: itemId, planId },
    include: { employee: true },
  });

  if (!item) {
    throw new CompensationPlanningError('Planning item not found', 404);
  }

  const currentSalary = item.currentSalaryUSD || 0;
  let proposedSalary = item.proposedSalaryUSD || currentSalary;
  let increasePct = item.increasePercentage || 0;
  let increaseAmount = item.increaseAmountUSD || 0;

  if (update.proposedSalaryUSD !== undefined) {
    proposedSalary = Math.max(0, Number(update.proposedSalaryUSD));
    if (isNaN(proposedSalary)) {
      throw new CompensationPlanningError('Proposed salary must be a valid number', 400);
    }
    if (proposedSalary < currentSalary) {
      throw new CompensationPlanningError('Salary decreases are not allowed in compensation planning', 400);
    }
    increaseAmount = proposedSalary - currentSalary;
    increasePct = currentSalary > 0 ? Math.round(((proposedSalary - currentSalary) / currentSalary) * 10000) / 100 : 0;
  } else if (update.increasePercentage !== undefined) {
    increasePct = Number(update.increasePercentage);
    if (isNaN(increasePct) || increasePct < 0) {
      throw new CompensationPlanningError('Increase percentage must be a non-negative number', 400);
    }
    increaseAmount = Math.round(currentSalary * (increasePct / 100));
    proposedSalary = currentSalary + increaseAmount;
  }

  await models.item.update({
    where: { id: itemId },
    data: {
      proposedSalaryUSD: proposedSalary,
      increaseAmountUSD: increaseAmount,
      increasePercentage: increasePct,
    },
  });

  await createAuditLog({
    action: 'UPDATE',
    entityType: 'COMPENSATION_PLAN_ITEM',
    entityId: itemId,
    description: `Proposed salary updated for ${item.employee?.firstName || 'Employee'} ${item.employee?.lastName || ''} in plan "${plan.name}"`,
    previousData: {
      employeeId: item.employeeId,
      employeeName: `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`,
      proposedSalaryUSD: item.proposedSalaryUSD,
      increaseAmountUSD: item.increaseAmountUSD,
      increasePercentage: item.increasePercentage,
    },
    newData: {
      employeeId: item.employeeId,
      employeeName: `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`,
      proposedSalaryUSD: proposedSalary,
      increaseAmountUSD: increaseAmount,
      increasePercentage: increasePct,
    },
  });

  return { success: true, proposedSalaryUSD: proposedSalary, increaseAmountUSD: increaseAmount, increasePercentage: increasePct };
}

/**
 * Bulk updates percentage increase across filtered department items.
 */
export async function bulkUpdatePlanItems(
  planId: string,
  filter: { department?: string },
  increasePercentage: number
) {
  const models = getModels();

  const plan = await models.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  if (plan.status !== 'Draft' && plan.status !== 'Rejected') {
    throw new CompensationPlanningError(`Cannot modify employee salary plan in "${plan.status}" status`, 400);
  }

  if (isNaN(increasePercentage) || increasePercentage < 0) {
    throw new CompensationPlanningError('Increase percentage must be a non-negative number', 400);
  }

  const whereClause: any = { planId };
  if (filter.department && filter.department !== 'All') {
    whereClause.employee = { department: filter.department };
  }

  const items = await models.item.findMany({
    where: whereClause,
  });

  for (const item of items) {
    const currentSalary = item.currentSalaryUSD || 0;
    const increaseAmount = Math.round(currentSalary * (increasePercentage / 100));
    const proposedSalary = currentSalary + increaseAmount;

    await models.item.update({
      where: { id: item.id },
      data: {
        proposedSalaryUSD: proposedSalary,
        increaseAmountUSD: increaseAmount,
        increasePercentage,
      },
    });
  }

  await createAuditLog({
    action: 'UPDATE',
    entityType: 'COMPENSATION_PLAN_ITEM',
    entityId: planId,
    description: `Bulk salary increase (${increasePercentage}%) applied to ${items.length} employee(s) in plan "${plan.name}"`,
    metadata: { increasePercentage, count: items.length },
  });

  return { success: true, count: items.length };
}

/**
 * Adds employees to a plan if they are not already present.
 */
export async function addEmployeesToPlan(planId: string, employeeIds?: string[]) {
  const models = getModels();

  const plan = await models.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  let employeesToAdd;
  if (employeeIds && employeeIds.length > 0) {
    employeesToAdd = await models.employee.findMany({
      where: { id: { in: employeeIds } },
    });
  } else {
    // Add all active employees not currently in plan
    const existingItems = await models.item.findMany({
      where: { planId },
      select: { employeeId: true },
    });
    const existingEmpIds = new Set(existingItems.map((i: any) => i.employeeId));

    employeesToAdd = await models.employee.findMany({
      where: {
        status: 'Active',
        id: { notIn: Array.from(existingEmpIds) },
      },
    });
  }

  const newItems = employeesToAdd.map((emp: any) => ({
    id: crypto.randomUUID(),
    planId,
    employeeId: emp.id,
    currentSalaryUSD: emp.baseSalaryUSD || 0,
    proposedSalaryUSD: emp.baseSalaryUSD || 0,
    increaseAmountUSD: 0,
    increasePercentage: 0,
    status: 'Proposed',
  }));

  if (newItems.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < newItems.length; i += chunkSize) {
      await models.item.createMany({
        data: newItems.slice(i, i + chunkSize),
      });
    }

    await createAuditLog({
      action: 'CREATE',
      entityType: 'COMPENSATION_PLAN_ITEM',
      entityId: planId,
      description: `${newItems.length} employee(s) added to compensation plan "${plan.name}"`,
      metadata: { addedCount: newItems.length },
    });
  }

  return { addedCount: newItems.length };
}

/**
 * Removes an employee item from a plan.
 */
export async function removeEmployeeFromPlan(planId: string, itemId: string) {
  const models = getModels();

  const plan = await models.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  if (plan.status !== 'Draft' && plan.status !== 'Rejected') {
    throw new CompensationPlanningError(`Cannot remove employee in "${plan.status}" status`, 400);
  }

  const existingItem = await models.item.findFirst({
    where: { id: itemId, planId },
    include: { employee: true },
  });

  await models.item.deleteMany({
    where: { id: itemId, planId },
  });

  if (existingItem) {
    await createAuditLog({
      action: 'DELETE',
      entityType: 'COMPENSATION_PLAN_ITEM',
      entityId: itemId,
      description: `Employee ${existingItem.employee?.firstName || ''} ${existingItem.employee?.lastName || ''} removed from plan "${plan.name}"`,
      previousData: existingItem,
    });
  }

  return { success: true };
}


/**
 * Calculates scenario simulations (e.g. 3%, 5%, 7% increase) without mutating plan items.
 */
export async function getScenarioSimulations(
  planId: string,
  targetPcts: number[] = [3, 5, 7]
): Promise<ScenarioSimulationResult[]> {
  const models = getModels();

  const plan = await models.plan.findUnique({
    where: { id: planId },
    include: { items: true },
  });

  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  const totalBudgetUSD = plan.totalBudgetUSD || 0;
  const items = plan.items || [];
  const employeesAffected = items.length;

  const totalCurrentPayrollUSD = items.reduce(
    (sum: number, i: any) => sum + (i.currentSalaryUSD || 0),
    0
  );

  const results: ScenarioSimulationResult[] = targetPcts.map((pct, index) => {
    const char = String.fromCharCode(65 + index); // A, B, C...
    const name = `Scenario ${char} — ${pct}% Increase`;
    const totalAdditionalCompUSD = Math.round(totalCurrentPayrollUSD * (pct / 100));
    const remainingBudgetUSD = totalBudgetUSD - totalAdditionalCompUSD;
    const utilizationPercentage =
      totalBudgetUSD > 0
        ? Math.round((totalAdditionalCompUSD / totalBudgetUSD) * 1000) / 10
        : 0;

    return {
      id: `scen-${pct}`,
      name,
      increasePct: pct,
      totalAdditionalCompUSD,
      remainingBudgetUSD,
      averageIncreasePct: pct,
      employeesAffected,
      utilizationPercentage,
    };
  });

  return results;
}

/**
 * Validates budget allocation and planned increases.
 */
export async function validatePlan(planId: string): Promise<PlanValidationResult> {
  const models = getModels();

  const plan = await models.plan.findUnique({
    where: { id: planId },
    include: {
      departments: true,
      items: true,
    },
  });

  if (!plan) {
    return { isValid: false, errors: ['Plan not found'], warnings: [] };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  const totalBudgetUSD = plan.totalBudgetUSD || 0;

  const totalAllocatedBudgetUSD = plan.departments.reduce(
    (sum: number, d: any) => sum + (d.allocatedBudgetUSD || 0),
    0
  );

  const totalPlannedIncreaseUSD = plan.items.reduce(
    (sum: number, i: any) => sum + (i.increaseAmountUSD || 0),
    0
  );

  // Rule 1: Department allocations exceeding total budget
  if (totalAllocatedBudgetUSD > totalBudgetUSD) {
    errors.push(
      `Total department allocation ($${totalAllocatedBudgetUSD.toLocaleString()}) exceeds plan budget ($${totalBudgetUSD.toLocaleString()})`
    );
  }

  // Rule 2: Planned increases exceeding total budget
  if (totalPlannedIncreaseUSD > totalBudgetUSD) {
    errors.push(
      `Total planned increases ($${totalPlannedIncreaseUSD.toLocaleString()}) exceed total available budget ($${totalBudgetUSD.toLocaleString()})`
    );
  }

  // Rule 3: Negative salary increases or negative salaries
  const invalidItems = plan.items.filter(
    (i: any) => i.increaseAmountUSD < 0 || i.proposedSalaryUSD < 0
  );
  if (invalidItems.length > 0) {
    errors.push(`${invalidItems.length} employee(s) have invalid negative salary increases or values`);
  }

  // Warnings
  if (totalAllocatedBudgetUSD < totalBudgetUSD) {
    warnings.push(
      `$${(totalBudgetUSD - totalAllocatedBudgetUSD).toLocaleString()} of the total budget has not yet been allocated to departments`
    );
  }

  if (totalPlannedIncreaseUSD > 0.9 * totalBudgetUSD && totalPlannedIncreaseUSD <= totalBudgetUSD) {
    warnings.push(`Planned increases have reached ${Math.round((totalPlannedIncreaseUSD / totalBudgetUSD) * 100)}% of total budget`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Finalizes a plan and applies approved salary increases to actual `Employee.baseSalaryUSD` & logs `SalaryHistory`.
 */
export async function finalizeCompensationPlan(planId: string) {
  const models = getModels();

  const plan = await models.plan.findUnique({
    where: { id: planId },
    include: {
      items: {
        include: { employee: true },
      },
    },
  });

  if (!plan) {
    throw new CompensationPlanningError('Compensation plan not found', 404);
  }

  const validation = await validatePlan(planId);
  if (!validation.isValid) {
    throw new CompensationPlanningError(
      `Cannot finalize plan due to validation errors: ${validation.errors.join('; ')}`,
      400
    );
  }

  const effectiveDate = new Date();
  const effectiveReason = `Annual Compensation Review (${plan.fiscalYear})`;

  // Apply each item increase to Employee and write SalaryHistory
  for (const item of plan.items) {
    if (item.increaseAmountUSD > 0 && item.employee) {
      const emp = item.employee;
      const oldSalaryUSD = emp.baseSalaryUSD || 0;
      const newSalaryUSD = item.proposedSalaryUSD;

      // Adjust local baseSalary proportional to USD ratio if local currency differs
      const localMultiplier = oldSalaryUSD > 0 ? emp.baseSalary / oldSalaryUSD : 1;
      const newLocalBaseSalary = Math.round(newSalaryUSD * localMultiplier);

      await models.employee.update({
        where: { id: emp.id },
        data: {
          baseSalaryUSD: newSalaryUSD,
          baseSalary: newLocalBaseSalary,
        },
      });

      await models.salaryHistory.create({
        data: {
          employeeId: emp.id,
          amount: newLocalBaseSalary,
          currency: emp.currency || 'USD',
          amountUSD: newSalaryUSD,
          previousAmountUSD: oldSalaryUSD,
          effectiveDate,
          reason: effectiveReason,
          notes: `Approved in plan "${plan.name}" (${plan.fiscalYear}) with +${item.increasePercentage}% increase`,
          createdBy: plan.createdBy || 'Valentino Morales',
        },
      });
    }
  }

  await models.plan.update({
    where: { id: planId },
    data: { status: 'Finalized' },
  });

  return { success: true, count: plan.items.length };
}
