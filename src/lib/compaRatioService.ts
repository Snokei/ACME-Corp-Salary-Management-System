import { prisma } from '@/lib/prisma';

export interface SalaryBandData {
  id?: string;
  payGrade: string;
  currency: string;
  minSalary: number;
  midpointSalary: number;
  maxSalary: number;
}

export type BandStatus = 'Below Band' | 'Within Band' | 'Above Band' | 'No Matching Band';

export interface CompensationAnalysisResult {
  hasBand: boolean;
  band: SalaryBandData | null;
  compaRatio: number | null; // e.g. 95.8
  positionInBand: number | null; // e.g. 16.7
  visualPercent: number; // clamped 0 - 100 for progress bar
  displayPosition: string; // e.g. "16.7%", "Below 0%", "Above 100%"
  status: BandStatus;
}

export class SalaryBandError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'SalaryBandError';
    this.statusCode = statusCode;
  }
}

/**
 * Calculates Compa-Ratio = (Employee Current Salary / Midpoint Salary) * 100
 * Rounded to 1 decimal place.
 */
export function calculateCompaRatio(currentSalary: number, midpointSalary: number): number | null {
  if (!midpointSalary || midpointSalary <= 0 || isNaN(currentSalary) || currentSalary < 0) {
    return null;
  }
  const ratio = (currentSalary / midpointSalary) * 100;
  return Math.round(ratio * 10) / 10;
}

/**
 * Calculates Position in Band = ((Employee Current Salary - Min) / (Max - Min)) * 100
 * Handles Below Band (< 0%), Within Band (0-100%), and Above Band (> 100%).
 */
export function calculatePositionInBand(
  currentSalary: number,
  minSalary: number,
  maxSalary: number
): {
  positionInBand: number | null;
  visualPercent: number;
  displayPosition: string;
  status: BandStatus;
} {
  if (minSalary >= maxSalary || minSalary < 0 || isNaN(currentSalary)) {
    return {
      positionInBand: null,
      visualPercent: 0,
      displayPosition: 'N/A',
      status: 'No Matching Band',
    };
  }

  const range = maxSalary - minSalary;
  const rawPosition = ((currentSalary - minSalary) / range) * 100;
  const roundedPosition = Math.round(rawPosition * 10) / 10;

  if (currentSalary < minSalary) {
    return {
      positionInBand: roundedPosition,
      visualPercent: 0,
      displayPosition: 'Below 0%',
      status: 'Below Band',
    };
  }

  if (currentSalary > maxSalary) {
    return {
      positionInBand: roundedPosition,
      visualPercent: 100,
      displayPosition: 'Above 100%',
      status: 'Above Band',
    };
  }

  return {
    positionInBand: roundedPosition,
    visualPercent: Math.max(0, Math.min(100, roundedPosition)),
    displayPosition: `${roundedPosition.toFixed(1)}%`,
    status: 'Within Band',
  };
}

/**
 * Validates salary band inputs ensuring min < midpoint < max and all values > 0.
 */
export function validateSalaryBandInput(data: {
  payGrade: string;
  currency?: string;
  minSalary: number | string;
  midpointSalary: number | string;
  maxSalary: number | string;
}) {
  if (!data.payGrade || typeof data.payGrade !== 'string' || !data.payGrade.trim()) {
    throw new SalaryBandError('Pay grade is required', 400);
  }

  const min = typeof data.minSalary === 'string' ? parseFloat(data.minSalary) : Number(data.minSalary);
  const mid = typeof data.midpointSalary === 'string' ? parseFloat(data.midpointSalary) : Number(data.midpointSalary);
  const max = typeof data.maxSalary === 'string' ? parseFloat(data.maxSalary) : Number(data.maxSalary);

  if (isNaN(min) || min <= 0) {
    throw new SalaryBandError('Minimum salary must be a valid positive number', 400);
  }
  if (isNaN(mid) || mid <= 0) {
    throw new SalaryBandError('Midpoint salary must be a valid positive number', 400);
  }
  if (isNaN(max) || max <= 0) {
    throw new SalaryBandError('Maximum salary must be a valid positive number', 400);
  }

  if (min >= mid) {
    throw new SalaryBandError('Minimum salary must be less than midpoint salary', 400);
  }
  if (mid >= max) {
    throw new SalaryBandError('Midpoint salary must be less than maximum salary', 400);
  }

  return {
    payGrade: data.payGrade.trim().toUpperCase(),
    currency: (data.currency || 'USD').trim().toUpperCase(),
    minSalary: min,
    midpointSalary: mid,
    maxSalary: max,
  };
}

function getSalaryBandModel() {
  let model = (prisma as any).salaryBand;
  if (!model) {
    try {
      const globalForPrisma = global as unknown as { prisma: any };
      const { PrismaClient } = require('@prisma/client');
      globalForPrisma.prisma = new PrismaClient({ log: ['error'] });
      model = globalForPrisma.prisma.salaryBand;
    } catch (e) {
      console.error('Failed to re-initialize Prisma client for SalaryBand:', e);
    }
  }
  if (!model) {
    throw new SalaryBandError('SalaryBand database model is unavailable. Please restart the dev server.', 500);
  }
  return model;
}

/**
 * Calculates complete compensation analysis for an employee against their salary band.
 */
export async function getCompensationAnalysis(
  currentSalary: number,
  payGrade: string,
  currency: string = 'USD'
): Promise<CompensationAnalysisResult> {
  if (!payGrade) {
    return {
      hasBand: false,
      band: null,
      compaRatio: null,
      positionInBand: null,
      visualPercent: 0,
      displayPosition: 'N/A',
      status: 'No Matching Band',
    };
  }

  let model;
  try {
    model = getSalaryBandModel();
  } catch {
    return {
      hasBand: false,
      band: null,
      compaRatio: null,
      positionInBand: null,
      visualPercent: 0,
      displayPosition: 'N/A',
      status: 'No Matching Band',
    };
  }

  // Try exact payGrade + currency match
  let band = await model.findFirst({
    where: {
      payGrade: { equals: payGrade },
      currency: { equals: currency },
    },
  });

  // Fallback to USD band if specific currency band not found
  if (!band && currency !== 'USD') {
    band = await model.findFirst({
      where: {
        payGrade: { equals: payGrade },
        currency: 'USD',
      },
    });
  }

  if (!band) {
    return {
      hasBand: false,
      band: null,
      compaRatio: null,
      positionInBand: null,
      visualPercent: 0,
      displayPosition: 'N/A',
      status: 'No Matching Band',
    };
  }

  const compaRatio = calculateCompaRatio(currentSalary, band.midpointSalary);
  const pos = calculatePositionInBand(currentSalary, band.minSalary, band.maxSalary);

  return {
    hasBand: true,
    band: {
      id: band.id,
      payGrade: band.payGrade,
      currency: band.currency,
      minSalary: band.minSalary,
      midpointSalary: band.midpointSalary,
      maxSalary: band.maxSalary,
    },
    compaRatio,
    positionInBand: pos.positionInBand,
    visualPercent: pos.visualPercent,
    displayPosition: pos.displayPosition,
    status: pos.status,
  };
}

/**
 * Retrieves salary bands with backend search, count, and pagination options.
 */
export async function getAllSalaryBands(options?: {
  search?: string;
  currency?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  let model;
  try {
    model = getSalaryBandModel();
  } catch {
    return { bands: [], total: 0, page: 1, totalPages: 1 };
  }

  const search = options?.search;
  const page = Math.max(1, options?.page || 1);
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search && search.trim()) {
    const s = search.trim();
    where.OR = [
      { payGrade: { contains: s } },
      { currency: { contains: s } },
    ];
  }

  if (options?.currency && options.currency !== 'All') {
    where.currency = options.currency;
  }

  let orderBy: any = [
    { payGrade: 'asc' },
    { currency: 'asc' },
  ];

  if (options?.sortBy) {
    const validSortFields = ['minSalary', 'midpointSalary', 'maxSalary', 'payGrade'];
    if (validSortFields.includes(options.sortBy)) {
      const dir = options.sortOrder === 'desc' ? 'desc' : 'asc';
      orderBy = { [options.sortBy]: dir };
    }
  }

  const [total, bands] = await Promise.all([
    model.count({ where }),
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
  ]);

  return {
    bands: bands as SalaryBandData[],
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Creates a new salary band.
 */
export async function createSalaryBand(data: {
  payGrade: string;
  currency?: string;
  minSalary: number | string;
  midpointSalary: number | string;
  maxSalary: number | string;
}) {
  const validated = validateSalaryBandInput(data);
  const model = getSalaryBandModel();

  // Check for duplicate payGrade + currency
  const existing = await model.findUnique({
    where: {
      payGrade_currency: {
        payGrade: validated.payGrade,
        currency: validated.currency,
      },
    },
  });

  if (existing) {
    throw new SalaryBandError(
      `Salary band for pay grade ${validated.payGrade} (${validated.currency}) already exists`,
      400
    );
  }

  return await model.create({
    data: validated,
  });
}

/**
 * Updates an existing salary band by ID.
 */
export async function updateSalaryBand(
  id: string,
  data: {
    payGrade: string;
    currency?: string;
    minSalary: number | string;
    midpointSalary: number | string;
    maxSalary: number | string;
  }
) {
  const validated = validateSalaryBandInput(data);
  const model = getSalaryBandModel();

  const existing = await model.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new SalaryBandError('Salary band not found', 404);
  }

  // If payGrade or currency changed, check duplicate conflict
  if (existing.payGrade !== validated.payGrade || existing.currency !== validated.currency) {
    const duplicate = await model.findUnique({
      where: {
        payGrade_currency: {
          payGrade: validated.payGrade,
          currency: validated.currency,
        },
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new SalaryBandError(
        `Salary band for pay grade ${validated.payGrade} (${validated.currency}) already exists`,
        400
      );
    }
  }

  return await model.update({
    where: { id },
    data: validated,
  });
}
