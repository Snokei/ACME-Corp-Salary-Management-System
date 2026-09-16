import { EmployeeFiltersServer } from "@/components/people/EmployeeFiltersServer";
import { FilterSkeleton, TableSkeleton } from "@/components/ui";
import { EmployeesDataFetcher } from "@/components/people/EmployeesDataFetcher";
import { EmployeesProvider } from "@/components/people/EmployeesProvider";
import { EmployeesView } from "@/components/people/EmployeesView";
import { Suspense } from "react";

export const metadata = {
  title: "People - ACME Salary Management System",
  description: "View and manage employee directory.",
};

interface PeoplePageProps {
  searchParams?: {
    search?: string;
    department?: string;
    role?: string;
    location?: string;
    status?: string;
    tab?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
}

export default function PeoplePage({ searchParams }: PeoplePageProps) {
  return (
    <EmployeesProvider>
      <EmployeesView
        filtersNode={
          <Suspense fallback={<FilterSkeleton />}>
            <EmployeeFiltersServer searchParams={searchParams || {}} />
          </Suspense>
        }
      >
        <Suspense fallback={<TableSkeleton />}>
          <EmployeesDataFetcher searchParams={searchParams || {}} />
        </Suspense>
      </EmployeesView>
    </EmployeesProvider>
  );
}
