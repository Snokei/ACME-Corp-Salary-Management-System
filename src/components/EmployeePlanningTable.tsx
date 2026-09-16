"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Filter,
  Users,
  Percent,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Trash2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface EmployeeItem {
  id: string;
  planId: string;
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: string;
  role: string;
  payGrade: string;
  avatarUrl: string;
  currentSalaryUSD: number;
  proposedSalaryUSD: number;
  increaseAmountUSD: number;
  increasePercentage: number;
  currentCompaRatio: number | null;
  newCompaRatio: number | null;
  bandMin: number | null;
  bandMid: number | null;
  bandMax: number | null;
  bandStatus: string;
  status: string;
}

interface EmployeePlanningTableProps {
  planId: string;
  isEditable: boolean;
  onRefreshPlan: () => void;
}

const DEPARTMENTS = [
  "All",
  "Engineering",
  "Product",
  "Sales",
  "Marketing",
  "Finance",
  "Human Resources",
  "Legal",
  "Operations",
];

export function EmployeePlanningTable({
  planId,
  isEditable,
  onRefreshPlan,
}: EmployeePlanningTableProps) {
  const [items, setItems] = useState<EmployeeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Bulk update state
  const [bulkPct, setBulkPct] = useState("5.0");
  const [isBulkApplying, setIsBulkApplying] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Local draft inputs for instant UI feel before API update
  const [itemInputs, setItemInputs] = useState<
    Record<string, { pct: string; salary: string }>
  >({});

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set("search", search.trim());
      if (department !== "All") params.set("department", department);

      const res = await fetch(`/api/compensation-planning/${planId}/items?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setItems(data.data.items || []);
        setTotal(data.data.total || 0);
        setTotalPages(data.data.totalPages || 1);

        // Populate local inputs
        const inputs: Record<string, { pct: string; salary: string }> = {};
        (data.data.items || []).forEach((item: EmployeeItem) => {
          inputs[item.id] = {
            pct: String(item.increasePercentage),
            salary: String(item.proposedSalaryUSD),
          };
        });
        setItemInputs(inputs);
      }
    } catch (err) {
      console.error("Failed to fetch employee planning items:", err);
      toast.error("Failed to load employee planning table");
    } finally {
      setIsLoading(false);
    }
  }, [planId, page, limit, search, department]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle single item update
  const handleUpdateItem = async (
    itemId: string,
    field: "increasePercentage" | "proposedSalaryUSD",
    value: number
  ) => {
    try {
      const payload =
        field === "increasePercentage"
          ? { increasePercentage: value }
          : { proposedSalaryUSD: value };

      const res = await fetch(`/api/compensation-planning/${planId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update employee salary proposal");
      }

      // Re-fetch item row calculations
      fetchItems();
      onRefreshPlan();
    } catch (err: any) {
      toast.error(err.message || "Failed to update item");
      fetchItems();
    }
  };

  const handlePctChange = (item: EmployeeItem, rawVal: string) => {
    setItemInputs((prev) => ({
      ...prev,
      [item.id]: { ...(prev[item.id] || {}), pct: rawVal },
    }));
  };

  const handlePctBlur = (item: EmployeeItem) => {
    const rawVal = itemInputs[item.id]?.pct ?? String(item.increasePercentage);
    const num = parseFloat(rawVal);
    if (isNaN(num) || num < 0) {
      toast.error("Increase percentage must be a non-negative number");
      setItemInputs((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], pct: String(item.increasePercentage) },
      }));
      return;
    }
    if (num !== item.increasePercentage) {
      handleUpdateItem(item.id, "increasePercentage", num);
    }
  };

  const handleSalaryChange = (item: EmployeeItem, rawVal: string) => {
    setItemInputs((prev) => ({
      ...prev,
      [item.id]: { ...(prev[item.id] || {}), salary: rawVal },
    }));
  };

  const handleSalaryBlur = (item: EmployeeItem) => {
    const rawVal = itemInputs[item.id]?.salary ?? String(item.proposedSalaryUSD);
    const num = parseFloat(rawVal);
    if (isNaN(num) || num < item.currentSalaryUSD) {
      toast.error("Proposed salary cannot be less than current salary");
      setItemInputs((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], salary: String(item.proposedSalaryUSD) },
      }));
      return;
    }
    if (num !== item.proposedSalaryUSD) {
      handleUpdateItem(item.id, "proposedSalaryUSD", num);
    }
  };

  const handleRemoveItem = async (itemId: string, name: string) => {
    if (!confirm(`Remove ${name} from compensation plan?`)) return;

    try {
      const res = await fetch(`/api/compensation-planning/${planId}/items/${itemId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove employee");
      }
      toast.success("Employee removed from plan");
      fetchItems();
      onRefreshPlan();
    } catch (err: any) {
      toast.error(err.message || "Could not remove employee");
    }
  };

  const handleApplyBulkIncrease = async () => {
    const pctNum = parseFloat(bulkPct);
    if (isNaN(pctNum) || pctNum < 0) {
      toast.error("Please enter a valid percentage increase");
      return;
    }

    setIsBulkApplying(true);
    try {
      const res = await fetch(`/api/compensation-planning/${planId}/items/bulk-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: department === "All" ? undefined : department,
          increasePercentage: pctNum,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to apply bulk increase");
      }

      toast.success(`Applied ${pctNum}% increase to ${data.data.count} employees!`);
      setShowBulkModal(false);
      fetchItems();
      onRefreshPlan();
    } catch (err: any) {
      toast.error(err.message || "Failed to apply bulk increase");
    } finally {
      setIsBulkApplying(false);
    }
  };

  const getCompaBadge = (ratio: number | null) => {
    if (ratio === null) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          N/A
        </span>
      );
    }
    let color = "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300/40";
    if (ratio < 85.0) {
      color = "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-300/40";
    } else if (ratio > 115.0) {
      color = "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300/40";
    }

    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${color}`}>
        {ratio.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Bulk Actions Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search employee by name, ID or role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Departments" : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action & Results Info */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
            Showing {total > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, total)} of {total}
          </span>

          {isEditable && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bulk Apply %</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Employee Planning Table */}
      <div className="rounded-2xl bg-white dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 dark:border-stone-800/80 text-[11px] font-semibold text-stone-400 uppercase tracking-wider bg-stone-50/50 dark:bg-stone-950/40">
                <th className="py-3.5 px-6">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Band & Pay Grade</th>
                <th className="py-3.5 px-4 text-right">Current Salary</th>
                <th className="py-3.5 px-4 text-center">Current Compa</th>
                <th className="py-3.5 px-4 text-right">Proposed Increase %</th>
                <th className="py-3.5 px-4 text-right">Increase ($)</th>
                <th className="py-3.5 px-4 text-right">Proposed Salary ($)</th>
                <th className="py-3.5 px-4 text-center">New Compa</th>
                {isEditable && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    Loading employee salary proposals...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    No employees matching filter criteria found in this plan.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const inputPct = itemInputs[item.id]?.pct ?? String(item.increasePercentage);
                  const inputSalary = itemInputs[item.id]?.salary ?? String(item.proposedSalaryUSD);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                    >
                      {/* Employee Info */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl}
                            alt={item.fullName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400/30"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-white">
                              {item.fullName}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              {item.role} • <span className="font-mono text-stone-500">{item.employeeCode}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300">
                        {item.department}
                      </td>

                      {/* Pay Grade & Band Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-800 dark:text-stone-200">
                            {item.payGrade}
                          </span>
                          {item.bandMid ? (
                            <span className="text-[10px] text-stone-400 font-mono">
                              Mid: ${(item.bandMid / 1000).toFixed(0)}k
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400">No Band</span>
                          )}
                        </div>
                      </td>

                      {/* Current Salary */}
                      <td className="py-3.5 px-4 text-right font-mono text-stone-700 dark:text-stone-300 font-semibold">
                        ${item.currentSalaryUSD.toLocaleString('en-US')}
                      </td>

                      {/* Current Compa-Ratio */}
                      <td className="py-3.5 px-4 text-center">
                        {getCompaBadge(item.currentCompaRatio)}
                      </td>

                      {/* Proposed Increase % Input */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditable ? (
                          <div className="relative inline-block w-24">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={inputPct}
                              onChange={(e) => handlePctChange(item, e.target.value)}
                              onBlur={() => handlePctBlur(item)}
                              className="w-full pr-5 pl-2 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-right text-xs font-mono font-bold text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500/50"
                            />
                            <Percent className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            {item.increasePercentage}%
                          </span>
                        )}
                      </td>

                      {/* Increase Amount ($) */}
                      <td className="py-3.5 px-4 text-right font-mono text-amber-600 dark:text-amber-400 font-semibold">
                        +${item.increaseAmountUSD.toLocaleString('en-US')}
                      </td>

                      {/* Proposed Salary ($ Input) */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditable ? (
                          <div className="relative inline-block w-32">
                            <DollarSign className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                              type="number"
                              min={item.currentSalaryUSD}
                              step="100"
                              value={inputSalary}
                              onChange={(e) => handleSalaryChange(item, e.target.value)}
                              onBlur={() => handleSalaryBlur(item)}
                              className="w-full pl-6 pr-2 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-right text-xs font-mono font-bold text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500/50"
                            />
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-stone-900 dark:text-white">
                            ${item.proposedSalaryUSD.toLocaleString('en-US')}
                          </span>
                        )}
                      </td>

                      {/* New Compa-Ratio */}
                      <td className="py-3.5 px-4 text-center">
                        {getCompaBadge(item.newCompaRatio)}
                      </td>

                      {/* Actions */}
                      {isEditable && (
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id, item.fullName)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Remove from plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-950/40">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-stone-700 dark:text-stone-300 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Apply Increase Modal */}
      {showBulkModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => setShowBulkModal(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-stone-900 dark:text-white">
                  Bulk Increase Tool
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Apply a uniform percentage increase across employees
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Target Scope
              </label>
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-950 text-xs text-stone-800 dark:text-stone-200 font-medium">
                {department === "All"
                  ? "All employees in compensation plan"
                  : `Employees in ${department} department`}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Increase Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={bulkPct}
                  onChange={(e) => setBulkPct(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-white text-sm font-mono font-bold focus:ring-2 focus:ring-amber-500/50"
                />
                <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkIncrease}
                disabled={isBulkApplying}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md disabled:opacity-50 transition-all"
              >
                {isBulkApplying ? "Applying..." : "Apply Bulk Increase"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
