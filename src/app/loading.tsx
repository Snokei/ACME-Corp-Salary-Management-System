import { MetricsSkeleton, AnalyticsChartsSkeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { LayoutDashboard } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title={
          <div className="flex items-center">
            <span className="mr-2">Hello</span>
            <div className="w-32 h-8 bg-stone-200/50 dark:bg-stone-700/50 animate-pulse rounded-lg ml-1" />
          </div>
        }
        description="Compensation insights, attendance tracking, and scheduled talent reviews."
        icon={LayoutDashboard}
      />
      <MetricsSkeleton count={4} />
      <AnalyticsChartsSkeleton />
    </div>
  );
}
