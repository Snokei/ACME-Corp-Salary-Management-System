"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, DollarSign, Calendar, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (planId: string) => void;
}

export function CreatePlanModal({ isOpen, onClose, onSuccess }: CreatePlanModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(`FY${new Date().getFullYear() + 1} Global Compensation Plan`);
  const [fiscalYear, setFiscalYear] = useState(`FY${new Date().getFullYear() + 1}`);
  const [totalBudgetUSD, setTotalBudgetUSD] = useState("2500000");
  const [autoPopulateEmployees, setAutoPopulateEmployees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const budgetNum = parseFloat(totalBudgetUSD);
    if (isNaN(budgetNum) || budgetNum < 0) {
      setError("Please enter a valid positive total budget amount.");
      return;
    }

    if (!name.trim() || !fiscalYear.trim()) {
      setError("Plan name and fiscal year are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/compensation-planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          fiscalYear: fiscalYear.trim(),
          totalBudgetUSD: budgetNum,
          autoPopulateEmployees,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create compensation plan");
      }

      toast.success("Compensation plan created successfully!");
      onSuccess(data.data.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden transition-all animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                Create Compensation Plan
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Set budget and fiscal cycle parameters for HR compensation planning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 max-h-36 overflow-y-auto">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="break-words leading-relaxed">{error}</span>
            </div>
          )}

          {/* Plan Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Plan Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. FY2027 Global Compensation Plan"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
          </div>

          {/* Fiscal Year & Total Budget Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Fiscal Year
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  placeholder="e.g. FY2027"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Total Budget (USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={totalBudgetUSD}
                  onChange={(e) => setTotalBudgetUSD(e.target.value)}
                  placeholder="2500000"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Option: Auto populate active employees */}
          <div
            onClick={() => setAutoPopulateEmployees((prev) => !prev)}
            className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900/50 cursor-pointer group select-none transition-colors"
          >
            <div className="pt-0.5 shrink-0">
              <Checkbox
                checked={autoPopulateEmployees}
                onChange={(checked) => setAutoPopulateEmployees(checked)}
                size="sm"
                ariaLabel="Auto-include all active employees & pro-rate department budgets"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors block">
                Auto-include all active employees & pro-rate department budgets
              </span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                Populates current active workforce salaries and calculates starting department allocations automatically.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>Creating Plan...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Compensation Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
