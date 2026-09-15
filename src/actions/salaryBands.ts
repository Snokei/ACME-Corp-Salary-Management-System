'use server';

import { revalidatePath } from 'next/cache';
import {
  getAllSalaryBands,
  createSalaryBand,
  updateSalaryBand,
  getCompensationAnalysis,
} from '@/lib/compaRatioService';

export async function getSalaryBandsAction(search?: string) {
  try {
    const bands = await getAllSalaryBands(search);
    return { success: true, bands };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch salary bands' };
  }
}

export async function createSalaryBandAction(data: {
  payGrade: string;
  currency?: string;
  minSalary: number | string;
  midpointSalary: number | string;
  maxSalary: number | string;
}) {
  try {
    const band = await createSalaryBand(data);
    revalidatePath('/salary-bands');
    revalidatePath('/people');
    return { success: true, band };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create salary band' };
  }
}

export async function updateSalaryBandAction(
  id: string,
  data: {
    payGrade: string;
    currency?: string;
    minSalary: number | string;
    midpointSalary: number | string;
    maxSalary: number | string;
  }
) {
  try {
    const band = await updateSalaryBand(id, data);
    revalidatePath('/salary-bands');
    revalidatePath('/people');
    return { success: true, band };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update salary band' };
  }
}

export async function getCompensationAnalysisAction(
  salary: number,
  payGrade: string,
  currency: string = 'USD'
) {
  try {
    const analysis = await getCompensationAnalysis(salary, payGrade, currency);
    return { success: true, analysis };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to analyze compensation position' };
  }
}
