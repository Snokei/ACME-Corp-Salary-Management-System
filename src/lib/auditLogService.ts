import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { CURRENT_USER } from '@/constants';
export interface CreateAuditLogParams {
  userId?: string;
  userName?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  previousData?: any;
  newData?: any;
  metadata?: any;
}

export interface GetAuditLogsParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  sort?: 'asc' | 'desc';
}

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'auth_token',
  'secret',
  'apikey',
  'access_token',
  'refresh_token',
]);

/**
 * Recursively sanitizes object payload to remove sensitive keys.
 */
function sanitizeData(data: any): any {
  if (data === null || data === undefined) return null;
  if (typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map(sanitizeData);

  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      cleanObj[key] = '[REDACTED]';
    } else {
      cleanObj[key] = sanitizeData(value);
    }
  }
  return cleanObj;
}

/**
 * Returns a default fallback user. When userId/userName/userEmail are provided
 * explicitly via CreateAuditLogParams, those values take precedence.
 * Cookie-based user resolution is intentionally avoided here to keep this
 * service importable in both server and client contexts.
 */
async function resolveCurrentUser() {
  return {
    userId: undefined as string | undefined,
    userName: 'System User',
    userEmail: 'system@acme.com',
  };
}

/**

 * Safely creates an audit log entry.
 * Will NEVER throw an error or interrupt main execution path.
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const currentUser = await resolveCurrentUser();

    const userId = params.userId || currentUser.userId || 'usr-admin';
    const userName = params.userName || currentUser.userName || CURRENT_USER.fullName;
    const userEmail = params.userEmail || currentUser.userEmail || CURRENT_USER.email || 'valentino@acme.com';

    const previousDataSanitized = params.previousData ? sanitizeData(params.previousData) : null;
    const newDataSanitized = params.newData ? sanitizeData(params.newData) : null;
    const metadataSanitized = params.metadata ? sanitizeData(params.metadata) : null;

    const previousDataStr = previousDataSanitized ? JSON.stringify(previousDataSanitized) : null;
    const newDataStr = newDataSanitized ? JSON.stringify(newDataSanitized) : null;
    const metadataStr = metadataSanitized ? JSON.stringify(metadataSanitized) : null;

    await (prisma as any).auditLog.create({
      data: {
        userId,
        userName,
        userEmail,
        action: params.action.toUpperCase(),
        entityType: params.entityType.toUpperCase(),
        entityId: params.entityId || null,
        description: params.description,
        previousData: previousDataStr,
        newData: newDataStr,
        metadata: metadataStr,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log (silently handled):', error);
  }
}

/**
 * Safely parses a JSON string field.
 */
function parseJsonField(val: string | null): any {
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

/**
 * Retrieves paginated, filtered audit logs.
 */
export async function getAuditLogs(params: GetAuditLogsParams = {}) {
  const page = Math.max(1, parseInt(String(params.page || 1), 10));
  const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10), 10)));
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};

  if (params.action && params.action.toUpperCase() !== 'ALL') {
    where.action = params.action.toUpperCase();
  }

  if (params.entityType && params.entityType.toUpperCase() !== 'ALL') {
    where.entityType = params.entityType.toUpperCase();
  }

  if (params.userId && params.userId !== 'ALL') {
    where.userId = params.userId;
  }

  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) {
      where.createdAt.gte = new Date(params.startDate);
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    where.OR = [
      { description: { contains: s } },
      { userName: { contains: s } },
      { userEmail: { contains: s } },
      { entityType: { contains: s } },
      { entityId: { contains: s } },
      { action: { contains: s } },
    ];
  }

  const sortOrder = params.sort === 'asc' ? 'asc' : 'desc';

  const [total, logs] = await Promise.all([
    (prisma as any).auditLog.count({ where }),
    (prisma as any).auditLog.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      skip,
      take: limit,
    }),
  ]);

  const parsedLogs = logs.map((log: any) => ({
    ...log,
    previousData: parseJsonField(log.previousData as string | null),
    newData: parseJsonField(log.newData as string | null),
    metadata: parseJsonField(log.metadata as string | null),
  }));

  return {
    logs: parsedLogs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Retrieves a single audit log entry by ID.
 */
export async function getAuditLogById(id: string) {
  const log = await (prisma as any).auditLog.findUnique({
    where: { id },
  });

  if (!log) return null;

  return {
    ...log,
    previousData: parseJsonField(log.previousData),
    newData: parseJsonField(log.newData),
    metadata: parseJsonField(log.metadata),
  };
}
