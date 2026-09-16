"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Percent,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ShieldAlert,
  FileCheck,
  Clock,
  Trash2,
  ChevronRight,
  Building2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import toast from "react-hot-toast";
import { CreatePlanModal } from "./CreatePlanModal";

interface PlanItem {
  id: string;
  name: string;
  fiscalYear: string;
  totalBudgetUSD: number;
  status: "Draft" | "In Review" | "Approved" | "Rejected" | "Finalized";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  metrics: {
    totalBudgetUSD: number;
    allocatedBudgetUSD: number;
    plannedIncreaseUSD: number;
    remainingBudgetUSD: number;
    utilizationPercentage: number;
    employeesCount: number;
    averageIncreasePercentage: number;
  };
}

interface CompensationPlanningOverviewProps {
  initialPlans?: PlanItem[];
}

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
  "In Review": "bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-700",
  Approved: "bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-700",
  Rejected: "bg-rose-500/10 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-700",
  Finalized: "bg-blue-500/10 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700",
};

export function CompensationPlanningOverview({ initialPlans = [] }: CompensationPlanningOverviewProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fiscalYearFilter, setFiscalYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Extract unique fiscal years for filter
  const fiscalYears = useMemo(() => {
    const years = new Set(plans.map((p) => p.fiscalYear));
    return ["All", ...Array.from(years)];
  }, [plans]);

  // Aggregate global overview metrics across all active/latest plan
  const activePlan = plans[0]; // Primary plan for dashboard top bar
  const metrics = activePlan
    ? activePlan.metrics
    : {
        totalBudgetUSD: 0,
        allocatedBudgetUSD: 0,
        plannedIncreaseUSD: 0,
        remainingBudgetUSD: 0,
        utilizationPercentage: 0,
        employeesCount: 0,
        averageIncreasePercentage: 0,
      };

  // Filtered plans list
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.fiscalYear.toLowerCase().includes(search.toLowerCase()) ||
        p.createdBy.toLowerCase().includes(search.toLowerCase());

      const matchesYear = fiscalYearFilter === "All" || p.fiscalYear === fiscalYearFilter;
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;

      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [plans, search, fiscalYearFilter, statusFilter]);

  // Chart dataset comparing plans
  const chartData = useMemo(() => {
    if (plans.length === 0) return [];
    return plans.slice(0, 5).map((p) => ({
      name: p.fiscalYear || p.name,
      Budget: p.metrics.totalBudgetUSD,
      Allocated: p.metrics.allocatedBudgetUSD,
      Planned: p.metrics.plannedIncreaseUSD,
    }));
  }, [plans]);

  const handleDeletePlan = async (id: string, name: string, status: string) => {
    const isFinalized = status === "Finalized";
    const isNonDraft = status !== "Draft" && status !== "Rejected";

    let confirmMsg = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
    if (isFinalized) {
      confirmMsg = `⚠️ ADMIN ACTION: "${name}" is Finalized & Applied!\n\nForce deleting will remove this plan record. Employee base salaries will remain at their updated rates.\n\nAre you sure you want to permanently delete this plan as Admin?`;
    } else if (isNonDraft) {
      confirmMsg = `Are you sure you want to delete "${name}" (Status: ${status})? This action cannot be undone.`;
    }

    if (!confirm(confirmMsg)) {
      return;
    }

    setIsDeleting(id);
    try {
      const url = `/api/compensation-planning/${id}${isNonDraft ? "?force=true" : ""}`;
      const res = await fetch(url, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete plan");
      }

      toast.success(isFinalized ? "Plan force deleted (Admin)" : "Compensation plan deleted");
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Could not delete plan");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await fetch("/api/compensation-planning");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPlans(data.data);
      }
    } catch (err) {
      console.error("Failed to refresh plans:", err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Compensation Management
            </span>
            <span className="text-xs text-stone-400">• Fiscal Year Planning</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Compensation Planning & Budget
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
            Create fiscal year budgets, allocate compensation pools across departments, plan employee salary increases, and model scenarios.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-semibold text-xs shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Compensation Plan</span>
        </button>
      </div>

      {/* Overview Cards (Matching prompt example) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Card 1: Total Budget */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Total Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-stone-900 dark:text-white font-mono tracking-tight">
            ${(metrics.totalBudgetUSD || 0).toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            {activePlan ? `Pool for ${activePlan.fiscalYear}` : "No Active Plan"}
          </div>
        </div>

        {/* Card 2: Allocated */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Allocated</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold text-stone-900 dark:text-white font-mono tracking-tight">
            ${(metrics.allocatedBudgetUSD || 0).toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">To Departments</div>
        </div>

        {/* Card 3: Planned Increase */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Planned Increase</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-stone-900 dark:text-white font-mono tracking-tight">
            ${(metrics.plannedIncreaseUSD || 0).toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Proposed Employee Adjustments</div>
        </div>

        {/* Card 4: Remaining */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Remaining</span>
            <PieChartIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <div
            className={`text-xl font-extrabold font-mono tracking-tight ${
              metrics.remainingBudgetUSD < 0 ? "text-rose-500" : "text-stone-900 dark:text-white"
            }`}
          >
            ${(metrics.remainingBudgetUSD || 0).toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Available Reserve</div>
        </div>

        {/* Card 5: Utilization */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Utilization</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-extrabold text-stone-900 dark:text-white font-mono tracking-tight">
            {metrics.utilizationPercentage || 0}%
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.utilizationPercentage > 100
                  ? "bg-rose-500"
                  : metrics.utilizationPercentage > 85
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, metrics.utilizationPercentage || 0)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 6: Employees Included */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Employees</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-extrabold text-stone-900 dark:text-white font-mono tracking-tight">
            {(metrics.employeesCount || 0).toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">In Plan</div>
        </div>

        {/* Card 7: Avg Increase % */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Avg Increase</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
            {metrics.averageIncreasePercentage || 0}%
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Per Employee</div>
        </div>
      </div>

      {/* Visual Analytics Chart */}
      {chartData.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Compensation Budget Distribution & Utilization
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Comparing total budget, department allocation, and planned salary increase amounts across active compensation cycles.
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#888" }} />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString('en-US')}`, ""]}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderRadius: "12px",
                    border: "1px solid #3f3f46",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Bar dataKey="Budget" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Allocated" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Planned" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Plans Table Section */}
      <div className="rounded-3xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-5 border-b border-stone-200/80 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-950/40">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              Compensation Plans
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              {filteredPlans.length} Total
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Fiscal Year Filter */}
            <select
              value={fiscalYearFilter}
              onChange={(e) => setFiscalYearFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              {fiscalYears.map((fy) => (
                <option key={fy} value={fy}>
                  {fy === "All" ? "All Fiscal Years" : fy}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="In Review">In Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Finalized">Finalized</option>
            </select>
          </div>
        </div>

        {/* Plans Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 dark:border-stone-800/80 text-[11px] font-semibold text-stone-400 uppercase tracking-wider bg-stone-50/30 dark:bg-stone-950/20">
                <th className="py-3.5 px-6">Plan Name</th>
                <th className="py-3.5 px-4">Fiscal Year</th>
                <th className="py-3.5 px-4 text-right">Total Budget</th>
                <th className="py-3.5 px-4 text-right">Planned Increase</th>
                <th className="py-3.5 px-4 text-center">Utilization</th>
                <th className="py-3.5 px-4 text-center">Employees</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Created By</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60 text-xs">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    No compensation plans found. Create one to get started!
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const statusClass =
                    STATUS_COLORS[plan.status] || "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300";

                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-amber-500/5 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/compensation-planning/${plan.id}`)}
                    >
                      <td className="py-4 px-6 font-semibold text-stone-900 dark:text-white group-hover:text-amber-500 transition-colors">
                        {plan.name}
                      </td>
                      <td className="py-4 px-4 text-stone-600 dark:text-stone-300 font-mono">
                        {plan.fiscalYear}
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-semibold text-stone-900 dark:text-white">
                        ${(plan.metrics?.totalBudgetUSD || plan.totalBudgetUSD || 0).toLocaleString('en-US')}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-amber-600 dark:text-amber-400 font-semibold">
                        ${(plan.metrics?.plannedIncreaseUSD || 0).toLocaleString('en-US')}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                          <span>{plan.metrics?.utilizationPercentage || 0}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-stone-600 dark:text-stone-300">
                        {plan.metrics?.employeesCount || 0}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border ${statusClass}`}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-stone-500 dark:text-stone-400">
                        {plan.createdBy}
                      </td>
                      <td
                        className="py-4 px-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/compensation-planning/${plan.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold transition-colors"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDeletePlan(plan.id, plan.name, plan.status)}
                            disabled={isDeleting === plan.id}
                            className={`p-1.5 rounded-xl transition-colors ${
                              plan.status === "Finalized"
                                ? "text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                : "text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            }`}
                            title={
                              plan.status === "Finalized"
                                ? "Force Delete Plan (Admin)"
                                : plan.status === "Draft" || plan.status === "Rejected"
                                ? "Delete Plan"
                                : `Force Delete Plan (${plan.status})`
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Plan Modal */}
      <CreatePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newId) => {
          handleRefresh();
          router.push(`/compensation-planning/${newId}`);
        }}
      />
    </div>
  );
}
