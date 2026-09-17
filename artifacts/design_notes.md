# ACME Salary Management — Design Notes

> Companion to [`requirements.md`](./requirements.md).  
> What we actually built: [`../PRODUCT_OVERVIEW.md`](../PRODUCT_OVERVIEW.md).

## 1. Problem framing

ACME’s HR team manages salaries for **~10,000 multi-country employees in spreadsheets**. That is slow for day-to-day updates and unreliable for org-level questions (“What is median pay in Engineering in India?”).

I treated this as **two jobs**, not one:

1. **Operate** — find an employee, change salary safely, keep history.
2. **Understand** — answer how the org pays people by dept, country, grade, and over time.

Plain Excel-replacement CRUD fails the second job. The product therefore centers **compensation insight** with a simple HR workflow on top.

## 2. Persona & jobs to be done

**HR Manager / Admin** (shipped UI persona: Valentino Morales)

- See org compensation health at a glance (Dashboard)
- Manage the global directory (People)
- Maintain pay structures (Salary Bands)
- Deep-dive fairness and trends (Analytics)
- Run annual raise budgets (Planning & Budget)
- Prove who changed what (Audit Log)

## 3. Core questions the product answers

- What is total / average / median compensation?
- How does pay differ by department or country?
- How are people distributed across grades/bands?
- Who is below / within / above band? What is compa-ratio?
- How many adjustments happened, and how is payroll trending?
- For a fiscal plan: what budget is left if we raise X%?

## 4. How shipped modules map to those jobs

| Module | Why it exists |
|--------|----------------|
| **Auth** | Protect salary data; single HR persona does not need SSO |
| **Dashboard** | Instant “org health” without opening analytics filters |
| **People + adjustments** | Core Excel replacement: find, edit pay, never lose history |
| **Salary bands** | Makes “fairness” computable (compa-ratio, position in band) |
| **Analytics** | Answers comparative / distribution questions at 10k scale |
| **Planning & budget** | Extends insight into *forward* decisions (budgeted raises) while keeping humans in control |
| **Audit log** | Trust layer for compensation changes |

Bands, planning, and audit are **not** random extras — they support the assessment’s “answer questions about how the org pays people” with structure, foresight, and accountability.

## 5. Visual design research (Dribbble & Pinterest)

UI was **not** invented from a blank Tailwind default. Before building components I researched HR / analytics / dashboard references on:

- **[Dribbble](https://dribbble.com)** — modern SaaS dashboards, pill navigation, metric cards, soft glass panels  
- **[Pinterest](https://www.pinterest.com)** — mood boards for warm neutrals, typography hierarchy, and ops-console layouts  

From those references I extracted a **single theme system** and rebuilt reusable UI to match it, rather than one-off page styles:

| Theme signal | How it shows up in the app |
|--------------|----------------------------|
| Warm stone + amber accent | Backgrounds (`#FBF9F5` / dark stone), amber CTAs and active states |
| Glass / soft panels | Shared `GlassCard` and translucent borders (`bg-white/70`, blur) |
| Pill chrome | Nav pills, filter pills, rounded buttons (`shape="pill"`) |
| Dense HR ops layout | Tables + drawers/modals, not a marketing landing page |
| Light / dark | Theme provider + toggle so the same components work in both modes |

Reusable building blocks live under `src/components/ui/` (`Button`, `Input`, `Modal`, `Drawer`, `Table`, `GlassCard`, skeletons, etc.). Feature screens compose those primitives so the product stays **theme-consistent** across Dashboard, People, Bands, Analytics, and Planning.

AI helped **implement** components to that theme; choosing the visual direction from Dribbble/Pinterest and locking the token set was a **human design decision**.

## 6. Product principles

1. **History over overwrite** — salary changes create `SalaryHistory`; prior values remain.
2. **USD normalization** — local currency stored; analytics/planning use USD for cross-country sense.
3. **Server owns the 10k** — list/filter/aggregate on the server; UI gets pages and summaries.
4. **Evidence, not AI decisions** — scenarios and metrics inform HR; no auto-approve raises.
5. **Thin pages, fat services** — business rules live in `src/lib/*` with Vitest coverage on money math.
6. **Fail-soft audit** — logging must not break the primary mutation path.
7. **Theme-first UI** — shared primitives follow one visual system derived from design research.

## 7. Success criteria (assessment + shipped product)

An HR Manager can:

1. Sign in and use a responsive ops console.
2. Search/filter ~10k employees and open detail.
3. Adjust salary with reason/effective date and see history.
4. Maintain bands and see band position / compa-ratio.
5. Answer org pay questions via Dashboard + Analytics.
6. Create a fiscal plan, allocate budgets, simulate scenarios, progress status.
7. Inspect audit entries for sensitive changes.
8. Rely on unit tests for core calculation domains.
9. Use a seeded dataset of ~10,000 employees on a deployed app.

## 8. Evolution note

Commit history shows incremental growth: UI shell → people/auth → salary history → bands → analytics → planning → SSR/skeletons → deploy hardening → docs. That matches intentional scope growth from **manage** → **analyze** → **plan** → **account**.
