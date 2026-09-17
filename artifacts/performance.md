# ACME Salary Management — Performance Considerations

> How the shipped system handles **~10,000 employees**. See also [`optimization_report.md`](./optimization_report.md) for concrete follow-ups.

## 1. Design goals at this scale

- List pages must feel interactive (filter/sort/page) without downloading the full workforce.
- Analytics must return aggregates, not raw employee dumps.
- Seeds must create 10k rows reliably (chunked inserts).
- Writes (adjustments, plan updates) must remain correct even if not maximally parallel on SQLite.

## 2. What we did for performance

### Server-side list operations

People, bands, audit, and planning tables **filter, sort, and paginate in the database**. The browser receives a page of rows, not 10k.

### USD fields on the employee row

`baseSalaryUSD` / `bonusUSD` allow org-wide metrics without FX joins on every analytics request.

### Prisma indexes

Employee indexes on department, country, pay grade, status, salary, name support common HR filters. Bands unique on `(payGrade, currency)`.

### Streaming UI (Suspense + skeletons)

Shell (headers/filters) paints first; data fetchers stream in. Perceived performance for HR ops tables.

### Chunked seeding

`prisma/seed.ts` inserts in chunks (e.g. 1000) to avoid giant single transactions during setup.

### Domain logic off the client

Compa-ratio, band position, plan utilization, analytics distributions live in `src/lib/*` — testable and not recomputed ad hoc in React for every row of the org.

## 3. Known pressure points (honest)

These are understood limits / next improvements (detail in optimization report):

| Area | Risk | Direction |
|------|------|-----------|
| Analytics band counts | Extra queries per pay grade | Prefer one fetch + in-memory bucketing |
| Plan bulk update / finalize | Serial SQLite writes | `$transaction` batches; later Postgres |
| Dashboard hire-date payroll series | Loads employee salary fields to build months | Pre-aggregate or sample if dataset grows |
| SQLite single writer | Concurrent mutations serialize | Acceptable for demo; Postgres for multi-user prod |
| Read caching | Hot analytics filters re-query options | Short TTL cache for filter dimensions |

## 4. What “good enough” means for the assessment

At **10k employees**, SQLite + indexed Prisma queries + pagination is a pragmatic, demoable architecture. The important engineering proof is:

1. We did **not** ship the spreadsheet anti-pattern (full dataset in the browser).
2. Money math is centralized and unit-tested.
3. We know where N+1 / serial writes hurt and how we would fix them.

## 5. Measurement mindset

Before micro-optimizing UI chrome, measure:

- Employee list query time with filters
- Analytics endpoint latency cold vs warm
- Plan finalize duration vs item count
- Seed wall-clock for 10k rows

That order matches real HR pain: **find people → understand pay → apply budgeted changes**.
