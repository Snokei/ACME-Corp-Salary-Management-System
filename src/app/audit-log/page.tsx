import { AuditLogDataFetcher } from "@/components/audit-log/AuditLogDataFetcher";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterSkeleton, TableSkeleton } from "@/components/ui";
import { ShieldAlert } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Audit Log | ACME HR",
  description:
    "Centralized audit logging and compliance history for ACME Salary Management System.",
};

interface AuditLogPageProps {
  searchParams?: {
    page?: string;
    search?: string;
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default function AuditLogPage({ searchParams }: AuditLogPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Centralized compliance and activity history for HR administrative operations."
        icon={ShieldAlert}
      ></PageHeader>

      <Suspense
        fallback={
          <div className="space-y-6">
            <FilterSkeleton />
            <TableSkeleton />
          </div>
        }
      >
        <AuditLogDataFetcher searchParams={searchParams || {}} />
      </Suspense>
    </div>
  );
}
