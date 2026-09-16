"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  PieChart,
  TrendingUp,
  Users,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Send,
  XCircle,
  FileCheck,
  Building2,
  Sparkles,
  RefreshCw,
  Sliders,
  AlertCircle,
  Lock,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { DepartmentAllocationTable } from "./DepartmentAllocationTable";
import { EmployeePlanningTable } from "./EmployeePlanningTable";
import { ScenarioPlanningTab } from "./ScenarioPlanningTab";

interface PlanDetailData {
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
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

interface CompensationPlanDetailViewProps {
  initialPlan: PlanDetailData;
}

const STATUS_BADGES: Record<string, { label: string; class: string }> = {
  Draft: { label: "Draft", class: "bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700" },
  "In Review": { label: "In Review", class: "bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-700" },
  Approved: { label: "Approved", class: "bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-700" },
  Rejected: { label: "Rejected", class: "bg-rose-500/10 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-700" },
  Finalized: { label: "Finalized & Applied", class: "bg-blue-500/10 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-700" },
};

export function CompensationPlanDetailView({ initialPlan }: CompensationPlanDetailViewProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanDetailData>(initialPlan);
  const [activeTab, setActiveTab] = useState<"employees" | "departments" | "scenarios">("employees");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchPlanDetails = async () => {
    try {
      const res = await fetch(`/api/compensation-planning/${plan.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPlan(data.data);
      }
    } catch (err) {
      console.error("Failed to refresh plan details:", err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === "Finalized") {
      if (
        !confirm(
          `Finalize plan "${plan.name}"? This will permanently update employee base salaries in the system and generate salary history records!`
        )
      ) {
        return;
      }
    }

    setIsTransitioning(true);
    try {
      const res = await fetch(`/api/compensation-planning/${plan.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update plan status");
      }

      toast.success(
        newStatus === "Finalized"
          ? "Plan finalized & employee salaries updated!"
          : `Plan status updated to ${newStatus}`
      );
      fetchPlanDetails();
    } catch (err: any) {
      toast.error(err.message || "Failed to change status");
    } finally {
      setIsTransitioning(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePlan = async () => {
    const isFinalized = plan.status === "Finalized";
    const isNonDraft = plan.status !== "Draft" && plan.status !== "Rejected";

    let confirmMsg = `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`;
    if (isFinalized) {
      confirmMsg = `⚠️ ADMIN ACTION: "${plan.name}" has already been Finalized & Applied!\n\nForce deleting will remove the plan record. Employee base salaries will remain at their updated rates.\n\nAre you sure you want to permanently delete this plan as Admin?`;
    } else if (isNonDraft) {
      confirmMsg = `Are you sure you want to delete "${plan.name}" (Status: ${plan.status})? This action cannot be undone.`;
    }

    if (!confirm(confirmMsg)) {
      return;
    }

    setIsDeleting(true);
    try {
      const url = `/api/compensation-planning/${plan.id}${isNonDraft ? "?force=true" : ""}`;
      const res = await fetch(url, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete plan");
      }

      toast.success(isFinalized ? "Plan force deleted (Admin)" : "Compensation plan deleted");
      router.push("/compensation-planning");
    } catch (err: any) {
      toast.error(err.message || "Could not delete plan");
      setIsDeleting(false);
    }
  };

  const isEditable = plan.status === "Draft" || plan.status === "Rejected";
  const metrics = plan.metrics;
  const validation = plan.validation || { isValid: true, errors: [], warnings: [] };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/compensation-planning"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Compensation Planning Overview</span>
        </Link>
      </div>

      {/* Header View & Status Workflow Actions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                STATUS_BADGES[plan.status]?.class || ""
              }`}
            >
              {STATUS_BADGES[plan.status]?.label || plan.status}
            </span>
            <span className="text-xs font-mono font-semibold text-stone-500">
              {plan.fiscalYear}
            </span>
            <span className="text-xs text-stone-400">
              Created by {plan.createdBy}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            {plan.name}
          </h1>
        </div>

        {/* Workflow Transition Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {plan.status === "Draft" && (
            <button
              onClick={() => handleStatusChange("In Review")}
              disabled={isTransitioning || !validation.isValid}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Review</span>
            </button>
          )}

          {plan.status === "In Review" && (
            <>
              <button
                onClick={() => handleStatusChange("Approved")}
                disabled={isTransitioning || !validation.isValid}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Plan</span>
              </button>
              <button
                onClick={() => handleStatusChange("Rejected")}
                disabled={isTransitioning}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}

          {plan.status === "Approved" && (
            <>
              <button
                onClick={() => handleStatusChange("Finalized")}
                disabled={isTransitioning || !validation.isValid}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40"
              >
                <FileCheck className="w-4 h-4" />
                <span>Finalize Plan & Apply Salaries</span>
              </button>
              <button
                onClick={() => handleStatusChange("Draft")}
                disabled={isTransitioning}
                className="px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Revert to Draft
              </button>
            </>
          )}

          {plan.status === "Rejected" && (
            <button
              onClick={() => handleStatusChange("Draft")}
              disabled={isTransitioning}
              className="px-4 py-2.5 rounded-2xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Revert to Draft
            </button>
          )}

          {plan.status === "Finalized" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Plan Finalized & Applied</span>
            </div>
          )}

          <button
            onClick={handleDeletePlan}
            disabled={isDeleting || isTransitioning}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors disabled:opacity-40"
            title={plan.status === "Finalized" ? "Force Delete Plan (Admin)" : "Delete Plan"}
          >
            <Trash2 className="w-4 h-4" />
            <span>{plan.status === "Finalized" ? "Force Delete (Admin)" : "Delete Plan"}</span>
          </button>
        </div>
      </div>

      {/* Validation Alert Banner */}
      {(!validation.isValid || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((err, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3 font-medium"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{err}</span>
            </div>
          ))}
          {validation.warnings.map((warn, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-3 font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Total Budget
          </div>
          <div className="text-lg font-extrabold text-stone-900 dark:text-white font-mono">
            ${(metrics.totalBudgetUSD || 0).toLocaleString('en-US')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Allocated Budget
          </div>
          <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            ${(metrics.allocatedBudgetUSD || 0).toLocaleString('en-US')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Planned Increase
          </div>
          <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            ${(metrics.plannedIncreaseUSD || 0).toLocaleString('en-US')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Remaining Budget
          </div>
          <div
            className={`text-lg font-extrabold font-mono ${
              metrics.remainingBudgetUSD < 0 ? "text-rose-500" : "text-stone-900 dark:text-white"
            }`}
          >
            ${(metrics.remainingBudgetUSD || 0).toLocaleString('en-US')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Budget Utilization
          </div>
          <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {metrics.utilizationPercentage || 0}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Employees
          </div>
          <div className="text-lg font-extrabold text-stone-900 dark:text-white font-mono">
            {(metrics.employeesCount || 0).toLocaleString('en-US')}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Avg Increase
          </div>
          <div className="text-lg font-extrabold text-amber-500 font-mono">
            {metrics.averageIncreasePercentage || 0}%
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "employees"
              ? "bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 shadow-md"
              : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Salary Planning</span>
        </button>

        <button
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "departments"
              ? "bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 shadow-md"
              : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Budget Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab("scenarios")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "scenarios"
              ? "bg-stone-900 text-white dark:bg-amber-500 dark:text-stone-950 shadow-md"
              : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Scenario Planning</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "employees" && (
          <EmployeePlanningTable
            planId={plan.id}
            isEditable={isEditable}
            onRefreshPlan={fetchPlanDetails}
          />
        )}

        {activeTab === "departments" && (
          <DepartmentAllocationTable
            planId={plan.id}
            totalBudgetUSD={plan.totalBudgetUSD}
            isEditable={isEditable}
            onRefreshPlan={fetchPlanDetails}
          />
        )}

        {activeTab === "scenarios" && (
          <ScenarioPlanningTab
            planId={plan.id}
            totalBudgetUSD={plan.totalBudgetUSD}
            isEditable={isEditable}
            onRefreshPlan={fetchPlanDetails}
          />
        )}
      </div>
    </div>
  );
}
