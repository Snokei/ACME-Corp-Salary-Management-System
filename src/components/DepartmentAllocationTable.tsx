"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Building2, Save, RefreshCw, AlertTriangle, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TableLoading,
  Button,
} from "@/components/ui";

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

  // Memoize live sum of department allocations to avoid re-calculation on every render
  const currentTotalAllocated = useMemo(() => {
    return Object.values(allocatedInputs).reduce((sum, val) => {
      const num = parseFloat(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [allocatedInputs]);

  const allocationOverflow = currentTotalAllocated > totalBudgetUSD;

  // Memoize department totals
  const totals = useMemo(() => {
    const totalEmployees = departments.reduce((sum, d) => sum + d.employeeCount, 0);
    const totalCurrentPayroll = departments.reduce((sum, d) => sum + d.currentPayrollUSD, 0);
    const totalPlannedIncrease = departments.reduce((sum, d) => sum + d.plannedIncreaseUSD, 0);
    const remaining = currentTotalAllocated - totalPlannedIncrease;
    const utilization =
      totalBudgetUSD > 0
        ? Math.round((totalPlannedIncrease / totalBudgetUSD) * 100)
        : 0;

    return {
      totalEmployees,
      totalCurrentPayroll,
      totalPlannedIncrease,
      remaining,
      utilization,
    };
  }, [departments, currentTotalAllocated, totalBudgetUSD]);

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

  return (
    <div className="space-y-4">
      {/* Top Controls & Validation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-md">
        <div>
          <h3 className="text-base font-semibold text-stone-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            <span>Department Budget Allocation</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Allocate fiscal compensation pools to individual departments and track planned increases against pool limits.
          </p>
        </div>

        {isEditable && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              shape="pill"
              onClick={fetchDepartmentData}
              title="Reset Changes"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              shape="pill"
              onClick={handleSaveAllocations}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Department Budgets
            </Button>
          </div>
        )}
      </div>

      {/* Allocation Overflow Alert */}
      {allocationOverflow && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-semibold">Total Department Allocation Exceeds Plan Budget!</span>
            <p className="mt-0.5">
              Sum of allocations (${currentTotalAllocated.toLocaleString("en-US")}) is greater than the total plan budget (${totalBudgetUSD.toLocaleString("en-US")}). Adjust amounts before submitting.
            </p>
          </div>
        </div>
      )}

      {/* Department Allocation Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="px-5">Department</TableHead>
              <TableHead align="center">Employees</TableHead>
              <TableHead align="right">Current Payroll</TableHead>
              <TableHead align="right">Allocated Budget</TableHead>
              <TableHead align="right">Planned Increase</TableHead>
              <TableHead align="right">Remaining Budget</TableHead>
              <TableHead align="center" className="px-5">Utilization</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableLoading colSpan={7} message="Loading department budget allocations..." />
            ) : (
              departments.map((dept) => {
                const inputValue = allocatedInputs[dept.department] ?? String(dept.allocatedBudgetUSD);
                const currentAllocated = parseFloat(inputValue) || 0;
                const remaining = currentAllocated - dept.plannedIncreaseUSD;
                const utilization =
                  currentAllocated > 0
                    ? Math.round((dept.plannedIncreaseUSD / currentAllocated) * 1000) / 10
                    : 0;

                return (
                  <TableRow key={dept.department} hoverable>
                    <TableCell className="px-5 font-semibold text-stone-900 dark:text-white">
                      {dept.department}
                    </TableCell>
                    <TableCell align="center" className="text-stone-600 dark:text-stone-300 font-medium">
                      {dept.employeeCount}
                    </TableCell>
                    <TableCell align="right" className="text-stone-600 dark:text-stone-300 font-medium">
                      ${dept.currentPayrollUSD.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell align="right">
                      {isEditable ? (
                        <div className="relative inline-block w-36">
                          <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={inputValue}
                            onChange={(e) => handleInputChange(dept.department, e.target.value)}
                            className="w-full pl-7 pr-3 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-right text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                          />
                        </div>
                      ) : (
                        <span className="font-semibold text-stone-900 dark:text-white">
                          ${dept.allocatedBudgetUSD.toLocaleString("en-US")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell align="right" className="font-semibold text-amber-600 dark:text-amber-400">
                      ${dept.plannedIncreaseUSD.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell
                      align="right"
                      className={`font-semibold ${
                        remaining < 0 ? "text-rose-500" : "text-stone-900 dark:text-white"
                      }`}
                    >
                      ${remaining.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell align="center" className="px-5">
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
                          />
                        </div>
                        <span className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                          {utilization}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>

          {!isLoading && departments.length > 0 && (
            <TableFooter>
              <tr className="font-semibold text-stone-900 dark:text-white text-xs">
                <td className="py-3.5 px-5">Total Allocations</td>
                <td className="py-3.5 px-4 text-center font-medium">
                  {totals.totalEmployees}
                </td>
                <td className="py-3.5 px-4 text-right font-medium">
                  ${totals.totalCurrentPayroll.toLocaleString("en-US")}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                  ${currentTotalAllocated.toLocaleString("en-US")}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">
                  ${totals.totalPlannedIncrease.toLocaleString("en-US")}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold">
                  ${totals.remaining.toLocaleString("en-US")}
                </td>
                <td className="py-3.5 px-5 text-center font-semibold">
                  {totals.utilization}%
                </td>
              </tr>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </div>
  );
}
