"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Percent, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { GlassCard, Button } from "@/components/ui";

interface ScenarioSimulationResult {
  id: string;
  name: string;
  increasePct: number;
  totalAdditionalCompUSD: number;
  remainingBudgetUSD: number;
  averageIncreasePct: number;
  employeesAffected: number;
  utilizationPercentage: number;
}

interface ScenarioPlanningTabProps {
  planId: string;
  totalBudgetUSD: number;
  isEditable: boolean;
  onRefreshPlan: () => void;
}

export function ScenarioPlanningTab({
  planId,
  totalBudgetUSD,
  isEditable,
  onRefreshPlan,
}: ScenarioPlanningTabProps) {
  const [scenarios, setScenarios] = useState<ScenarioSimulationResult[]>([]);
  const [customPct, setCustomPct] = useState("4.5");
  const [debouncedCustomPct, setDebouncedCustomPct] = useState("4.5");
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  // Debounce custom percentage input to avoid firing API requests on every partial keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomPct(customPct);
    }, 400);
    return () => clearTimeout(handler);
  }, [customPct]);

  useEffect(() => {
    const fetchScenarios = async () => {
      setIsLoading(true);
      try {
        const pcts = [3, 5, 7];
        const customNum = parseFloat(debouncedCustomPct);
        if (!isNaN(customNum) && !pcts.includes(customNum)) {
          pcts.push(customNum);
        }
        pcts.sort((a, b) => a - b);

        const res = await fetch(
          `/api/compensation-planning/${planId}/scenarios?percentages=${pcts.join(",")}`
        );
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          setScenarios(data.data);
        }
      } catch (err) {
        console.error("Failed to calculate scenario simulations:", err);
        toast.error("Failed to load scenario simulations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScenarios();
  }, [planId, debouncedCustomPct]);

  const handleApplyScenario = async (pct: number, scenarioName: string) => {
    if (!confirm(`Apply ${pct}% increase across all employees for "${scenarioName}"?`)) {
      return;
    }

    setIsApplying(scenarioName);
    try {
      const res = await fetch(`/api/compensation-planning/${planId}/items/bulk-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increasePercentage: pct }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to apply scenario");
      }

      toast.success(`Applied ${pct}% scenario to all plan items!`);
      onRefreshPlan();
    } catch (err: any) {
      toast.error(err.message || "Could not apply scenario");
    } finally {
      setIsApplying(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-stone-400 text-xs">
        Calculating compensation scenario models...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <GlassCard className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-semibold text-stone-900 dark:text-white">
              Compensation Scenario Planning
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xl">
            Simulate average salary increase scenarios without modifying actual employee salary history. Test budget utilization before finalizing proposals.
          </p>
        </div>

        {/* Custom Scenario Input */}
        <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-950/80 p-2 rounded-2xl border border-stone-200/80 dark:border-stone-800">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 pl-2">
            Custom Scenario:
          </span>
          <div className="relative w-24">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={customPct}
              onChange={(e) => setCustomPct(e.target.value)}
              className="w-full pr-5 pl-2 py-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-right text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            <Percent className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </GlassCard>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scenarios.map((scen) => {
          const isOverBudget = scen.remainingBudgetUSD < 0;

          return (
            <GlassCard
              key={scen.id}
              className={`p-6 flex flex-col justify-between space-y-5 transition-all ${
                isOverBudget
                  ? "border-rose-500/30 hover:border-rose-500/50"
                  : "hover:border-amber-400/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {scen.name}
                  </span>
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    +{scen.increasePct}% Avg
                  </span>
                </div>

                {/* Main Metrics Breakdown */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 dark:text-stone-400">
                      Total Additional Compensation:
                    </span>
                    <span className="font-bold text-stone-900 dark:text-white text-sm">
                      ${scen.totalAdditionalCompUSD.toLocaleString("en-US")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 dark:text-stone-400">
                      Remaining Reserve Budget:
                    </span>
                    <span
                      className={`font-bold text-sm ${
                        isOverBudget ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      ${scen.remainingBudgetUSD.toLocaleString("en-US")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 dark:text-stone-400">Employees Impacted:</span>
                    <span className="text-stone-800 dark:text-stone-200 font-medium">
                      {scen.employeesAffected.toLocaleString("en-US")}
                    </span>
                  </div>

                  {/* Utilization Progress */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-500 dark:text-stone-400">Budget Utilization:</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        {scen.utilizationPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOverBudget
                            ? "bg-rose-500"
                            : scen.utilizationPercentage > 85
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, scen.utilizationPercentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {isEditable && (
                <Button
                  variant={isOverBudget ? "outline" : "primary"}
                  size="sm"
                  shape="pill"
                  className="w-full justify-center"
                  disabled={isApplying === scen.name || isOverBudget}
                  onClick={() => handleApplyScenario(scen.increasePct, scen.name)}
                  isLoading={isApplying === scen.name}
                  rightIcon={!isOverBudget && <ArrowRight className="w-3.5 h-3.5" />}
                >
                  {isOverBudget ? "Exceeds Total Budget" : "Apply Scenario to Plan"}
                </Button>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
