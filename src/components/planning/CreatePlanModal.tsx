"use client";

import React, { useState } from "react";
import { DollarSign, Calendar, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Modal, Button, Input, Checkbox } from "@/components/ui";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (planId: string) => void;
}

export function CreatePlanModal({ isOpen, onClose, onSuccess }: CreatePlanModalProps) {
  const [name, setName] = useState(`FY${new Date().getFullYear() + 1} Global Compensation Plan`);
  const [fiscalYear, setFiscalYear] = useState(`FY${new Date().getFullYear() + 1}`);
  const [totalBudgetUSD, setTotalBudgetUSD] = useState("2500000");
  const [autoPopulateEmployees, setAutoPopulateEmployees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-white">
              Create Compensation Plan
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-normal mt-0.5">
              Set budget and fiscal cycle parameters for HR compensation planning
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-words leading-relaxed">{error}</span>
          </div>
        )}

        {/* Plan Name */}
        <Input
          label="Plan Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. FY2027 Global Compensation Plan"
          required
          shape="rounded"
        />

        {/* Fiscal Year & Total Budget Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fiscal Year"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            placeholder="e.g. FY2027"
            required
            shape="rounded"
            leftIcon={<Calendar className="w-4 h-4 text-stone-400" />}
          />

          <Input
            label="Total Budget (USD)"
            type="number"
            min="0"
            step="1000"
            value={totalBudgetUSD}
            onChange={(e) => setTotalBudgetUSD(e.target.value)}
            placeholder="2500000"
            required
            shape="rounded"
            leftIcon={<DollarSign className="w-4 h-4 text-stone-400" />}
          />
        </div>

        {/* Option: Auto populate active employees */}
        <div
          onClick={() => setAutoPopulateEmployees((prev) => !prev)}
          className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 cursor-pointer group select-none transition-colors"
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
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200/80 dark:border-stone-800/80">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            shape="pill"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            shape="pill"
            isLoading={isSubmitting}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Create Compensation Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
