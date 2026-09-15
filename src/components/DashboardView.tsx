'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { PillTabs, GlassCard, StatusBadge } from '@/components/ui';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  DAYS_OF_WEEK,
  TIME_RANGES,
  TimeRange,
  DEFAULT_CHART_DATA,
  DEFAULT_DEPARTMENT_COMPOSITION,
  DEFAULT_RECENT_SALARIES,
  CURRENT_USER,
} from '@/constants';

interface DashboardViewProps {
  onNavigateToPeople?: () => void;
  initialData?: any;
}

export function DashboardView({ onNavigateToPeople, initialData }: DashboardViewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('Week');
  const [selectedDay, setSelectedDay] = useState<number>(25);

  const data = initialData || {};

  const chartData = data?.salaryStatistics || DEFAULT_CHART_DATA;
  const pieData = data?.departmentComposition || DEFAULT_DEPARTMENT_COMPOSITION;
  const recentSalaries = data?.recentSalaries || DEFAULT_RECENT_SALARIES;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome & Metrics Bar */}
      <PageHeader
        title={`Hello ${CURRENT_USER.name}`}
        description="Compensation insights, attendance tracking, and scheduled talent reviews."
      >
        {/* Metric Summary Counters */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md p-2 sm:px-5 sm:py-2.5 rounded-2xl border border-stone-200/70 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <div>
              <span className="text-xl font-bold text-stone-900 dark:text-white">{(data?.stats?.totalEmployees || 0).toLocaleString()}</span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Total Employees</span>
            </div>
          </div>

          <div className="h-4 w-px bg-stone-200 dark:bg-stone-700"></div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <div>
              <span className="text-xl font-bold text-stone-900 dark:text-white">{(data?.stats?.activeCount || 0).toLocaleString()}</span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Active Employees</span>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Filter / Scope Selection Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PillTabs
          options={TIME_RANGES}
          value={timeRange}
          onChange={setTimeRange}
          variant="amber"
        />

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 text-xs font-medium text-stone-600 dark:text-stone-400 shadow-sm">
            Aug 14 - 20, 2026
          </div>
        </div>
      </div>

      {/* Main 3-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Salary & Salary Statistics (Width 8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Card: Salary Mini Table */}
          <GlassCard
            title="Salary"
            headerAction={
              <Link
                href="/people"
                onClick={onNavigateToPeople}
                className="text-xs text-amber-600 dark:text-amber-400 font-medium hover:underline flex items-center gap-1"
              >
                Manage all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
            className="p-5 space-y-4"
          >
            <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
              {recentSalaries.map((item: any) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                    />
                    <div>
                      <div className="text-xs font-semibold text-stone-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">{item.jobTitle}</div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">{item.netSalary}</div>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Bottom Card: Salary Statistics Chart */}
          <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl p-5 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-white">Salary Statistics</h2>
                <p className="text-[11px] text-stone-400">Total company payroll vs target curve</p>
              </div>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full text-[10px] font-medium text-stone-600 dark:text-stone-300">
                <span>Monthly</span>
              </div>
            </div>

            {/* Peak indicator highlight */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-stone-900 dark:text-white">${(chartData[chartData.length - 1]?.current || 84250).toLocaleString('en-US')}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14.8%
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F5C242" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#F5C242" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: number) => [`$${val.toLocaleString('en-US')}`, 'Payroll']}
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

        {/* Right Column: Employee Composition (Width 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Bottom Card: Employee Composition */}
          <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl p-5 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-sm space-y-3">
            <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Employee Composition</h2>

            <div className="relative flex items-center justify-center h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={62}
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
                <span className="text-xl font-extrabold text-stone-900 dark:text-white">{(data?.stats?.totalEmployees || 0).toLocaleString()}</span>
                <span className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold">Total</span>
              </div>
            </div>

            {/* Composition Legend */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {pieData.map((item: any) => (
                <div key={item.name} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-stone-600 dark:text-stone-300 truncate">{item.name}</span>
                  <span className="text-stone-400 font-bold ml-auto">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
