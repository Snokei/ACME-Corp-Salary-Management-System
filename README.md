# ACME Salary Management System

Web-based salary management and compensation analytics for ACME’s HR Manager — built to replace spreadsheet workflows for **~10,000 employees** across multiple countries.

## Live demo

- **Deployed app:** [https://acme-corp-salary-management-system.vercel.app/login](https://acme-corp-salary-management-system.vercel.app/login)
- **Repository:** [https://github.com/Snokei/ACME-Corp-Salary-Management-System](https://github.com/Snokei/ACME-Corp-Salary-Management-System)

### Demo login

| Field | Value |
|-------|--------|
| Email | `admin@acme.com` |
| Password | `password123` |

### Vercel environment variables (required)

In **Vercel → Project → Settings → Environment Variables**, set:

| Name | Value |
|------|--------|
| `DATABASE_URL` | `file:./dev.db` |
| `JWT_SECRET` | a long random secret (same idea as local `.env`) |

Also ensure `prisma/dev.db` (seeded SQLite file) is committed so the serverless build can include it. Without these, login returns a server error.

> Video demo: add your walkthrough link here when ready.

## What it does

HR can **manage** compensation data and **answer** how the org pays people:

- **Dashboard** — payroll, averages/medians, department & country charts, band distribution
- **People** — search/filter/paginate employees; salary adjustments with history
- **Salary bands** — pay-grade ranges; compa-ratio & position in band
- **Analytics** — distribution, dept/grade/country insights, adjustment trends
- **Planning & budget** — fiscal plans, department allocations, scenarios, status workflow
- **Audit log** — searchable trail of sensitive changes

Full shipped feature list: [`PRODUCT_OVERVIEW.md`](./PRODUCT_OVERVIEW.md)

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript |
| UI | Tailwind CSS, Lucide, Recharts |
| Database | SQLite via Prisma |
| Auth | JWT (`jose`) + bcrypt, HTTP-only cookie |
| Tests | Vitest |

## Quick start (local)

```bash
# Install
npm install

# Env — copy .env.example to .env and set:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your-long-random-secret"

# Database
npm run db:generate
npm run db:push
npm run db:seed          # ~10,000 employees + admin user + bands

# Run
npm run dev              # http://localhost:3000

# Tests
npm test
```

## Project structure

```text
src/app/           # Pages + API routes
src/components/    # UI by domain
src/lib/           # Domain services (analytics, planning, bands, …)
src/actions/       # Server Actions (auth, mutations)
src/__tests__/     # Unit tests
prisma/            # Schema + seed
artifacts/         # Assessment thinking docs
```

## Assessment artifacts

Thinking, design, and trade-offs for reviewers:

| Doc | Link |
|-----|------|
| Index | [`artifacts/README.md`](./artifacts/README.md) |
| One-page requirements | [`artifacts/requirements.md`](./artifacts/requirements.md) |
| Design notes | [`artifacts/design_notes.md`](./artifacts/design_notes.md) |
| Architecture | [`artifacts/architecture.md`](./artifacts/architecture.md) |
| Trade-offs | [`artifacts/tradeoffs.md`](./artifacts/tradeoffs.md) |
| Performance | [`artifacts/performance.md`](./artifacts/performance.md) |
| AI workflow | [`artifacts/ai_workflow.md`](./artifacts/ai_workflow.md) |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Prisma generate + production build |
| `npm start` | Production server |
| `npm run db:seed` | Seed 10k employees, user, bands, statuses |
| `npm test` | Run unit tests |

## License

Private assessment submission.
