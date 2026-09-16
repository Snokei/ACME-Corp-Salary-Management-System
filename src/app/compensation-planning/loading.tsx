import { MetricsSkeleton, TableSkeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { Briefcase } from "lucide-react";

export default function PlanningLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Planning & Budget" 
        description="Create fiscal year budgets, allocate compensation pools across departments, plan employee salary increases, and model scenarios."
        icon={Briefcase}
      />
      <MetricsSkeleton count={6} />
      <TableSkeleton />
    </div>
  );
}
