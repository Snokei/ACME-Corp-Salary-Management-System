# ACME Salary Management System — Product & Tech Overview

> **Shipped-product source of truth.** Assessment framing, architecture, trade-offs, performance, and AI workflow live under [`artifacts/`](./artifacts/README.md).

## What this product is

**ACME Salary Management System** is an enterprise HR compensation platform for managing a large global workforce (seeded at **10,000 employees**). It helps HR / Admin users understand payroll, manage people and pay grades, analyze compensation fairness, plan annual salary budgets, and keep an audit trail of changes.

App branding and metadata describe it as:

> Enterprise HR Salary Analytics & Employee Management System for 10,000 global employees.

Package name: `acme-salary-management-system` (v1.0.0).

---

## Who it is for

- **Primary user:** Admin / HR (default persona: Valentino Morales)
- **Jobs to be done:**
  - See org-wide compensation health at a glance
  - Find and manage employees across departments and countries
  - Define and maintain salary bands by pay grade
  - Analyze pay distribution, band position, and adjustment trends
  - Run fiscal-year compensation plans with department budgets and proposed increases
  - Review a searchable audit log of sensitive changes

---

## What the product does (features by area)

### 1. Authentication & profile

- Email/password login against a `User` table
- Passwords hashed with **bcryptjs**
- Session via **JWT** (`jose`) stored in an HTTP-only `auth_token` cookie (24h)
- Middleware protects app pages and `/api/*` routes; unauthenticated users go to `/login`
- Profile settings: update name, email, and optional new password
- Logout clears the auth cookie
- Light/dark theme toggle

### 2. Dashboard (`/`)

Server-rendered overview of live employee data:

- **Total global payroll**, average base salary, median compensation, country count
- Payroll growth-style chart (monthly payroll derived from hire dates)
- Department composition (pie)
- Average salary by department and by country
- Salary band distribution (below / within / above band)
- Recent hires / recent salary snapshot cards
- Greeting personalized from the logged-in user

### 3. People (`/people`, `/people/[id]`)

Employee directory and detail management for the global workforce:

- Search, filter (department, role, location, status), sort, paginate
- Status concepts: Active, On Leave, Contract, and related tabs
- Add employees
- Employee detail view / drawer
- CSV-oriented export headers for employee fields
- **Salary adjustments** per employee with reasons such as Promotion, Annual Increase, Performance, Market Adjustment, Cost of Living, Role Change, Retention, Other
- Adjustments write **salary history** and update current pay (with USD normalization)

Employees carry: ID (`ACM-#####`), name, email, department, role, country, city, local currency + base salary, USD base/bonus, pay grade (L1–L7), gender, hire date, performance rating, status.

### 4. Salary bands (`/salary-bands`)

Define and manage pay ranges:

- Per **pay grade + currency**: min, midpoint, max
- Search / filter / sort / paginate bands
- Create and update bands
- Used to compute **compa-ratio** and **position in band** for employees

**Compa-ratio** = `(current salary / band midpoint) × 100`  
**Position in band** = relative placement vs min–max (Below / Within / Above Band)

### 5. Compensation analytics (`/compensation-analytics`)

HR deep-dive analytics with filters (department, country, pay grade, currency, period):

- Summary metrics: headcount, average / median / min / max base salary
- Salary distribution buckets
- Compensation by department and by pay grade
- Band placement stats (below / within / above / no band) and average compa-ratio by grade
- Compensation by country
- Salary adjustment trends over quarter or month (increases, decreases, totals)

### 6. Planning & budget (`/compensation-planning`, `/compensation-planning/[id]`)

Annual / fiscal compensation planning workflow:

- Create plans with name, fiscal year, total budget (USD)
- Plan statuses: **Draft → In Review → Approved / Rejected → Finalized**
- Department budget allocations
- Per-employee proposed salaries / increase amounts & percentages
- Bulk update of plan items
- Scenario simulation (e.g. apply a % increase and see budget impact)
- Metrics: allocated vs remaining budget, utilization, planned increase, employees affected
- Band / compa-ratio context on proposed changes

### 7. Audit log (`/audit-log`)

Change history for compliance and accountability:

- Records action, entity type/id, description, previous/new data, metadata, actor
- List with search, filters (user, action, entity, date range), sort, pagination
- Detail drawer for a single log entry
- Sensitive fields (password, tokens, secrets, etc.) are redacted before storage
- Logging is designed not to break main business flows if it fails

---

## Product domain model (data)

| Entity | Purpose |
|--------|---------|
| **Employee** | Global workforce records (indexed by department, country, pay grade, status, salary) |
| **SalaryHistory** | Historical salary changes / adjustments |
| **User** | Auth accounts (email, password hash, name) |
| **SalaryBand** | Pay-grade ranges (unique per pay grade + currency) |
| **CompensationPlan** | Fiscal planning container (budget, status, year) |
| **CompensationPlanDepartment** | Budget allocation per department within a plan |
| **CompensationPlanItem** | Proposed raise per employee within a plan |
| **AuditLog** | Immutable-style activity trail of system changes |

Database: **SQLite** via Prisma (`prisma/dev.db`).

Seed scripts generate ~10k employees across 8 departments, many countries/currencies, pay grades L1–L7, plus salary bands, a default user, and statuses (`npm run db:seed`).

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 14** (App Router) |
| UI | **React 18**, **Tailwind CSS**, Lucide icons |
| Charts | **Recharts** |
| Language | **TypeScript** |
| ORM / DB | **Prisma 5** + **SQLite** |
| Auth | **jose** (JWT), **bcryptjs**, cookie session, Next middleware |
| Toasts | **react-hot-toast** |
| Testing | **Vitest** + Testing Library + jsdom |
| Seeding | **@faker-js/faker**, **tsx** |
| Styling helpers | `clsx`, `tailwind-merge` |

### Architecture patterns used in the codebase

- **App Router pages** with server components + client interactive views
- **Streaming / Suspense** shells (filters and tables load independently with skeletons)
- **Server Actions** for auth and some mutations (`src/actions/*`)
- **REST API routes** under `src/app/api/*` for employees, salary bands, analytics, planning, audit logs
- **Service layer** in `src/lib/*` (planning, analytics, salary bands/compa-ratio, adjustments, audit, dashboard)
- **Providers** for people / salary bands / planning client state
- Shared UI primitives: Button, Modal, Drawer, Table, Select, Avatar, StatusBadge, skeletons, etc.

### Key npm scripts

```bash
npm run dev          # Next.js development server
npm run build        # prisma generate + next build
npm run start        # production server
npm run lint         # ESLint
npm run db:generate  # Prisma client
npm run db:push      # push schema to SQLite
npm run db:seed      # seed employees, user, bands, statuses
npm test             # Vitest once
npm run test:watch   # Vitest watch
```

### Main app routes

| Path | Feature |
|------|---------|
| `/login` | Sign in |
| `/` | Dashboard |
| `/people` | Employee directory |
| `/people/[id]` | Employee detail |
| `/salary-bands` | Salary band management |
| `/compensation-analytics` | Analytics dashboard |
| `/compensation-planning` | Plans list / overview |
| `/compensation-planning/[id]` | Plan detail (allocations, items, scenarios) |
| `/audit-log` | Audit trail |

### Notable API surfaces

- `GET/POST /api/employees`
- `GET/POST /api/employees/[id]/salary-adjustments`
- `GET/POST /api/salary-bands`, `.../salary-bands/[id]`
- `GET /api/compensation-analytics`
- `GET/POST /api/compensation-planning`
- Plan detail: status, departments, items, bulk-update, scenarios
- `GET /api/audit-logs`, `GET /api/audit-logs/[id]`

### Tests present

- Salary bands
- Salary adjustments
- Compensation analytics
- Compensation planning

---

## Geographic & org coverage (as modeled)

- **Departments:** Engineering, Product, Sales, Marketing, Finance, Human Resources, Legal, Operations
- **Pay grades:** L1–L7
- **Countries / currencies in seed data:** US (USD), UK (GBP), India (INR), Germany/France (EUR), Japan (JPY), Australia (AUD), Canada (CAD), Singapore (SGD), Brazil (BRL)
- Salaries stored in local currency and normalized to **USD** for org-wide analytics and planning

---

## UI / product character

- Visual direction researched on **Dribbble** and **Pinterest** (HR/SaaS dashboards), then locked into a **theme-based** component set under `src/components/ui/`
- Warm stone + amber visual language, glass-style cards, pill navigation
- Dark mode supported (default HTML class includes dark)
- Responsive layout with mobile nav
- Designed as a dense HR ops console: metrics, tables, drawers/modals, charts — not a marketing site

---

## In short

ACME is a **full-stack Next.js compensation & HR salary platform**: authenticate as HR, manage a 10k-employee global directory, maintain salary bands, analyze fairness and trends, run budgeted raise planning with scenarios, record salary history, and audit changes — all backed by Prisma/SQLite and JWT-secured routes.
