import { FilterSkeleton, TableSkeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { ShieldAlert } from "lucide-react";

export default function AuditLogLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Audit Log" 
        description="Centralized compliance and activity history for HR administrative operations."
        icon={ShieldAlert}
      />
      <FilterSkeleton />
      <TableSkeleton />
    </div>
  );
}
