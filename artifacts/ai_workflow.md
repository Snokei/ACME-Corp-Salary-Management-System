# ACME Salary Management — AI Workflow

> How AI was used to build the shipped product ([`../PRODUCT_OVERVIEW.md`](../PRODUCT_OVERVIEW.md)) while keeping human judgment on architecture, correctness, and scope.

## 1. Principle

**AI accelerates implementation; humans own the problem framing and correctness.**

Allowed:

- Scaffolding UI shells, repetitive components, Prisma models, API handlers
- Drafting tests for known formulas (compa-ratio, budget utilization)
- Refactors, responsive CSS, skeletons/Suspense wiring
- Drafting docs/artifacts from the real codebase

Not allowed (product rule):

- AI deciding or recommending individual salaries as a product feature
- Blindly accepting generated money logic without tests or review
- Expanding into leave/ATS/payroll because the model “suggested a full HRMS”

## 2. Tools

- **Cursor agentic coding** (primary) — multi-file edits, repo-aware refactors, test generation
- **LLM chat for design spikes** — scope cuts, module boundaries, trade-off wording
- **Human review** — schema, auth, salary math, planning status machine, deploy config

## 3. Working loop (intentional)

```text
1. Frame the HR question / acceptance check
2. Ask AI for a thin vertical slice (schema → service → UI → test)
3. Run / read tests; fix money edge cases myself
4. Incremental commit with a clear message
5. Only then widen scope (bands → analytics → planning → audit)
```

This mirrors the Git history: dashboard/people first, then salary history, bands, analytics, planning, SSR performance, deploy, docs.

## 4. Prompt / instruction patterns that worked

Representative instruction styles used with agents (condensed):

### Product framing

> Build for an HR Manager replacing Excel for 10k multi-country employees. Prioritize manage salary + answer org pay questions. Do not build payroll, leave, or ATS.

### Architecture guardrail

> Keep aggregations and salary math in `src/lib` services. Pages should stream with Suspense. Never load all employees into client state for charts.

### Domain correctness

> Salary adjustments must write SalaryHistory and update current pay. Compa-ratio = salary / band midpoint * 100. Cover with Vitest; no flaky time-based tests.

### Scope control

> Add compensation planning as budgeted raises with Draft→Finalized statuses and scenarios. Do not auto-approve raises. Keep audit logging fail-soft.

### Quality bar

> Prefer readable service functions over clever abstractions. Match existing Tailwind/UI patterns. Add tests for core calculations, not for every presentational div.

### Docs / artifacts

> Write assessment artifacts from what the repo actually ships (see PRODUCT_OVERVIEW). Be explicit about out-of-scope and trade-offs.

## 5. Where AI helped most

| Area | AI contribution | Human gate |
|------|-----------------|------------|
| UI volume (tables, drawers, skeletons) | Fast scaffolding | Visual/UX consistency |
| Prisma models & seed shape | Boilerplate | Indexes, USD fields, uniqueness |
| Analytics/planning services | First draft logic | Edge cases, N+1 awareness, tests |
| Vitest suites | Case generation | Determinism, naming, assertions |
| Responsive / theme polish | Iteration speed | Design direction |

## 6. Where AI was constrained or corrected

- Rejected “full HRMS” expansions (benefits, attendance as real modules).
- Required history-preserving salary updates (no silent overwrite).
- Required auth on app routes (salary data is sensitive).
- Kept planning as **simulation + workflow**, not AI raise recommendations.
- Used optimization passes as a **backlog of known issues**, not silent “LGTM.”

## 7. Evidence for reviewers

- **Incremental commits** show evolution, not a single dump.
- **Unit tests** lock formulas AI might get subtly wrong.
- **Artifacts** (this file + requirements/design/architecture/tradeoffs/performance) show the decision trail.
- **PRODUCT_OVERVIEW** documents the shipped system without aspirational vaporware.

## 8. Interview talking points

1. How the problem was split into operate vs understand.
2. Why bands/planning/audit were justified extensions.
3. How AI was prompted with **constraints**, not just “build an HR app.”
4. Which money paths are tested and which perf issues remain intentional follow-ups.
