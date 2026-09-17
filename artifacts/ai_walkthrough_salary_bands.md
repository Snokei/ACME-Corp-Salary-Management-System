# Walkthrough — Salary Bands & Compa-Ratio

> **Artifact purpose:** Post-implementation walkthrough of how the Salary Bands feature was built (with AI assistance) and verified.  
> Related: [`ai_workflow.md`](./ai_workflow.md) · Companion plan style: [`ai_plan_compensation_analytics.md`](./ai_plan_compensation_analytics.md)

We implemented **Salary Bands & Compa-Ratio** so HR can define pay ranges by grade and see whether employees are below, within, or above band.

---

## Summary of changes

### 1. Database schema (`prisma/schema.prisma`)

- Added `SalaryBand` model: `id`, `payGrade`, `currency`, `minSalary`, `midpointSalary`, `maxSalary`, `createdAt`, `updatedAt`
- Enforced `@@unique([payGrade, currency])` and `@@index([payGrade])`
- Applied with `prisma db push` (SQLite locally; Postgres on Vercel)

### 2. Seed data (`prisma/seedBands.ts`)

- Seed script for realistic ranges across pay grades (e.g. `L1`–`L7` and related grades)
- Run via `npx tsx prisma/seedBands.ts` (also part of `npm run db:seed`)

### 3. Business service (`src/lib/compaRatioService.ts`)

| Function | Behavior |
|----------|----------|
| `calculateCompaRatio` | `(salary / midpoint) × 100`, rounded to 1 decimal |
| `calculatePositionInBand` | Below / Within / Above Band + position % |
| `validateSalaryBandInput` | Positive numbers; `min < mid < max` |
| `getCompensationAnalysis` | Full band positioning for an employee (safe if no band) |

### 4. API & Server Actions

- `GET` / `POST` — `src/app/api/salary-bands/route.ts`
- `PUT` / `DELETE` — `src/app/api/salary-bands/[id]/route.ts`
- Server Actions — `src/actions/salaryBands.ts`

### 5. UI

| Surface | What was added |
|---------|----------------|
| `EmployeeDetailDrawer` | Band min/mid/max, compa-ratio %, position %, status, progress bar |
| `/salary-bands` | Search/filter, add/edit bands (`SalaryBandsView`, `SalaryBandsModal`) |
| Nav | “Salary Bands” → `/salary-bands` |
| Dashboard | Band insights card — below / within / above counts |

### 6. Automated tests (`src/__tests__/salaryBands.test.ts`)

**12 Vitest tests** covering:

- Band creation & validation (`min < mid < max`, positives)
- Duplicate pay grade + currency prevention
- Compa-ratio accuracy & rounding
- Position-in-band + Below / Within / Above classification
- Missing band handling
- Integration with salary adjustment (ratio updates after raise)

---

## Verification (at feature completion)

```bash
npx vitest run
```

Example result from the Salary Bands milestone:

```text
 ✓ src/__tests__/salaryBands.test.ts (12 tests)
 ✓ src/__tests__/salaryAdjustment.test.ts (13 tests)
 Test Files  2 passed
      Tests  25 passed
```

*(Full suite today is larger: analytics, planning, and Playwright E2E were added in later milestones — see [`testing.md`](./testing.md).)*

### Manual checks

- `/salary-bands` loads and supports create/edit
- Employee detail shows band position when a matching grade/currency band exists
- Dashboard band counts reflect seeded employees

---

## How AI was used on this feature

1. **Human framed the HR question** — “Where is pay vs band, and what’s the compa-ratio?”  
2. **AI scaffolded** schema, seed, service formulas, API routes, UI, and test cases  
3. **Human gated** uniqueness rules, formula rounding, and Vitest assertions  
4. **Committed incrementally** — bands → detail drawer → dashboard insights → tests  

Pattern: constrained domain math in `src/lib` + UI that only displays analysis — AI does not *decide* raises.
