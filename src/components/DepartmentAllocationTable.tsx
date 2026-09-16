"use client";

import React, { useState, useEffect } from "react";
import { Building2, Save, RefreshCw, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

interface DepartmentBudgetSummary {
  department: string;
  employeeCount: number;
  currentPayrollUSD: number;
  allocatedBudgetUSD: number;
  plannedIncreaseUSD: number;
  remainingBudgetUSD: number;
  utilizationPercentage: number;
}

interface DepartmentAllocationTableProps {
  planId: string;
  totalBudgetUSD: number;
  isEditable: boolean;
  onRefreshPlan: () => void;
}

export function DepartmentAllocationTable({
  planId,
  totalBudgetUSD,
  isEditable,
  onRefreshPlan,
}: DepartmentAllocationTableProps) {
  const [departments, setDepartments] = useState<DepartmentBudgetSummary[]>([]);
  const [allocatedInputs, setAllocatedInputs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDepartmentData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/compensation-planning/${planId}/departments`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDepartments(data.data);
        const initialInputs: Record<string, string> = {};
        data.data.forEach((d: DepartmentBudgetSummary) => {
          initialInputs[d.department] = String(d.allocatedBudgetUSD);
        });
        setAllocatedInputs(initialInputs);
      }
    } catch (err) {
      console.error("Failed to load department budget allocations:", err);
      toast.error("Failed to load department budgets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [planId]);

  const handleInputChange = (department: string, value: string) => {
    setAllocatedInputs((prev) => ({
      ...prev,
      [department]: value,
    }));
  };

  // Calculate live sum of department allocations
  const currentTotalAllocated = Object.values(allocatedInputs).reduce((sum, val) => {
    const num = parseFloat(val);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const allocationOverflow = currentTotalAllocated > totalBudgetUSD;

  const handleSaveAllocations = async () => {
    setIsSaving(true);
    try {
      const payload = Object.entries(allocatedInputs).map(([dept, val]) => ({
        department: dept,
        allocatedBudgetUSD: parseFloat(val) || 0,
      }));

      const res = await fetch(`/api/compensation-planning/${planId}/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations: payload }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update department allocations");
      }

      toast.success("Department budget allocations saved successfully!");
      fetchDepartmentData();
      onRefreshPlan();
    } catch (err: any) {
      toast.error(err.message || "Failed to save department allocations");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-stone-400 text-xs">
        Loading department budget allocations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls & Validation Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            Department Budget Allocation
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Allocate fiscal compensation pools to individual departments and track planned increases against pool limits.
          </p>
        </div>

        {isEditable && (
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDepartmentData}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Reset Changes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveAllocations}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save Department Budgets"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Allocation Overflow Alert */}
      {allocationOverflow && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold">Total Department Allocation Exceeds Plan Budget!</span>
            <p className="mt-0.5">
              Sum of allocations (${currentTotalAllocated.toLocaleString('en-US')}) is greater than the total budget (${totalBudgetUSD.toLocaleString('en-US')}). Adjust amounts before submitting.
            </p>
          </div>
        </div>
      )}

      {/* Department Allocation Table */}
      <div className="rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 dark:border-stone-800/80 text-[11px] font-semibold text-stone-400 uppercase tracking-wider bg-stone-50/50 dark:bg-stone-950/40">
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-4 text-center">Employees</th>
                <th className="py-3.5 px-4 text-right">Current Payroll</th>
                <th className="py-3.5 px-4 text-right">Allocated Budget</th>
                <th className="py-3.5 px-4 text-right">Planned Increase</th>
                <th className="py-3.5 px-4 text-right">Remaining Budget</th>
                <th className="py-3.5 px-6 text-center">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60 text-xs">
              {departments.map((dept) => {
                const inputValue = allocatedInputs[dept.department] ?? String(dept.allocatedBudgetUSD);
                const currentAllocated = parseFloat(inputValue) || 0;
                const remaining = currentAllocated - dept.plannedIncreaseUSD;
                const utilization =
                  currentAllocated > 0
                    ? Math.round((dept.plannedIncreaseUSD / currentAllocated) * 1000) / 10
                    : 0;

                return (
                  <tr key={dept.department} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-stone-900 dark:text-white">
                      {dept.department}
                    </td>
                    <td className="py-4 px-4 text-center font-mono text-stone-600 dark:text-stone-300">
                      {dept.employeeCount}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-stone-600 dark:text-stone-300">
                      ${dept.currentPayrollUSD.toLocaleString('en-US')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isEditable ? (
                        <div className="relative inline-block w-36">
                          <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={inputValue}
                            onChange={(e) => handleInputChange(dept.department, e.target.value)}
                            className="w-full pl-7 pr-3 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-right text-xs font-mono font-semibold text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                      ) : (
                        <span className="font-mono font-semibold text-stone-900 dark:text-white">
                          ${dept.allocatedBudgetUSD.toLocaleString('en-US')}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                      ${dept.plannedIncreaseUSD.toLocaleString('en-US')}
                    </td>
                    <td
                      className={`py-4 px-4 text-right font-mono font-semibold ${
                        remaining < 0 ? "text-rose-500" : "text-stone-900 dark:text-white"
                      }`}
                    >
                      ${remaining.toLocaleString('en-US')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${
                              utilization > 100
                                ? "bg-rose-500"
                                : utilization > 85
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, utilization)}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-xs text-stone-600 dark:text-stone-300">
                          {utilization}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stone-200 dark:border-stone-800 font-bold bg-stone-50/70 dark:bg-stone-950/60 text-stone-900 dark:text-white text-xs">
                <td className="py-4 px-6">Total Allocations</td>
                <td className="py-4 px-4 text-center font-mono">
                  {departments.reduce((sum, d) => sum + d.employeeCount, 0)}
                </td>
                <td className="py-4 px-4 text-right font-mono">
                  ${departments.reduce((sum, d) => sum + d.currentPayrollUSD, 0).toLocaleString('en-US')}
                </td>
                <td className="py-4 px-4 text-right font-mono text-blue-600 dark:text-blue-400">
                  ${currentTotalAllocated.toLocaleString('en-US')}
                </td>
                <td className="py-4 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                  ${departments.reduce((sum, d) => sum + d.plannedIncreaseUSD, 0).toLocaleString('en-US')}
                </td>
                <td className="py-4 px-4 text-right font-mono">
                  ${(currentTotalAllocated - departments.reduce((sum, d) => sum + d.plannedIncreaseUSD, 0)).toLocaleString('en-US')}
                </td>
                <td className="py-4 px-6 text-center font-mono">
                  {totalBudgetUSD > 0
                    ? `${Math.round(
                        (departments.reduce((sum, d) => sum + d.plannedIncreaseUSD, 0) / totalBudgetUSD) * 100
                      )}%`
                    : "0%"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
