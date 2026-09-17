# ACME Salary Management — Product Requirements

## 1. Problem & Product Understanding

ACME's HR team manages salary information for approximately **10,000 employees across multiple countries using spreadsheets**. This makes routine salary management tedious and makes it difficult to answer compensation-related questions consistently.

The primary user for this system is the **HR Manager**.

I approached the problem as two related needs:

1. **Manage compensation data** — HR needs to find employees, view their compensation, update salaries, and retain salary history.
2. **Understand compensation** — HR needs to analyze how the organization pays people across departments, countries, salary grades, and time.

Therefore, the goal is not to simply replace Excel with a CRUD interface. The system should turn the underlying salary data into useful compensation insights while keeping the day-to-day salary management workflow simple.

## 2. Goal

Build a web-based salary management and compensation analytics system that enables an HR Manager to manage employee compensation data and answer common organizational compensation questions efficiently.

The solution should support the provided scale of **10,000 employees**, use a relational database, provide a usable web UI, and demonstrate production-oriented engineering practices.

## 3. Core User Questions

The product is designed to help HR answer questions such as:

- What is the organization's average salary?
- What is the median salary?
- What is the total payroll?
- How does compensation differ by country?
- Which departments have the highest or lowest compensation?
- How are employees distributed across salary grades/bands?
- How much has payroll changed over time?
- How many employees received salary adjustments?
- How does an employee's salary compare with their grade/band?
- What is the salary range within a department or country?
- Where are employees positioned relative to their salary band?

## 4. Scope & Features

### Employee Management

- Search employees.
- Filter employees by relevant attributes such as department, country, and salary grade.
- Paginate employee results.
- View employee details.
- View current compensation information.

### Salary Management

- Update an employee's salary.
- Capture salary adjustment information such as effective date and reason.
- Preserve previous salary information.
- Display salary history for an employee.

### Compensation Analytics

The analytics area provides organization-level and comparative compensation insights:

- Total payroll
- Average salary
- Median salary
- Salary distribution
- Salary by department
- Salary by country
- Salary/pay-grade distribution
- Payroll trends over time
- Salary adjustment counts and trends
- Department salary ranges
- Employee salary versus grade/band
- Compa-ratio analysis

Where appropriate, calculations are performed server-side/database-side rather than transferring the complete 10,000-employee dataset to the browser.

### Data & Seeding

A seed process provides approximately **10,000 employees** with compensation-related data so that the application can be evaluated at the requested scale.

### Quality & Reliability

The implementation includes automated tests covering important business logic and calculations. Tests are intended to be fast, deterministic, readable, and maintainable.

## 5. Deliberately Out of Scope

To keep the solution focused on the stated compensation problem, the following are deliberately excluded:

- Payroll payment processing
- Tax calculation
- Benefits administration
- Attendance and leave management
- Recruitment/Applicant Tracking
- Employee self-service
- Full HRMS functionality
- External payroll/HR-system integrations
- Complex enterprise identity/SSO infrastructure
- Automated salary recommendations or salary decisions
- AI making compensation decisions

These could be part of a larger HR platform, but implementing them would increase complexity without materially improving the core salary-management problem being assessed.

## 6. Product & Engineering Principles

### Simple HR Workflow

The system should allow an HR Manager to find an employee, understand their compensation, make a controlled salary change, and review its history without unnecessary steps.

### Historical Data Preservation

Salary changes should not simply overwrite the previous value. Historical information is important for understanding compensation changes and supporting auditability.

### Server-Side Data Operations

The system should avoid loading all 10,000 employees into the browser. Search, filtering, pagination, and aggregations should be performed efficiently on the server/database where appropriate.

### Data Integrity

Salary-related operations should validate inputs and preserve consistent relationships between employees, salaries, grades/bands, and historical records.

### Maintainability

The implementation should favor clear separation of responsibilities, reusable components/services, understandable business logic, and automated tests over unnecessary architectural complexity.

## 7. Success Criteria

The solution will be considered successful if an HR Manager can:

1. Find and inspect employees efficiently.
2. View current and historical salary information.
3. Update compensation while preserving salary history.
4. Understand organization-wide compensation through analytics.
5. Compare compensation across countries, departments, and grades.
6. Analyze salary changes over time.
7. Compare an employee's compensation against their salary grade/band.
8. Use the application with a seeded dataset of approximately 10,000 employees.
9. Rely on tested core business logic and calculations.

The final solution should be delivered as a **fully functional deployed web application**, accompanied by the source repository, automated tests, relevant design artifacts, incremental Git history, and a short demonstration video.
