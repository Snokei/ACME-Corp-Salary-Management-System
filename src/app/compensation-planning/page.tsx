import { Suspense } from "react";
import { MetricsSkeleton, TableSkeleton } from "@/components/ui";
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
            <div className="space-y-6">
              <MetricsSkeleton count={6} />
              <TableSkeleton />
            </div>
          }
        >
          <PlanningDataFetcher />
        </Suspense>
      </div>
    </PlanningProvider>
  );
}
