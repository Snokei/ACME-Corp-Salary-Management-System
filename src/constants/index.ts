export type NavTabId =
  | "dashboard"
  | "people"
  | "salary"
  | "analytics"
  | "planning"
  | "audit-log"
  | "reviews"
  | "leaves"
  | "payroll"
  | "settings";

export interface NavItem {
  id: NavTabId;
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/" },
  { id: "people", label: "People", href: "/people" },
  { id: "salary", label: "Salary Bands", href: "/salary-bands" },
  { id: "analytics", label: "Analytics", href: "/compensation-analytics" },
  { id: "planning", label: "Comp Planning", href: "/compensation-planning" },
  { id: "audit-log", label: "Audit Log", href: "/audit-log" },
];


export const ALL_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/" },
  { id: "people", label: "People", href: "/people" },
  { id: "salary", label: "Salary", href: "/people?tab=salary" },
  { id: "reviews", label: "Reviews", href: "/people?tab=reviews" },
  { id: "leaves", label: "Leaves", href: "/people?tab=leaves" },
  { id: "payroll", label: "Payroll", href: "/people?tab=payroll" },
  { id: "settings", label: "Settings", href: "/settings" },
];

export const CURRENT_USER = {
  name: "Valentino",
  fullName: "Valentino Morales",
  role: "Lead Designer",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80",
};

export const TIME_RANGES = ["Day", "Week", "Month"] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

export const DAYS_OF_WEEK = [
  { day: "Mon", date: 23 },
  { day: "Tue", date: 24 },
  { day: "Wed", date: 25 },
  { day: "Thu", date: 26 },
  { day: "Fri", date: 27 },
];

export const DEFAULT_CHART_DATA = [
  { month: "Jan", current: 48000, previous: 42000 },
  { month: "Feb", current: 52000, previous: 45000 },
  { month: "Mar", current: 61000, previous: 49000 },
  { month: "Apr", current: 58000, previous: 53000 },
  { month: "May", current: 72000, previous: 60000 },
  { month: "Jun", current: 84250, previous: 68000 },
  { month: "Jul", current: 79000, previous: 71000 },
  { month: "Aug", current: 92000, previous: 76000 },
  { month: "Sep", current: 98500, previous: 82000 },
];

export const DEFAULT_DEPARTMENT_COMPOSITION = [
  { name: "Engineering", count: 155, percentage: 45, color: "#18181B" },
  { name: "Product & Design", count: 86, percentage: 25, color: "#F5C242" },
  { name: "Marketing & Sales", count: 62, percentage: 18, color: "#CBD5E1" },
  { name: "Operations & HR", count: 42, percentage: 12, color: "#94A3B8" },
];

export const DEFAULT_SCHEDULE_EVENTS = [
  {
    id: "ev-1",
    time: "09:00 AM",
    title: "Team Product Sync",
    category: "Design" as const,
    tagColor: "#F5C242",
    attendees: [
      {
        name: "Valentino M.",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80",
      },
      {
        name: "Keiko T.",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80",
      },
    ],
  },
  {
    id: "ev-2",
    time: "11:30 AM",
    title: "Salary Review & Promotion Q3",
    category: "HR" as const,
    tagColor: "#10B981",
    attendees: [
      {
        name: "Amara O.",
        avatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80",
      },
      {
        name: "Elena R.",
        avatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80",
      },
    ],
  },
  {
    id: "ev-3",
    time: "02:00 PM",
    title: "1-on-1 Performance Check",
    category: "Review" as const,
    tagColor: "#8B5CF6",
    attendees: [
      {
        name: "Sophia C.",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&h=80&q=80",
      },
    ],
  },
];

export const DEFAULT_RECENT_SALARIES = [
  {
    id: "sal-1",
    name: "Valentino Morales",
    jobTitle: "Lead Designer",
    netSalary: "$12,500",
    status: "Paid",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80",
  },
  {
    id: "sal-2",
    name: "Keiko Tanaka",
    jobTitle: "DevOps Specialist",
    netSalary: "$9,400",
    status: "Paid",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80",
  },
  {
    id: "sal-3",
    name: "Elena Rostova",
    jobTitle: "People Ops Lead",
    netSalary: "$8,200",
    status: "Paid",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&h=80&q=80",
  },
];

export const ATTENDANCE_DOT_MATRIX = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  active: i < 20,
  highlight: i % 4 === 0,
}));

export const EMPLOYEE_STATUS_TABS = [
  "All",
  "Active",
  "On Leave",
  "Contract",
] as const;
export type EmployeeStatusTab = (typeof EMPLOYEE_STATUS_TABS)[number];

export const DEPARTMENTS = [
  "All",
  "Engineering",
  "Product",
  "Sales",
  "Marketing",
  "Human Resources",
  "Finance",
  "Legal",
  "Operations",
] as const;

export const PAY_GRADES = ["L1", "L2", "L3", "L4", "L5", "L6", "L7"] as const;

export const ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Product Manager",
  "Product Designer",
  "Data Scientist",
  "DevOps Engineer",
  "HR Manager",
  "Sales Representative",
  "Marketing Specialist",
  "Accountant",
  "Legal Counsel",
] as const;

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "Singapore",
  "Japan",
  "Brazil",
] as const;

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "United States": ["New York", "San Francisco", "Austin", "Chicago", "Seattle"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow"],
  "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  "Germany": ["Berlin", "Munich", "Frankfurt", "Hamburg", "Stuttgart"],
  "France": ["Paris", "Lyon", "Marseille", "Toulouse", "Nice"],
  "India": ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Pune"],
  "Singapore": ["Downtown Core", "Jurong East", "Tampines", "Woodlands", "Changi"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Belo Horizonte"],
};

export const INITIAL_EMPLOYEE_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  department: "Engineering",
  role: "Software Engineer",
  country: "United States",
  city: "San Francisco",
  baseSalary: "135000",
  payGrade: "L4",
};

export const CSV_EXPORT_HEADERS = [
  "Employee ID",
  "Name",
  "Email",
  "Department",
  "Role",
  "Country",
  "Salary USD",
  "Status",
] as const;

const VERCEL = "https://acme-corp-salary-management-system.vercel.app/";
