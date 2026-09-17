# ACME Salary Management — Trade-offs

> Decisions behind the shipped system in [`../PRODUCT_OVERVIEW.md`](../PRODUCT_OVERVIEW.md).

## 1. Next.js monolith vs separate API + SPA

**Chose:** Next.js 14 App Router (UI + Server Actions + Route Handlers together).

| Pros | Cons |
|------|------|
| One deploy, shared types, fast to ship | Less isolation than a dedicated API service |
| SSR/Suspense for heavy HR tables | Must be careful about client bundle size |
| Fits assessment “end-to-end” constraint cleanly | Scaling UI and API independently later needs a split |

**Why:** For an HR Manager tool at assessment scope, time-to-correctness and cohesion beat microservice purity.

## 2. SQLite vs PostgreSQL

**Chose:** SQLite via Prisma (`file:./dev.db`).

| Pros | Cons |
|------|------|
| Zero ops for seed/demo/deploy | Single-writer; concurrent write contention |
| Matches “SQLite OK” constraint | Harder for multi-instance production later |
| Easy local + Vercel-style file tracing | Bulk finalize/planning writes are serial |

**Why:** Correct for demo scale (10k rows) and submission simplicity. **Follow-up:** Postgres if concurrency or multi-region becomes real.

## 3. Core scope vs stretch modules

**Chose:** Ship core (People, history, analytics, bands) **plus** Planning & Audit.

| Pros | Cons |
|------|------|
| Stronger answer to “how does the org pay / plan to pay people?” | More surface area to maintain and test |
| Bands unlock real fairness metrics | Reviewers might ask if planning was necessary |

**Why:** Bands are required for honest compa-ratio. Planning turns analytics into forward decisions without AI auto-deciding. Audit matches salary sensitivity. All three stay inside compensation — not leave/ATS/payroll.

## 4. Server aggregations vs client-side charts over full data

**Chose:** Aggregate in `src/lib/*`; send summaries/pages to the client.

| Pros | Cons |
|------|------|
| Browser never holds 10k salary rows | More backend logic to design/test |
| Deterministic metrics for Vitest | Some analytics paths can still be chatty (see performance notes) |

**Why:** Spreadsheet pain at 10k is exactly “everything in one grid.” The architecture refuses that pattern.

## 5. JWT cookie session vs full SSO / NextAuth providers

**Chose:** Email/password + bcrypt + `jose` JWT in HTTP-only cookie + middleware.

| Pros | Cons |
|------|------|
| Simple, inspectable, enough for one HR persona | No SSO, MFA, or fine-grained RBAC |
| Explicit middleware story for interviews | Secrets must be env-managed carefully |

**Why:** Assessment persona is a single HR Manager. SSO would be ceremony without product value here.

## 6. REST route handlers + Server Actions (hybrid)

**Chose:** Actions for auth/profile-style flows; REST for list/analytics/planning APIs used by fetchers.

| Pros | Cons |
|------|------|
| Pragmatic fit for App Router | Two mutation styles to remember |
| Clear HTTP surface for complex planning endpoints | Need consistent auth on both paths |

**Why:** Planning/analytics benefit from explicit resource URLs; login benefits from progressive form Actions.

## 7. Custom Tailwind UI vs heavy component library

**Chose:** Custom primitives (`Button`, `Table`, `Modal`, `Drawer`, …) + Tailwind + Lucide + Recharts.

| Pros | Cons |
|------|------|
| Consistent HR-console look | More UI code owned by us |
| No design-system lock-in | Accessibility must be maintained manually |

**Why:** Assessment cares about engineering judgment and polish, not which vendor kit was imported.

## 8. Scenario simulation vs “AI recommended raises”

**Chose:** Deterministic % scenarios and budget math; **no** ML/LLM salary decisions.

| Pros | Cons |
|------|------|
| Explainable, testable, auditable | No “smart” recommendation wow-factor |
| Matches “AI for building, not deciding pay” | HR still does the judgment work |

**Why:** Intentional: AI accelerates engineering; compensation decisions stay human.

## Summary

Prefer **clarity, demo reliability, and compensation focus** over enterprise completeness. Trade-offs that would change first under real production load: **Postgres**, stronger **RBAC**, and **write-path batching/transactions** for plan finalization.
