import { TableSkeleton } from "@/components/ui";
import { FilterSkeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { Users } from "lucide-react";

export default function PeopleLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="People" 
        description="Manage organization members, compensation tiers, roles, and status."
        icon={Users}
      />
      
      {/* Search & Filter Bar Skeleton */}
      <FilterSkeleton />
      
      {/* Table Skeleton */}
      <TableSkeleton />
    </div>
  );
}
