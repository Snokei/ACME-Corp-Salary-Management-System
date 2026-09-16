import { prisma } from '@/lib/prisma';

export const SALARY_ADJUSTMENT_REASONS = [
  'Promotion',
  'Annual Increase',
  'Performance',
  'Market Adjustment',
  'Cost of Living',
  'Role Change',
  'Retention',
  'Other',
] as const;

export type SalaryAdjustmentReason = (typeof SALARY_ADJUSTMENT_REASONS)[number];

export interface CreateSalaryAdjustmentInput {
  amount: number | string;
  currency?: string;
  amountUSD?: number | string;
  effectiveDate: string | Date;
  reason: string;
  notes?: string;
  createdBy?: string;
}

export class SalaryAdjustmentError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'SalaryAdjustmentError';
    this.statusCode = statusCode;
  }
}

/**
 * Validates salary adjustment inputs.
 */
export function validateSalaryAdjustmentInput(input: CreateSalaryAdjustmentInput) {
  // Validate amount
  const rawAmount = input.amount;
  if (rawAmount === undefined || rawAmount === null || rawAmount === '') {
    throw new SalaryAdjustmentError('New salary is required', 400);
  }

  const numAmount = typeof rawAmount === 'string' ? parseFloat(rawAmount) : Number(rawAmount);
  if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
    throw new SalaryAdjustmentError('New salary must be a valid positive number', 400);
  }

  // Validate effectiveDate
  if (!input.effectiveDate) {
    throw new SalaryAdjustmentError('Effective date is required', 400);
  }

  const parsedDate = new Date(input.effectiveDate);
  if (isNaN(parsedDate.getTime())) {
    throw new SalaryAdjustmentError('Invalid effective date format', 400);
  }

  // Validate reason
  if (!input.reason || typeof input.reason !== 'string' || !input.reason.trim()) {
    throw new SalaryAdjustmentError('Reason is required', 400);
  }

  return {
    amount: numAmount,
    effectiveDate: parsedDate,
    reason: input.reason.trim(),
    notes: input.notes ? String(input.notes).trim() : null,
    currency: input.currency ? String(input.currency).trim() : undefined,
    amountUSD: input.amountUSD !== undefined ? Number(input.amountUSD) : undefined,
    createdBy: input.createdBy ? String(input.createdBy).trim() : null,
  };
}

/**
 * Calculates change amount and percentage between current salary and new salary.
 */
export function calculateSalaryChange(currentSalary: number, newSalary: number) {
  const change = newSalary - currentSalary;
  const percentage = currentSalary > 0 ? (change / currentSalary) * 100 : 0;
  return {
    change,
    percentage: Math.round(percentage * 100) / 100, // round to 2 decimal places
  };
}

/**
 * Performs salary adjustment in a single atomic database transaction.
 * 1. Creates a new SalaryHistory record.
 * 2. Updates Employee.baseSalary (and baseSalaryUSD).
 */
export async function createSalaryAdjustment(
  employeeIdOrUuid: string,
  input: CreateSalaryAdjustmentInput
) {
  const validated = validateSalaryAdjustmentInput(input);

  // Find employee by UUID or employeeId (e.g. ACM-00001)
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [{ id: employeeIdOrUuid }, { employeeId: employeeIdOrUuid }],
    },
  });

  if (!employee) {
    throw new SalaryAdjustmentError('Employee not found', 404);
  }

  const currency = validated.currency || employee.currency || 'USD';
  const amountUSD = validated.amountUSD !== undefined && !isNaN(validated.amountUSD)
    ? validated.amountUSD
    : validated.amount;

  // Execute in ONE atomic Prisma transaction
  const result = await prisma.$transaction(async (tx) => {
    const salaryHistory = await tx.salaryHistory.create({
      data: {
        employeeId: employee.id,
        amount: validated.amount,
        currency,
        amountUSD,
        previousAmountUSD: employee.baseSalaryUSD,
        effectiveDate: validated.effectiveDate,
        reason: validated.reason,
        notes: validated.notes,
        createdBy: validated.createdBy || null,
      },
    });

    const updatedEmployee = await tx.employee.update({
      where: { id: employee.id },
      data: {
        baseSalary: validated.amount,
        baseSalaryUSD: amountUSD,
      },
    });

    return {
      salaryHistory,
      employee: updatedEmployee,
    };
  });

  return result;
}

/**
 * Fetches salary history records for a given employee ordered by effectiveDate descending.
 */
export async function getSalaryHistory(employeeIdOrUuid: string) {
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [{ id: employeeIdOrUuid }, { employeeId: employeeIdOrUuid }],
    },
    select: { id: true },
  });

  if (!employee) {
    throw new SalaryAdjustmentError('Employee not found', 404);
  }

  const history = await prisma.salaryHistory.findMany({
    where: { employeeId: employee.id },
    orderBy: { effectiveDate: 'desc' },
  });

  return history;
}
