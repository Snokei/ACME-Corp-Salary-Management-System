"use client";

import React, { useState } from "react";
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
  AlertCircle,
  Lock,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { GlassCard, Button, StatusBadge } from "@/components/ui";
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

export function CompensationPlanDetailView({ initialPlan }: CompensationPlanDetailViewProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanDetailData>(initialPlan);
  const [activeTab, setActiveTab] = useState<"employees" | "departments" | "scenarios">("employees");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    <div className="space-y-6 pb-12 animate-fade-in">
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
      <GlassCard className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={plan.status} />
            <span className="text-xs font-mono font-semibold text-stone-500">
              {plan.fiscalYear}
            </span>
            <span className="text-xs text-stone-400">
              Created by {plan.createdBy}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-semibold text-stone-900 dark:text-white tracking-tight">
            {plan.name}
          </h1>
        </div>

        {/* Workflow Transition Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {plan.status === "Draft" && (
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              onClick={() => handleStatusChange("In Review")}
              isLoading={isTransitioning}
              disabled={!validation.isValid}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit for Review
            </Button>
          )}

          {plan.status === "In Review" && (
            <>
              <Button
                variant="primary"
                size="sm"
                shape="pill"
                onClick={() => handleStatusChange("Approved")}
                isLoading={isTransitioning}
                disabled={!validation.isValid}
                leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              >
                Approve Plan
              </Button>
              <Button
                variant="danger"
                size="sm"
                shape="pill"
                onClick={() => handleStatusChange("Rejected")}
                isLoading={isTransitioning}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Reject
              </Button>
            </>
          )}

          {plan.status === "Approved" && (
            <>
              <Button
                variant="primary"
                size="sm"
                shape="pill"
                onClick={() => handleStatusChange("Finalized")}
                isLoading={isTransitioning}
                disabled={!validation.isValid}
                leftIcon={<FileCheck className="w-4 h-4 text-blue-400" />}
              >
                Finalize Plan & Apply Salaries
              </Button>
              <Button
                variant="secondary"
                size="sm"
                shape="pill"
                onClick={() => handleStatusChange("Draft")}
                disabled={isTransitioning}
              >
                Revert to Draft
              </Button>
            </>
          )}

          {plan.status === "Rejected" && (
            <Button
              variant="secondary"
              size="sm"
              shape="pill"
              onClick={() => handleStatusChange("Draft")}
              disabled={isTransitioning}
            >
              Revert to Draft
            </Button>
          )}

          {plan.status === "Finalized" && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Plan Finalized & Applied</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            shape="pill"
            onClick={handleDeletePlan}
            disabled={isDeleting || isTransitioning}
            className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title={plan.status === "Finalized" ? "Force Delete Plan (Admin)" : "Delete Plan"}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            {plan.status === "Finalized" ? "Force Delete" : "Delete"}
          </Button>
        </div>
      </GlassCard>

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
        <GlassCard className="p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Total Budget
          </div>
          <div className="text-lg font-bold text-stone-900 dark:text-white">
            ${(metrics.totalBudgetUSD || 0).toLocaleString("en-US")}
          </div>
        </GlassCard>

        <GlassCard className="p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Allocated Budget
          </div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            ${(metrics.allocatedBudgetUSD || 0).toLocaleString("en-US")}
          </div>
        </GlassCard>

        <GlassCard className="p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Planned Increase
          </div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
            ${(metrics.plannedIncreaseUSD || 0).toLocaleString("en-US")}
          </div>
        </GlassCard>

        <GlassCard className="p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Remaining Budget
          </div>
          <div
            className={`text-lg font-bold ${
              metrics.remainingBudgetUSD < 0 ? "text-rose-500" : "text-stone-900 dark:text-white"
            }`}
          >
            ${(metrics.remainingBudgetUSD || 0).toLocaleString("en-US")}
          </div>
        </GlassCard>

        <GlassCard className="p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Budget Utilization
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {metrics.utilizationPercentage || 0}%
          </div>
        </GlassCard>

        <GlassCard className="p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Employees
          </div>
          <div className="text-lg font-bold text-stone-900 dark:text-white">
            {(metrics.employeesCount || 0).toLocaleString("en-US")}
          </div>
        </GlassCard>

        <GlassCard className="p-4 rounded-2xl">
          <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
            Avg Increase
          </div>
          <div className="text-lg font-bold text-amber-500">
            {metrics.averageIncreasePercentage || 0}%
          </div>
        </GlassCard>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-2">
        <Button
          variant={activeTab === "employees" ? "primary" : "ghost"}
          size="sm"
          shape="pill"
          onClick={() => setActiveTab("employees")}
          leftIcon={<Users className="w-4 h-4" />}
        >
          Employee Salary Planning
        </Button>

        <Button
          variant={activeTab === "departments" ? "primary" : "ghost"}
          size="sm"
          shape="pill"
          onClick={() => setActiveTab("departments")}
          leftIcon={<Building2 className="w-4 h-4" />}
        >
          Department Budget Allocation
        </Button>

        <Button
          variant={activeTab === "scenarios" ? "primary" : "ghost"}
          size="sm"
          shape="pill"
          onClick={() => setActiveTab("scenarios")}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Scenario Planning
        </Button>
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
