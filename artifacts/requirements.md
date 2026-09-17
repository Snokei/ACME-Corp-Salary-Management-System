# ACME Salary Management — Requirements (One Page)

> Assessment one-pager. Shipped product detail: [`../PRODUCT_OVERVIEW.md`](../PRODUCT_OVERVIEW.md).  
> Deeper product thinking: [`design_notes.md`](./design_notes.md).

## Goal

Replace ACME HR’s Excel-based salary process with a web app for **~10,000 employees across multiple countries**. The HR Manager must be able to **manage compensation data** and **answer how the org pays people** — not merely perform CRUD.

## Persona

**HR Manager / Admin** — find people, change pay with history, define bands, analyze fairness, plan budgets, and review change trails.

## In Scope (what we shipped)

| Area | Capability |
|------|------------|
| **Auth & profile** | Login (JWT cookie), logout, profile update, light/dark theme |
| **Dashboard** | Live payroll / avg / median metrics, dept & country charts, band distribution |
| **People** | Search, filter, sort, paginate; add employees; detail pages; salary adjustments + history; CSV-oriented export fields |
| **Salary bands** | Min / mid / max by pay grade + currency; compa-ratio & position-in-band |
| **Analytics** | Filtered org insights: distribution, dept/grade/country pay, band placement, adjustment trends |
| **Planning & budget** | Fiscal plans, dept allocations, proposed raises, scenarios, status workflow through Finalized |
| **Audit log** | Searchable change history with redacted sensitive fields |
| **Data** | Seed ~10,000 employees (+ bands, user, statuses) |
| **Quality** | Unit tests for bands, adjustments, analytics, planning |

## Deliberately Out of Scope (and why)

- **Payroll execution / tax** — separate regulated system; does not improve compensation *insight*.
- **Benefits, leave, ATS, employee self-service** — adjacent HR products; dilute the salary problem.
- **Full HRMS / external payroll integrations** — complexity without answering “how do we pay people?”
- **SSO / enterprise IdP** — single HR persona; simple auth is enough for this assessment.
- **AI that recommends or decides raises** — system surfaces evidence; humans decide.

## Technical Constraints (met)

- End-to-end backend + UI: **Next.js 14 (App Router) + React + TypeScript**
- Relational DB: **SQLite via Prisma**
- Server-side search / filter / pagination / aggregation (do not ship 10k rows to the browser)
- Deployable, demoable application with incremental Git history

## Delivery

Deployed app + repo + tests + these artifacts (design, architecture, trade-offs, performance, AI workflow) + video demo.
