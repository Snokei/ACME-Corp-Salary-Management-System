import { MetricsSkeleton, AnalyticsChartsSkeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { LayoutDashboard } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Dashboard" 
        description="Overview of HR and compensation metrics."
        icon={LayoutDashboard}
      />
      <MetricsSkeleton count={4} />
      <AnalyticsChartsSkeleton />
    </div>
  );
}
