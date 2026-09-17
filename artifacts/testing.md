# ACME Salary Management — Test Coverage

> Unit tests for core compensation logic. Run with `npm test` (Vitest).  
> Assessment goal: meaningful, fast, deterministic tests — not UI snapshot spam.

## Summary

| Suite | File | Tests | What it protects |
|-------|------|------:|------------------|
| Salary adjustments | `src/__tests__/salaryAdjustment.test.ts` | 13 | Pay changes + history integrity |
| Salary bands / compa-ratio | `src/__tests__/salaryBands.test.ts` | 12 | Band rules + fairness math |
| Compensation analytics | `src/__tests__/compensationAnalytics.test.ts` | 10 | Org-level “how we pay” answers |
| Compensation planning | `src/__tests__/compensationPlanning.test.ts` | 11 | Budget plans, scenarios, finalize |

**Total: 46 tests** (all targeting `src/lib/*` business logic).

---

## 1. Salary adjustment workflow

**File:** `salaryAdjustment.test.ts`  
**Code under test:** `src/lib/salaryAdjustmentService.ts` (and related history writes)

| # | Behavior covered |
|---|------------------|
| 1 | Creating a `SalaryHistory` record on adjustment |
| 2 | Updating the employee’s current / base salary |
| 3 | History create + employee update run together (transaction) |
| 4 | If history insert fails, employee salary is unchanged |
| 5 | If employee update fails, history insert is rolled back |
| 6 | Percentage change calculation is correct |
| 7 | Salary **increase** works |
| 8 | Salary **decrease** works |
| 9 | Rejects invalid salary amounts |
| 10 | Rejects missing reason |
| 11 | Rejects missing effective date |
| 12 | Unknown employee returns a clear error |
| 13 | History entries ordered by `effectiveDate` descending |

**Why it matters:** Spreadsheet replacements often overwrite pay. These tests lock “never lose history” and input validation.

---

## 2. Salary bands & compa-ratio

**File:** `salaryBands.test.ts`  
**Code under test:** `src/lib/compaRatioService.ts` (+ band create / analysis)

| # | Behavior covered |
|---|------------------|
| 1 | Creating a `SalaryBand` |
| 2 | Band salaries must be positive |
| 3 | Enforces `min < midpoint < max` |
| 4 | Blocks duplicate `payGrade + currency` |
| 5 | Compa-ratio = `(salary / midpoint) × 100` |
| 6 | Compa-ratio rounded to one decimal place |
| 7 | Position-in-band calculation |
| 8 | Detects **Below Band** |
| 9 | Detects **Within Band** |
| 10 | Detects **Above Band** |
| 11 | Safe handling when no band matches |
| 12 | After a salary adjustment, compa-ratio updates |

**Why it matters:** Answers “is this person paid fairly vs their grade?” with formulas that must stay correct.

---

## 3. Compensation analytics

**File:** `compensationAnalytics.test.ts`  
**Code under test:** `src/lib/compensationAnalyticsService.ts`

| # | Behavior covered |
|---|------------------|
| 1 | Summary metrics: count, average, min, max, median |
| 2 | Salary distribution buckets cover expected ranges |
| 3 | Department compensation (headcount + USD metrics) |
| 4 | Country compensation using `baseSalaryUSD` |
| 5 | Pay-grade compensation + average compa-ratio |
| 6 | Filter by department |
| 7 | Filter by country |
| 8 | Filter by pay grade |
| 9 | Adjustment analytics include increases and decreases |
| 10 | Empty DB / no matching filters handled gracefully |

**Why it matters:** Core assessment need — HR can answer how the org pays people across slices of the workforce.

---

## 4. Compensation planning / budget

**File:** `compensationPlanning.test.ts`  
**Code under test:** `src/lib/compensationPlanningService.ts`

| # | Behavior covered |
|---|------------------|
| 1 | Creating a compensation plan |
| 2 | Total budget cannot be negative |
| 3 | Department allocations update and validate |
| 4 | Error when allocations exceed total budget |
| 5 | Dual input: % increase → proposed salary |
| 6 | Dual input: proposed salary → % increase |
| 7 | Disallows salary decreases in proposals |
| 8 | Scenario simulation does **not** mutate saved proposals |
| 9 | Status workflow transitions (e.g. Draft → …) |
| 10 | Finalizing applies raises to employees + writes history |
| 11 | Blocks deleting Finalized plans without force |

**Why it matters:** Forward-looking budget decisions stay consistent with current pay and audit history.

---

## What we deliberately did **not** over-test

- Presentational React components / CSS  
- Full browser E2E flows (optional for demos; not required for this unit-test bar)  
- Every API route as HTTP (services are tested directly — faster and clearer)

---

## How to run

```bash
npm test          # once
npm run test:watch
```

Tests should stay **fast**, **deterministic**, and readable so reviewers (and future changes) can trust the money paths.
