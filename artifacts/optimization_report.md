# ACME Salary Management — Optimization Report

## Overview
This report covers concrete optimizations across **database queries**, **backend logic**, **security**, **frontend performance**, and **code quality** — all grounded in the actual codebase.

---

## 🔴 Critical (High Impact)

### 1. N+1 Query Explosion in Analytics Service
**File**: [`compensationAnalyticsService.ts`](file:///d:/project/ACME/src/lib/compensationAnalyticsService.ts#L281-L343)

`payGradeCompensation` runs 3 additional `prisma.employee.count()` calls (below/within/above band) *per pay grade*, inside a `Promise.all(payGradeAggregates.map(...))`. With many pay grades this compounds into many DB round-trips.

```diff
- // 3 DB calls per pay grade = N×3 queries
- const [below, within, above] = await Promise.all([
-   prisma.employee.count({ where: { ...where, payGrade: pg, baseSalaryUSD: { lt: band.minSalary } } }),
-   ...
- ]);

+ // Fetch all employees once, group and count in-memory
+ const allEmployeesForBands = await prisma.employee.findMany({
+   where,
+   select: { payGrade: true, baseSalaryUSD: true },
+ });
```

Similarly, `departmentCompensation` fires one median query **per department** (line 230). These should be pulled into a single `findMany` and computed in-memory.

---

### 2. `bulkUpdatePlanItems` Uses a Serial Loop of DB Writes
**File**: [`compensationPlanningService.ts`](file:///d:/project/ACME/src/lib/compensationPlanningService.ts#L907-L924)

```ts
// Current — one UPDATE per employee, one at a time
for (const item of items) {
  await models.item.update({ ... });
}
```

With hundreds of employees, this can lock the SQLite file and be very slow. The fix is to use `updateMany` where possible, or batch into a transaction:

```ts
// Better — single transaction
await prisma.$transaction(
  items.map((item) =>
    models.item.update({ where: { id: item.id }, data: { ... } })
  )
);
```

---

### 3. `finalizeCompensationPlan` — Serial Loop for Critical Write Path
**File**: [`compensationPlanningService.ts`](file:///d:/project/ACME/src/lib/compensationPlanningService.ts#L1194-L1226)

Each employee update + salary history create is awaited sequentially inside a loop. For a plan with 500 employees this is 1,000 sequential writes. This should be wrapped in a `prisma.$transaction([...])` for atomicity *and* performance.

```ts
await prisma.$transaction(async (tx) => {
  for (const item of plan.items) {
    await tx.employee.update({ ... });
    await tx.salaryHistory.create({ ... });
  }
});
```

This also ensures the plan either fully applies or fully rolls back — currently partial finalization is possible if the server crashes mid-loop.

---

### 4. Hardcoded Credentials / Secrets
**File**: [`middleware.ts`](file:///d:/project/ACME/src/middleware.ts#L5)

```ts
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-jwt-signing';
```

The fallback `'super-secret-key-for-jwt-signing'` is a security vulnerability — it will silently be used in production if the env var is not set. Replace with a hard failure:

```ts
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET env variable is not set');
```

---

### 5. API Routes Skip Auth Entirely
**File**: [`middleware.ts`](file:///d:/project/ACME/src/middleware.ts#L12-L18)

```ts
if (request.nextUrl.pathname.startsWith('/api') || ...) {
  return NextResponse.next(); // ← no auth check
}
```

All `/api/*` routes are completely unprotected. A user who knows the URL can call them directly without a valid session token. Auth validation should be performed inside each API route handler or via a shared utility.

---

## 🟡 Medium Impact

### 6. Duplicate Metric Calculation Logic
**File**: [`compensationPlanningService.ts`](file:///d:/project/ACME/src/lib/compensationPlanningService.ts#L101-L155) and [`getAllCompensationPlans` L194-L237](file:///d:/project/ACME/src/lib/compensationPlanningService.ts#L194-L237)

The same 7-line budget metric calculation (totalBudget, allocatedBudget, plannedIncrease, utilization, etc.) is copy-pasted between `getPlanSummaryMetrics()` and `getAllCompensationPlans()`. Extract to a shared helper:

```ts
function computePlanMetrics(plan: { totalBudgetUSD: number; departments: any[]; items: any[] }): PlanSummaryMetrics { ... }
```

---

### 7. `getCompensationPlanById` Calls `getPlanSummaryMetrics` Which Refetches the Same Plan
**File**: [`compensationPlanningService.ts`](file:///d:/project/ACME/src/lib/compensationPlanningService.ts#L246-L270)

`getCompensationPlanById` fetches the plan, then calls `getPlanSummaryMetrics(id)` which fetches the *same plan again* from the DB. This is a redundant query. Pass the already-fetched plan data directly.

---

### 8. `updateDepartmentAllocations` — Sequential Upserts
**File**: [`compensationPlanningService.ts`](file:///d:/project/ACME/src/lib/compensationPlanningService.ts#L636-L658)

```ts
for (const alloc of allocations) {
  await models.dept.upsert({ ... }); // sequential
}
```

Convert to `Promise.all()` for parallel execution, or a transaction for atomicity.

---

### 9. `getCompensationAnalytics` — 4 Parallel `groupBy` Calls for Filter Options on Every Request
**File**: [`compensationAnalyticsService.ts`](file:///d:/project/ACME/src/lib/compensationAnalyticsService.ts#L111-L116)

Filter options (departments, countries, pay grades, currencies) don't change frequently. These 4 DB queries run on every analytics page load. Consider caching them server-side with a short TTL (e.g. using Next.js `unstable_cache` or a module-level cache with a 60-second expiry).

---

### 10. Avatar URL Assignment is Index-Based, Not Employee-Based
**File**: [`employeeData.ts`](file:///d:/project/ACME/src/lib/employeeData.ts#L272-L276)

```ts
const avatarUrl = VERIFIED_AVATARS[index % VERIFIED_AVATARS.length] || ...
```

The avatar assigned to an employee depends on their position in the current page's result set, so the same employee gets different avatars on different pages or sort orders. Use a stable hash of the employee's `id` instead:

```ts
const hash = emp.id.charCodeAt(0) + emp.id.charCodeAt(emp.id.length - 1);
const avatarUrl = VERIFIED_AVATARS[hash % VERIFIED_AVATARS.length];
```

---

### 11. `getModels()` Called on Every Function Invocation
**File**: [`compensationPlanningService.ts`](file:///d:/project/ACME/src/lib/compensationPlanningService.ts#L83-L96)

`getModels()` casts `prisma as any` and does a safety check on every call. Since Prisma's models are always available after `generate`, this could be simplified to a typed, module-level constant instead of repeated function calls.

---

### 12. Missing `status` Filter in Employee Search
**File**: [`employeeData.ts`](file:///d:/project/ACME/src/lib/employeeData.ts#L242-L244)

The `tab` param maps to `status` in the DB filter — but the `status` field is not in the `Employee` model's `@@index` list in [`schema.prisma`](file:///d:/project/ACME/prisma/schema.prisma#L42), meaning tab-based filtering does a full scan on large tables. Add a composite index:

```prisma
@@index([status, department])
```

---

## 🟢 Low Impact / Code Quality

### 13. `any` Types Throughout Service Layer
**Files**: All service files use `as any` casts extensively (e.g., `p.compensationPlan as any`, `item: any`, `g: any`).

Generate proper Prisma types and use them. This eliminates silent type errors and improves IDE autocomplete.

---

### 14. Hardcoded Username in Multiple Places
**Files**: [`compensationPlanningService.ts`](file:///d:/project/ACME/src/lib/compensationPlanningService.ts#L313), [`auditLogService.ts`](file:///d:/project/ACME/src/lib/auditLogService.ts#L68)

`'Valentino Morales'` and `'valentino@acme.com'` are hardcoded in at least 6 places. The `resolveCurrentUser()` function in `auditLogService.ts` always returns this hardcoded value. This should read from the JWT session, not a constant.

---

### 15. No `revalidate` or Caching Headers on API Routes
The analytics and dashboard API routes don't set any caching headers or Next.js `revalidate`. Adding:

```ts
export const revalidate = 60; // or per-route cache-control headers
```

...would allow Next.js to serve stale data from cache for non-mutating reads, dramatically reducing DB load.

---

### 16. Build Script Uses `--accept-data-loss` on Every Deploy
**File**: [`package.json`](file:///d:/project/ACME/package.json#L7)

```json
"build": "prisma db push --accept-data-loss && ..."
```

This flag silently drops columns/tables on schema changes. This is dangerous for any shared/staging environment. Switch to Prisma Migrate for a proper migration history.

---

### 17. SQLite is the Bottleneck for Scale
**File**: [`schema.prisma`](file:///d:/project/ACME/prisma/schema.prisma#L7-L10)

SQLite has a single-writer limitation. With concurrent requests (bulk updates, finalization, audit log writes), all writes are serialized. For a system managing 10,000 employees, migrating to **PostgreSQL** would unlock parallel writes, `COPY`-style bulk inserts, and better query planning.

---

## Summary Table

| # | Area | Impact | Effort |
|---|------|--------|--------|
| 1 | Analytics N+1 query explosion | 🔴 High | Medium |
| 2 | Bulk update serial loop | 🔴 High | Low |
| 3 | Non-atomic plan finalization | 🔴 High | Low |
| 4 | Hardcoded JWT secret fallback | 🔴 Security | Low |
| 5 | API routes bypass auth | 🔴 Security | Medium |
| 6 | Duplicate metric logic | 🟡 Medium | Low |
| 7 | Double-fetch in getCompensationPlanById | 🟡 Medium | Low |
| 8 | Sequential dept upserts | 🟡 Medium | Low |
| 9 | Filter options re-queried on every load | 🟡 Medium | Medium |
| 10 | Unstable avatar assignment | 🟡 UX | Low |
| 11 | getModels() overhead | 🟢 Low | Low |
| 12 | Missing composite DB index | 🟡 Medium | Low |
| 13 | Pervasive `any` types | 🟢 Quality | High |
| 14 | Hardcoded username in audit logs | 🟡 Medium | Medium |
| 15 | No caching on read API routes | 🟡 Medium | Low |
| 16 | `--accept-data-loss` in build | 🔴 Risk | Low |
| 17 | SQLite single-writer limitation | 🟡 Scale | High |
