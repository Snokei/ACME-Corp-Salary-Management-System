"use client";

import { Button, GlassCard, SearchableSelect } from "@/components/ui";
import { CompensationAnalyticsResult } from "@/lib/compensationAnalyticsService";
import {
  ArrowUpDown,
  Award,
  Building2,
  DollarSign,
  Globe,
  Layers,
  Loader2,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CompensationAnalyticsViewProps {
  data?: CompensationAnalyticsResult;
  searchParams: {
    department: string;
    country: string;
    payGrade: string;
    currency: string;
    period: "quarter" | "month";
  };
}

const BAND_COLORS = {
  Below: "#EF4444", // Red
  Within: "#10B981", // Green
  Above: "#F59E0B", // Amber / Orange
  NoBand: "#94A3B8", // Gray
};

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#6366F1",
];

export function CompensationAnalyticsView({
  data,
  searchParams,
}: CompensationAnalyticsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Read current filter values from server-provided searchParams
  const department = searchParams.department;
  const country = searchParams.country;
  const payGrade = searchParams.payGrade;
  const currency = searchParams.currency;
  const period = searchParams.period;

  // Country table sort — pure client state, no server round-trip needed
  const [countrySortField, setCountrySortField] = useState<
    "employeeCount" | "avgSalary" | "country"
  >("employeeCount");
  const [countrySortAsc, setCountrySortAsc] = useState<boolean>(false);

  // Navigate with updated URL params (triggers server re-render)
  const pushFilter = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams();
      const merged = {
        department,
        country,
        payGrade,
        currency,
        period,
        ...updates,
      };
      if (merged.department !== "All")
        params.set("department", merged.department);
      if (merged.country !== "All") params.set("country", merged.country);
      if (merged.payGrade !== "All") params.set("payGrade", merged.payGrade);
      if (merged.currency !== "All") params.set("currency", merged.currency);
      if (merged.period !== "quarter") params.set("period", merged.period);
      startTransition(() => {
        router.push(
          `${pathname}${params.toString() ? "?" + params.toString() : ""}`,
        );
      });
    },
    [department, country, payGrade, currency, period, pathname, router],
  );

  const handleResetFilters = () => {
    startTransition(() => router.push(pathname));
  };

  const hasActiveFilters =
    department !== "All" ||
    country !== "All" ||
    payGrade !== "All" ||
    currency !== "All";

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortUSD = (val: number) => {
    if (Math.abs(val) >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(val) >= 1000) {
      return `$${(val / 1000).toFixed(0)}K`;
    }
    return `$${val}`;
  };

  // Sort country data
  const sortedCountryCompensation = React.useMemo(() => {
    if (!data?.countryCompensation) return [];
    const list = [...data.countryCompensation];
    return list.sort((a, b) => {
      let valA: any = a[countrySortField];
      let valB: any = b[countrySortField];
      if (typeof valA === "string") {
        return countrySortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return countrySortAsc ? valA - valB : valB - valA;
    });
  }, [data?.countryCompensation, countrySortField, countrySortAsc]);

  const toggleCountrySort = (
    field: "employeeCount" | "avgSalary" | "country",
  ) => {
    if (countrySortField === field) {
      setCountrySortAsc(!countrySortAsc);
    } else {
      setCountrySortField(field);
      setCountrySortAsc(field === "country"); // default asc for string, desc for numbers
    }
  };

  // Donut data for salary band positioning
  const bandPieData = React.useMemo(() => {
    if (!data?.bandDistribution) return [];
    const bd = data.bandDistribution;
    return [
      {
        name: "Within Band",
        value: bd.within.count,
        percentage: bd.within.percentage,
        color: BAND_COLORS.Within,
      },
      {
        name: "Below Band",
        value: bd.below.count,
        percentage: bd.below.percentage,
        color: BAND_COLORS.Below,
      },
      {
        name: "Above Band",
        value: bd.above.count,
        percentage: bd.above.percentage,
        color: BAND_COLORS.Above,
      },
      ...(bd.noBand.count > 0
        ? [
            {
              name: "No Matching Band",
              value: bd.noBand.count,
              percentage: bd.noBand.percentage,
              color: BAND_COLORS.NoBand,
            },
          ]
        : []),
    ].filter((item) => item.value > 0);
  }, [data?.bandDistribution]);

  return (
    <div
      className={`space-y-6 animate-fade-in pb-12 ${isPending ? "opacity-60 pointer-events-none" : ""} transition-opacity duration-150`}
    >
      {/* Filter Control Bar */}
      <GlassCard className="relative z-30 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Dropdown Filters — changes push URL params, triggering SSR re-render */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Department */}
            <SearchableSelect
              name="department"
              options={["All", ...(data?.filterOptions?.departments || [])]}
              value={department}
              placeholder="All Departments"
              shape="pill"
              containerClassName="w-auto min-w-[150px]"
              onChange={(val) => pushFilter({ department: val })}
            />

            {/* Country */}
            <SearchableSelect
              name="country"
              options={["All", ...(data?.filterOptions?.countries || [])]}
              value={country}
              placeholder="All Countries"
              shape="pill"
              containerClassName="w-auto min-w-[140px]"
              onChange={(val) => pushFilter({ country: val })}
            />

            {/* Pay Grade */}
            <SearchableSelect
              name="payGrade"
              options={["All", ...(data?.filterOptions?.payGrades || [])]}
              value={payGrade}
              placeholder="All Pay Grades"
              shape="pill"
              containerClassName="w-auto min-w-[140px]"
              onChange={(val) => pushFilter({ payGrade: val })}
            />

            {/* Currency */}
            <SearchableSelect
              name="currency"
              options={["All", ...(data?.filterOptions?.currencies || [])]}
              value={currency}
              placeholder="All Currencies"
              shape="pill"
              containerClassName="w-auto min-w-[135px]"
              onChange={(val) => pushFilter({ currency: val })}
            />

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                shape="pill"
                onClick={handleResetFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* No-data fallback */}
      {!data && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-medium">
            Calculating compensation analytics across organization...
          </p>
        </div>
      )}

      {/* Analytics Main View */}
      {data && (
        <>
          {/* Section 1: Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {/* Total Employees */}
            <GlassCard className="p-4 rounded-2xl flex flex-col justify-between border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Total Employees
                </span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-stone-900 dark:text-white">
                  {data.summary.totalEmployees.toLocaleString()}
                </span>
                <span className="block text-[11px] text-stone-400 mt-0.5">
                  Matching current filters
                </span>
              </div>
            </GlassCard>

            {/* Average Base Salary */}
            <GlassCard className="p-4 rounded-2xl flex flex-col justify-between border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Average Base Salary
                </span>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-stone-900 dark:text-white">
                  {formatUSD(data.summary.averageBaseSalary)}
                </span>
                <span className="block text-[11px] text-stone-400 mt-0.5">
                  Annual base salary (USD)
                </span>
              </div>
            </GlassCard>

            {/* Median Base Salary */}
            <GlassCard className="p-4 rounded-2xl flex flex-col justify-between border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Median Base Salary
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-stone-900 dark:text-white">
                  {formatUSD(data.summary.medianBaseSalary)}
                </span>
                <span className="block text-[11px] text-stone-400 mt-0.5">
                  50th percentile (USD)
                </span>
              </div>
            </GlassCard>

            {/* Minimum Base Salary */}
            <GlassCard className="p-4 rounded-2xl flex flex-col justify-between border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Minimum Salary
                </span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-stone-900 dark:text-white">
                  {formatUSD(data.summary.minBaseSalary)}
                </span>
                <span className="block text-[11px] text-stone-400 mt-0.5">
                  Lowest compensation (USD)
                </span>
              </div>
            </GlassCard>

            {/* Maximum Base Salary */}
            <GlassCard className="p-4 rounded-2xl flex flex-col justify-between border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Maximum Salary
                </span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-stone-900 dark:text-white">
                  {formatUSD(data.summary.maxBaseSalary)}
                </span>
                <span className="block text-[11px] text-stone-400 mt-0.5">
                  Highest compensation (USD)
                </span>
              </div>
            </GlassCard>
          </div>

          {/* Section 2 & Section 6 Row: Salary Distribution & Band Positioning */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Section 2: Salary Distribution Bar Chart */}
            <GlassCard className="p-5 rounded-2xl lg:col-span-2 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
                      Salary Distribution (USD)
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Employee count & share by annual base salary bracket
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.salaryDistribution}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(150, 150, 150, 0.15)"
                      />
                      <XAxis
                        dataKey="range"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-stone-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-stone-800 space-y-1">
                                <p className="font-semibold text-amber-400">
                                  {d.range}
                                </p>
                                <p>
                                  Employees:{" "}
                                  <span className="font-semibold">
                                    {d.count.toLocaleString()}
                                  </span>
                                </p>
                                <p>
                                  Share:{" "}
                                  <span className="font-semibold">
                                    {d.percentage}%
                                  </span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {data.salaryDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bucket summary badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/60 text-center">
                {data.salaryDistribution.map((b) => (
                  <div
                    key={b.range}
                    className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900/60"
                  >
                    <span className="block text-[10px] text-stone-400 font-medium truncate">
                      {b.range}
                    </span>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      {b.count.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-stone-500 dark:text-stone-400">
                      {b.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Section 6: Overall Salary Band Positioning (Donut Chart) */}
            <GlassCard className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
                      Salary Band Positioning
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Positioning relative to pay grade midpoints
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>

                <div className="h-52 w-full relative flex items-center justify-center">
                  {bandPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bandPieData}
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {bandPieData.map((entry, index) => (
                            <Cell
                              key={`pie-cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-stone-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-stone-800 space-y-1">
                                  <p
                                    className="font-semibold"
                                    style={{ color: d.color }}
                                  >
                                    {d.name}
                                  </p>
                                  <p>
                                    Employees:{" "}
                                    <span className="font-semibold">
                                      {d.value.toLocaleString()}
                                    </span>
                                  </p>
                                  <p>
                                    Share:{" "}
                                    <span className="font-semibold">
                                      {d.percentage}%
                                    </span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-stone-400">
                      No salary band positioning data available.
                    </p>
                  )}
                </div>
              </div>

              {/* Band Legend Stats */}
              <div className="space-y-2 mt-2 pt-3 border-t border-stone-100 dark:border-stone-800/60">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: BAND_COLORS.Below }}
                    ></span>
                    <span className="text-stone-600 dark:text-stone-300">
                      Below Band
                    </span>
                  </div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">
                    {data.bandDistribution.below.count.toLocaleString()} (
                    {data.bandDistribution.below.percentage}%)
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: BAND_COLORS.Within }}
                    ></span>
                    <span className="text-stone-600 dark:text-stone-300">
                      Within Band
                    </span>
                  </div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">
                    {data.bandDistribution.within.count.toLocaleString()} (
                    {data.bandDistribution.within.percentage}%)
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: BAND_COLORS.Above }}
                    ></span>
                    <span className="text-stone-600 dark:text-stone-300">
                      Above Band
                    </span>
                  </div>
                  <div className="font-semibold text-stone-800 dark:text-stone-200">
                    {data.bandDistribution.above.count.toLocaleString()} (
                    {data.bandDistribution.above.percentage}%)
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Section 3: Department Compensation */}
          <GlassCard className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  Department Compensation Analysis
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Headcount, average, median, min, and max salary (USD) by
                  department
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Horizontal Bar Chart for Dept Avg Salary */}
              <div className="lg:col-span-1 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.departmentCompensation}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 25, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="rgba(150, 150, 150, 0.15)"
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10 }}
                      tickFormatter={formatShortUSD}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="department"
                      type="category"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={85}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-stone-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-stone-800 space-y-1">
                              <p className="font-semibold text-amber-400">
                                {d.department}
                              </p>
                              <p>
                                Avg Salary:{" "}
                                <span className="font-semibold">
                                  {formatUSD(d.avgSalary)}
                                </span>
                              </p>
                              <p>
                                Median Salary:{" "}
                                <span className="font-semibold">
                                  {formatUSD(d.medianSalary)}
                                </span>
                              </p>
                              <p>
                                Employees:{" "}
                                <span className="font-semibold">
                                  {d.employeeCount.toLocaleString()}
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="avgSalary"
                      fill="#3B82F6"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Department Table */}
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/70 dark:bg-stone-900/70 text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-xl">Department</th>
                      <th className="py-2.5 px-3 text-right">Employees</th>
                      <th className="py-2.5 px-3 text-right">Avg Salary USD</th>
                      <th className="py-2.5 px-3 text-right">Median USD</th>
                      <th className="py-2.5 px-3 text-right">Min USD</th>
                      <th className="py-2.5 px-3 text-right rounded-r-xl">
                        Max USD
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                    {data.departmentCompensation.length > 0 ? (
                      data.departmentCompensation.map((dept) => (
                        <tr
                          key={dept.department}
                          className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-medium text-stone-900 dark:text-white">
                            {dept.department}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-300 font-mono">
                            {dept.employeeCount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-stone-900 dark:text-stone-100 font-mono">
                            {formatUSD(dept.avgSalary)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-300 font-mono">
                            {formatUSD(dept.medianSalary)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-500 dark:text-stone-400 font-mono">
                            {formatUSD(dept.minSalary)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-500 dark:text-stone-400 font-mono">
                            {formatUSD(dept.maxSalary)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 text-center text-stone-400"
                        >
                          No department data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>

          {/* Section 4: Pay-Grade Analysis */}
          <GlassCard className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Pay-Grade & Compa-Ratio Analysis
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Average salary, compa-ratio, and band status breakdown by pay
                  grade
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/70 dark:bg-stone-900/70 text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-xl">Pay Grade</th>
                    <th className="py-2.5 px-3 text-right">Employees</th>
                    <th className="py-2.5 px-3 text-right">Midpoint USD</th>
                    <th className="py-2.5 px-3 text-right">Avg Base Salary</th>
                    <th className="py-2.5 px-3 text-center">Avg Compa-Ratio</th>
                    <th className="py-2.5 px-3 text-right text-red-600 dark:text-red-400">
                      Below Band
                    </th>
                    <th className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                      Within Band
                    </th>
                    <th className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400 rounded-r-xl">
                      Above Band
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {data.payGradeCompensation.length > 0 ? (
                    data.payGradeCompensation.map((pg) => {
                      const compa = pg.avgCompaRatio;
                      let compaBadgeColor =
                        "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300";
                      if (compa !== null) {
                        if (compa >= 95 && compa <= 105) {
                          compaBadgeColor =
                            "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
                        } else if (compa < 95) {
                          compaBadgeColor =
                            "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300";
                        } else {
                          compaBadgeColor =
                            "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
                        }
                      }

                      return (
                        <tr
                          key={pg.payGrade}
                          className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-semibold text-stone-900 dark:text-white">
                            <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 font-mono">
                              {pg.payGrade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-300 font-mono">
                            {pg.employeeCount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-500 dark:text-stone-400 font-mono">
                            {pg.midpointSalary
                              ? formatUSD(pg.midpointSalary)
                              : "N/A"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-stone-900 dark:text-stone-100 font-mono">
                            {formatUSD(pg.avgSalary)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {compa !== null ? (
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${compaBadgeColor}`}
                              >
                                {compa}%
                              </span>
                            ) : (
                              <span className="text-stone-400 font-mono">
                                N/A
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-red-600 dark:text-red-400">
                            {pg.belowBandCount.toLocaleString()} (
                            {pg.belowBandPercentage}%)
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                            {pg.withinBandCount.toLocaleString()} (
                            {pg.withinBandPercentage}%)
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-amber-600 dark:text-amber-400">
                            {pg.aboveBandCount.toLocaleString()} (
                            {pg.aboveBandPercentage}%)
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-4 text-center text-stone-400"
                      >
                        No pay-grade data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Section 5: Country / Location Analysis */}
          <GlassCard className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-500" />
                  Country & Location Compensation (USD)
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Cross-location comparison normalized using employee
                  baseSalaryUSD
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Sort by:</span>
                <button
                  onClick={() => toggleCountrySort("employeeCount")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    countrySortField === "employeeCount"
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  Headcount
                </button>
                <button
                  onClick={() => toggleCountrySort("avgSalary")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    countrySortField === "avgSalary"
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  Avg Salary
                </button>
                <button
                  onClick={() => toggleCountrySort("country")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    countrySortField === "country"
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  Country Name
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Bar Chart by Country */}
              <div className="lg:col-span-1 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sortedCountryCompensation}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(150, 150, 150, 0.15)"
                    />
                    <XAxis
                      dataKey="country"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={formatShortUSD}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-stone-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-stone-800 space-y-1">
                              <p className="font-semibold text-amber-400">
                                {d.country}
                              </p>
                              <p>
                                Avg Salary:{" "}
                                <span className="font-semibold">
                                  {formatUSD(d.avgSalary)}
                                </span>
                              </p>
                              <p>
                                Employees:{" "}
                                <span className="font-semibold">
                                  {d.employeeCount.toLocaleString()}
                                </span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="avgSalary"
                      fill="#10B981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Country Table */}
              <div className="lg:col-span-2 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/70 dark:bg-stone-900/70 text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px]">
                    <tr>
                      <th
                        className="py-2.5 px-3 cursor-pointer rounded-l-xl hover:text-stone-900 dark:hover:text-white"
                        onClick={() => toggleCountrySort("country")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Country</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-2.5 px-3 text-right cursor-pointer hover:text-stone-900 dark:hover:text-white"
                        onClick={() => toggleCountrySort("employeeCount")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Employees</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-2.5 px-3 text-right cursor-pointer hover:text-stone-900 dark:hover:text-white"
                        onClick={() => toggleCountrySort("avgSalary")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Avg Salary USD</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="py-2.5 px-3 text-right">Min USD</th>
                      <th className="py-2.5 px-3 text-right rounded-r-xl">
                        Max USD
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                    {sortedCountryCompensation.length > 0 ? (
                      sortedCountryCompensation.map((c) => (
                        <tr
                          key={c.country}
                          className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-medium text-stone-900 dark:text-white">
                            {c.country}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-300 font-mono">
                            {c.employeeCount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-stone-900 dark:text-stone-100 font-mono">
                            {formatUSD(c.avgSalary)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-500 dark:text-stone-400 font-mono">
                            {formatUSD(c.minSalary)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-500 dark:text-stone-400 font-mono">
                            {formatUSD(c.maxSalary)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-4 text-center text-stone-400"
                        >
                          No country data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>

          {/* Section 7: Salary Adjustment Trends */}
          <GlassCard className="p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  Salary Adjustment Trends Over Time
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Historical salary adjustments recorded from the Salary
                  Adjustment Workflow
                </p>
              </div>

              {/* Period toggle — updates URL param, triggers SSR re-render */}
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl">
                <button
                  onClick={() => pushFilter({ period: "quarter" })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    period === "quarter"
                      ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  Quarterly
                </button>
                <button
                  onClick={() => pushFilter({ period: "month" })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    period === "month"
                      ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {data.adjustmentTrends.length > 0 ? (
              <div className="space-y-6">
                {/* Trend Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.adjustmentTrends}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorTotalChange"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(150, 150, 150, 0.15)"
                      />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={formatShortUSD}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-stone-900 text-white text-xs p-3 rounded-xl shadow-xl border border-stone-800 space-y-1.5">
                                <p className="font-semibold text-amber-400">
                                  {d.period}
                                </p>
                                <p>
                                  Adjustments Count:{" "}
                                  <span className="font-semibold">
                                    {d.adjustmentsCount}
                                  </span>
                                </p>
                                <p>
                                  Net Salary Change:{" "}
                                  <span className="font-semibold font-mono">
                                    {formatUSD(d.totalChangeUSD)}
                                  </span>
                                </p>
                                <p>
                                  Avg Adjustment:{" "}
                                  <span className="font-semibold font-mono">
                                    {formatUSD(d.avgChangeUSD)}
                                  </span>
                                </p>
                                {d.increaseCount > 0 && (
                                  <p className="text-emerald-400">
                                    Increases: {d.increaseCount} (
                                    {formatUSD(d.totalIncreasesUSD)})
                                  </p>
                                )}
                                {d.decreaseCount > 0 && (
                                  <p className="text-red-400">
                                    Decreases: {d.decreaseCount} (
                                    {formatUSD(d.totalDecreasesUSD)})
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="totalChangeUSD"
                        stroke="#10B981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTotalChange)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Adjustment Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100/70 dark:bg-stone-900/70 text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 rounded-l-xl">Period</th>
                        <th className="py-2.5 px-3 text-right">Adjustments</th>
                        <th className="py-2.5 px-3 text-right">
                          Total Net Increase
                        </th>
                        <th className="py-2.5 px-3 text-right">
                          Average Adjustment
                        </th>
                        <th className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                          Increases
                        </th>
                        <th className="py-2.5 px-3 text-right text-red-600 dark:text-red-400 rounded-r-xl">
                          Decreases
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                      {data.adjustmentTrends.map((t) => (
                        <tr
                          key={t.period}
                          className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-semibold text-stone-900 dark:text-white font-mono">
                            {t.period}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-300 font-mono">
                            {t.adjustmentsCount}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-stone-900 dark:text-stone-100 font-mono">
                            {formatUSD(t.totalChangeUSD)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-stone-600 dark:text-stone-300 font-mono">
                            {formatUSD(t.avgChangeUSD)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-mono">
                            {t.increaseCount} ({formatUSD(t.totalIncreasesUSD)})
                          </td>
                          <td className="py-2.5 px-3 text-right text-red-600 dark:text-red-400 font-mono">
                            {t.decreaseCount} ({formatUSD(t.totalDecreasesUSD)})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-stone-400">
                <p className="text-xs">
                  No salary history adjustments have been recorded yet.
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Adjustments created via the Salary Adjustment Workflow on
                  employee pages will appear here.
                </p>
              </div>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
}
