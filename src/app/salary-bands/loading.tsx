import { FilterSkeleton, TableSkeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { Banknote } from "lucide-react";

export default function SalaryBandsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Salary Bands"
        description="Manage compensation structures, pay grade salary ranges, and midpoint targets."
        icon={Banknote}
      />
      <FilterSkeleton />
      <TableSkeleton />
    </div>
  );
}
