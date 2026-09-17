# AI Implementation Plan — Compensation Analytics

> **Artifact purpose:** Example of how AI was briefed before building a feature.  
> Reviewers can see the **instruction → constraints → verification** loop, not just the final code.  
> Related: [`ai_workflow.md`](./ai_workflow.md) · Shipped feature: `/compensation-analytics`

This plan was given to an agentic AI coding tool (Cursor) to implement the Compensation Analytics module. Human review kept server-side aggregations, USD-only cross-country math, and Vitest coverage.

---

## Goal

Build a dedicated **Compensation Analytics** page (`/compensation-analytics`) for HR Managers to analyze salary distribution, pay grades, compa-ratios, department/country benchmarks, and adjustment trends across **10,000 employees**, with **server-side database aggregations** and visualizations using **Recharts**.

---

## Constraints called out for AI (human gate)

| Constraint | Why |
|------------|-----|
| Optional `previousAmountUSD` on `SalaryHistory` | Accurate increase **and** decrease trends without breaking existing flows |
| All aggregations on the server (Prisma `COUNT` / `AVG` / `MIN` / `MAX` / `groupBy`, median via ordered skip/take) | Browser must **not** receive 10k employee rows |
| Cross-location / cross-department math uses `baseSalaryUSD` only | Avoid mixing local currencies |
| Tests for summary, buckets, filters, increases **and** decreases | Money math must stay correct after AI scaffolding |

---

## Proposed changes (brief given to AI)

### Database

- **Modify** `prisma/schema.prisma` — add optional `previousAmountUSD Float?` on `SalaryHistory`.

### Backend

- **New** `src/lib/compensationAnalyticsService.ts` — `getCompensationAnalytics(filters)` returning:
  - `summary` — count, avg, median, min, max (USD)
  - `salaryDistribution` — buckets (`<$50K`, `$50K–$100K`, … `$200K+`)
  - `departmentAnalytics` / `payGradeAnalytics` / `countryAnalytics`
  - `bandDistribution` — below / within / above / no band (+ compa-ratio via existing service)
  - `adjustmentTrends` — by month/quarter (counts, total/avg change, increases & decreases)
  - `filterOptions` — distinct departments, countries, pay grades, currencies
- **Modify** `salaryAdjustmentService.ts` — set `previousAmountUSD` when writing history
- **New** `GET /api/compensation-analytics` — query params: `department`, `country`, `payGrade`, `currency`, `period`

### UI / navigation

- **Modify** `NAV_ITEMS` — Analytics → `/compensation-analytics`
- **New** analytics view — filters, metric cards, Recharts charts/tables, loading/empty/error
- **New** `src/app/compensation-analytics/page.tsx` — App Router page (server shell + client view)

### Tests

- **New** `src/__tests__/compensationAnalytics.test.ts` — summary, distribution, dept/grade/country, filters, trends (up & down), empty/edge cases

---

## Verification plan (also given to AI)

### Automated

- `npx vitest run` — new analytics tests + existing suite must stay green

### Manual

- `/compensation-analytics` loads against seeded ~10k employees
- Filters update metrics dynamically
- Network tab shows **small aggregated JSON**, not 10k rows

---

## What shipped (outcome of this plan)

| Planned | Shipped |
|---------|---------|
| `previousAmountUSD` on `SalaryHistory` | Yes (`prisma/schema.prisma`) |
| `compensationAnalyticsService.ts` | Yes (`src/lib/`) |
| `GET /api/compensation-analytics` | Yes |
| Analytics nav + page + Recharts UI | Yes (`src/components/analytics/CompensationAnalyticsView.tsx`) |
| Vitest coverage | Yes (`compensationAnalytics.test.ts` — 10 cases) |

Minor path note: the view lives under `src/components/analytics/` (domain folder), which matches the rest of the app structure better than a flat `components/` root.

---

## How this shows intentional AI use

1. **Problem framed first** — HR questions + 10k scale, not “build charts.”  
2. **Hard constraints in the prompt** — USD, server aggregations, schema change called out as review-sensitive.  
3. **Definition of done** — tests + network payload check, not “looks good.”  
4. **Human kept ownership** — formula correctness and empty/filter edge cases verified via Vitest.

This is the preferred pattern for other modules (bands, planning): **write a constrained implementation plan → AI implements → human verifies with tests.**
