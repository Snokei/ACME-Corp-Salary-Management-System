'use server';

import { revalidatePath } from 'next/cache';
import {
  createSalaryAdjustment,
  getSalaryHistory,
  CreateSalaryAdjustmentInput,
} from '@/lib/salaryAdjustmentService';

export async function createSalaryAdjustmentAction(
  employeeId: string,
  input: CreateSalaryAdjustmentInput
) {
  try {
    const result = await createSalaryAdjustment(employeeId, input);
    revalidatePath('/people');
    revalidatePath('/');
    return {
      success: true,
      salaryHistory: result.salaryHistory,
      employee: result.employee,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to record salary adjustment',
    };
  }
}

export async function getSalaryHistoryAction(employeeId: string) {
  try {
    const history = await getSalaryHistory(employeeId);
    return { success: true, history };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch salary history',
    };
  }
}
