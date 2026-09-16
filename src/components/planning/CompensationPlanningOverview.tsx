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
  Trash2,
  ChevronRight,
  Building2,
  Briefcase
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
import { PageHeader } from "@/components/layout/PageHeader";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty,
  Button,
  SearchInput,
  SearchableSelect,
  StatusBadge,
  GlassCard,
} from "@/components/ui";
import { CreatePlanModal } from "./CreatePlanModal";
import { usePlanningContext } from "./PlanningProvider";

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

export function CompensationPlanningOverview({ initialPlans = [] }: CompensationPlanningOverviewProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans);
  const { isModalOpen, setIsModalOpen } = usePlanningContext();
  const [search, setSearch] = useState("");
  const [fiscalYearFilter, setFiscalYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Extract unique fiscal years for filter
  const fiscalYears = useMemo(() => {
    const years = new Set(plans.map((p) => p.fiscalYear));
    return ["All", ...Array.from(years)];
  }, [plans]);

  // Aggregate global overview metrics across active/latest plan
  const activePlan = plans[0];
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

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Card 1: Total Budget */}
        <GlassCard className="p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Total Budget</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-white">
            ${(metrics.totalBudgetUSD || 0).toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            {activePlan ? `Pool for ${activePlan.fiscalYear}` : "No Active Plan"}
          </div>
        </GlassCard>

        {/* Card 2: Allocated */}
        <GlassCard className="p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Allocated</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-white">
            ${(metrics.allocatedBudgetUSD || 0).toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">To Departments</div>
        </GlassCard>

        {/* Card 3: Planned Increase */}
        <GlassCard className="p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Planned Increase</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-white">
            ${(metrics.plannedIncreaseUSD || 0).toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Proposed Increases</div>
        </GlassCard>

        {/* Card 4: Remaining */}
        <GlassCard className="p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Remaining</span>
            <PieChartIcon className="w-4 h-4 text-indigo-500" />
          </div>
          <div
            className={`text-xl font-bold ${
              metrics.remainingBudgetUSD < 0 ? "text-rose-500" : "text-stone-900 dark:text-white"
            }`}
          >
            ${(metrics.remainingBudgetUSD || 0).toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Available Reserve</div>
        </GlassCard>

        {/* Card 5: Utilization */}
        <GlassCard className="p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Utilization</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-white">
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
            />
          </div>
        </GlassCard>

        {/* Card 6: Employees Included */}
        <GlassCard className="p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Employees</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-white">
            {(metrics.employeesCount || 0).toLocaleString("en-US")}
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">In Plan</div>
        </GlassCard>

        {/* Card 7: Avg Increase % */}
        <GlassCard className="p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase">Avg Increase</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {metrics.averageIncreasePercentage || 0}%
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">Per Employee</div>
        </GlassCard>
      </div>

      {/* Visual Analytics Chart */}
      {chartData.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-white">
                Compensation Budget Distribution & Utilization
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
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
                  formatter={(val: number) => [`$${val.toLocaleString("en-US")}`, ""]}
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
        </GlassCard>
      )}

      {/* Plans Filter Bar */}
      <div className="relative z-30 p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <h2 className="text-base font-semibold text-stone-900 dark:text-white">
            Compensation Plans
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            {filteredPlans.length} Total
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input Component */}
          <div className="w-full sm:w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search plans..."
            />
          </div>

          {/* Fiscal Year Filter */}
          <div className="w-40">
            <SearchableSelect
              name="fiscalYear"
              options={fiscalYears}
              value={fiscalYearFilter}
              placeholder="All Fiscal Years"
              shape="pill"
              onChange={(val) => setFiscalYearFilter(val)}
            />
          </div>

          {/* Status Filter */}
          <div className="w-36">
            <SearchableSelect
              name="status"
              options={["All", "Draft", "In Review", "Approved", "Rejected", "Finalized"]}
              value={statusFilter}
              placeholder="All Statuses"
              shape="pill"
              onChange={(val) => setStatusFilter(val)}
            />
          </div>
        </div>
      </div>

      {/* Plans Table Section */}
      <TableContainer className="relative z-10">
        {/* Plans Table */}
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="px-5">Plan Name</TableHead>
              <TableHead>Fiscal Year</TableHead>
              <TableHead align="right">Total Budget</TableHead>
              <TableHead align="right">Planned Increase</TableHead>
              <TableHead align="center">Utilization</TableHead>
              <TableHead align="center">Employees</TableHead>
              <TableHead align="center">Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead align="right" className="px-5">Actions</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {filteredPlans.length === 0 ? (
              <TableEmpty
                colSpan={9}
                title="No compensation plans found"
                description="Create a new compensation plan to get started!"
              />
            ) : (
              filteredPlans.map((plan) => (
                <TableRow
                  key={plan.id}
                  hoverable
                  clickable
                  onClick={() => router.push(`/compensation-planning/${plan.id}`)}
                >
                  <TableCell className="px-5 font-semibold text-stone-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {plan.name}
                  </TableCell>
                  <TableCell className="text-stone-600 dark:text-stone-300 font-medium">
                    {plan.fiscalYear}
                  </TableCell>
                  <TableCell align="right" className="font-semibold text-stone-900 dark:text-white">
                    ${(plan.metrics?.totalBudgetUSD || plan.totalBudgetUSD || 0).toLocaleString("en-US")}
                  </TableCell>
                  <TableCell align="right" className="text-amber-600 dark:text-amber-400 font-semibold">
                    ${(plan.metrics?.plannedIncreaseUSD || 0).toLocaleString("en-US")}
                  </TableCell>
                  <TableCell align="center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                      {plan.metrics?.utilizationPercentage || 0}%
                    </span>
                  </TableCell>
                  <TableCell align="center" className="font-medium text-stone-600 dark:text-stone-300">
                    {plan.metrics?.employeesCount || 0}
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge status={plan.status} />
                  </TableCell>
                  <TableCell className="text-stone-500 dark:text-stone-400">
                    {plan.createdBy}
                  </TableCell>
                  <TableCell
                    align="right"
                    className="px-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        shape="rounded"
                        onClick={() => router.push(`/compensation-planning/${plan.id}`)}
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        Details
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        shape="rounded"
                        disabled={isDeleting === plan.id}
                        onClick={() => handleDeletePlan(plan.id, plan.name, plan.status)}
                        className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5"
                        title={
                          plan.status === "Finalized"
                            ? "Force Delete Plan (Admin)"
                            : plan.status === "Draft" || plan.status === "Rejected"
                            ? "Delete Plan"
                            : `Force Delete Plan (${plan.status})`
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
