"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui";
import {
  CURRENT_USER,
  DEFAULT_CHART_DATA,
  DEFAULT_DEPARTMENT_COMPOSITION,
  DEFAULT_RECENT_SALARIES,
  TimeRange,
} from "@/constants";
import { ChevronRight, TrendingUp, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardViewProps {
  onNavigateToPeople?: () => void;
  initialData?: any;
}

export function DashboardView({
  onNavigateToPeople,
  initialData,
}: DashboardViewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("Week");
  const [selectedDay, setSelectedDay] = useState<number>(25);

  const data = initialData || {};

  const chartData = data?.salaryStatistics || DEFAULT_CHART_DATA;
  const pieData = data?.departmentComposition || DEFAULT_DEPARTMENT_COMPOSITION;
  const avgSalaryByDept = data?.avgSalaryByDept || [];
  const avgSalaryByCountry = data?.avgSalaryByCountry || [];
  const recentSalaries = data?.recentSalaries || DEFAULT_RECENT_SALARIES;

  const formatCurrency = (val: number, isMillions: boolean = false) => {
    if (!val) return "$0";
    if (isMillions) {
      return `$${(val / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome & Metrics Bar */}
      <PageHeader
        title={`Hello ${CURRENT_USER.name}`}
        description="Compensation insights, attendance tracking, and scheduled talent reviews."
        icon={LayoutDashboard}
      />

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 dark:bg-stone-900/60 backdrop-blur-md p-4 rounded-2xl border border-stone-200/70 dark:border-stone-800 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Total Global Payroll
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
              +4.8%
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white flex items-baseline gap-1">
            {formatCurrency(data?.stats?.totalGlobalPayroll, true)}{" "}
            <span className="text-xs text-stone-400 font-medium">USD</span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-stone-900/60 backdrop-blur-md p-4 rounded-2xl border border-stone-200/70 dark:border-stone-800 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Average Base Salary
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
              +3.1%
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white">
            {formatCurrency(data?.stats?.averageBaseSalary)}
          </div>
        </div>

        <div className="bg-white/70 dark:bg-stone-900/60 backdrop-blur-md p-4 rounded-2xl border border-stone-200/70 dark:border-stone-800 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Median Compensation
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
              +2.9%
            </span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white">
            {formatCurrency(data?.stats?.medianCompensation)}
          </div>
        </div>

        <div className="bg-white/70 dark:bg-stone-900/60 backdrop-blur-md p-4 rounded-2xl border border-stone-200/70 dark:border-stone-800 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Salary Band Insights
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
              Live Bands
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold pt-1">
            <span
              className="text-amber-600 dark:text-amber-400"
              title="Employees Below Band"
            >
              Below: {data?.bandDistribution?.below ?? 0}
            </span>
            <span
              className="text-emerald-600 dark:text-emerald-400"
              title="Employees Within Band"
            >
              Within: {data?.bandDistribution?.within ?? 0}
            </span>
            <span
              className="text-indigo-600 dark:text-indigo-400"
              title="Employees Above Band"
            >
              Above: {data?.bandDistribution?.above ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Compensation Analytics Banner Block */}
      <div className="w-full">
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 border border-stone-700/60 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold text-[10px] uppercase tracking-wider">
                Dedicated HR Dashboard
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              Comprehensive Compensation Analytics
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              Analyze salary distributions, pay-grade compa-ratios, department
              compensation breakdowns, country benchmarks, and historical
              adjustment trends.
            </p>
          </div>

          <Link
            href="/compensation-analytics"
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 group"
          >
            <span>Explore Compensation Analytics</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Row 1: Salary Statistics (Width 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl p-5 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-sm space-y-3 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                  Salary Statistics
                </h2>
                <p className="text-[11px] text-stone-400">
                  Total company payroll vs target curve
                </p>
              </div>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full text-[10px] font-medium text-stone-600 dark:text-stone-300">
                <span>Monthly</span>
              </div>
            </div>

            {/* Peak indicator highlight */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-stone-900 dark:text-white">
                $
                {(
                  chartData[chartData.length - 1]?.current || 84250
                ).toLocaleString("en-US")}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.8%
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="salaryGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#F5C242" stopOpacity={0.6} />
                      <stop
                        offset="95%"
                        stopColor="#F5C242"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181B",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                    formatter={(val: number) => [
                      `$${val.toLocaleString("en-US")}`,
                      "Payroll",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#F5C242"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#salaryGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 1: Employee Composition (Width 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl p-5 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-sm space-y-3 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                Employee Composition
              </h2>
              <p className="text-[11px] text-stone-400">
                Headcount distribution
              </p>
            </div>

            <div className="relative flex items-center justify-center h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {pieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-stone-900 dark:text-white">
                  {(data?.stats?.totalEmployees || 0).toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">
                  Total
                </span>
              </div>
            </div>

            {/* Composition Legend */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {pieData.map((item: any) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-[11px]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-stone-600 dark:text-stone-300 truncate">
                    {item.name}
                  </span>
                  <span className="text-stone-400 font-bold ml-auto">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Department Average Salary (Width 7) & Recent Adjustments Vertical Feed (Width 5) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl p-5 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-sm space-y-3 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                  Avg Salary by Department
                </h2>
                <p className="text-[11px] text-stone-400">
                  Compensation per capita (USD)
                </p>
              </div>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={avgSalaryByDept}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <XAxis
                    dataKey="department"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(245, 194, 66, 0.1)" }}
                    contentStyle={{
                      backgroundColor: "#18181B",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                    formatter={(val: number) => [
                      `$${val.toLocaleString("en-US")}`,
                      "Avg Salary",
                    ]}
                  />
                  <Bar
                    dataKey="averageSalary"
                    fill="#F5C242"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Vertical Recent Salary Adjustments & Hires Feed (Width 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl p-5 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-sm space-y-3 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-white">
                  Recent Salary Adjustments & Hires
                </h2>
                <p className="text-[11px] text-stone-400">
                  Latest compensation updates
                </p>
              </div>
              <Link
                href="/people"
                onClick={onNavigateToPeople}
                className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 mt-2">
              {recentSalaries.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3 flex items-center justify-between gap-3 bg-stone-50/70 dark:bg-stone-800/50 rounded-2xl border border-stone-200/50 dark:border-stone-700/50 hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-400/30"
                    />
                    <div>
                      <div className="text-xs font-semibold text-stone-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        {item.jobTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-0.5">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100 font-mono">
                      {item.netSalary}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
