import { PageHeader } from "@/components/layout/PageHeader";
import {
  FilterSkeleton,
  MetricsSkeleton,
  TableSkeleton,
  AnalyticsChartsSkeleton
} from "@/components/ui";
import { BarChart3 } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Compensation Analytics"
        description="HR Manager Dashboard & Deep-Dive Compensation Insights"
        icon={BarChart3}
      />
      <FilterSkeleton />
      <MetricsSkeleton count={5} />
      <AnalyticsChartsSkeleton />
      <TableSkeleton />
    </div>
  );
}
