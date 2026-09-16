import { Suspense } from "react";
import { PlanningDataFetcher } from "@/components/planning/PlanningDataFetcher";
import { PlanningHeader } from "@/components/planning/PlanningHeader";
import { PlanningProvider } from "@/components/planning/PlanningProvider";

export const metadata = {
  title: "Planning & Budget - ACME Salary Management System",
  description: "Annual fiscal budget planning, department allocations, and salary increase workflows.",
};

export const revalidate = 0;

export default function CompensationPlanningPage() {
  return (
    <PlanningProvider>
      <div className="space-y-6">
        <PlanningHeader />
        
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px] bg-white/50 dark:bg-stone-900/50 rounded-3xl border border-stone-200/50 dark:border-stone-800/50">
              <div className="flex items-center gap-3 text-stone-500 text-sm">
                <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
                <span>Loading Compensation Plans...</span>
              </div>
            </div>
          }
        >
          <PlanningDataFetcher />
        </Suspense>
      </div>
    </PlanningProvider>
  );
}
