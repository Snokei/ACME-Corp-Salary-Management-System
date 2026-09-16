import { FilterSkeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
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
      <div className="w-full h-[600px] rounded-3xl border border-stone-200/50 dark:border-stone-800/50 bg-white/50 dark:bg-stone-900/50 animate-pulse" />
    </div>
  );
}
