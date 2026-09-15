'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { EmployeeFilters } from '@/components/EmployeeFilters';
import { EmployeesTable } from '@/components/EmployeesTable';
import { EmployeeDetailModal } from '@/components/EmployeeDetailModal';
import { AddEmployeeModal } from '@/components/AddEmployeeModal';
import { Button } from '@/components/ui';
import { Download, Plus } from 'lucide-react';
import { Employee } from '@/types';
import { CSV_EXPORT_HEADERS, EmployeeStatusTab } from '@/constants';
import { EmployeesResponseData } from '@/lib/employeeData';

export interface EmployeesViewProps {
  data: EmployeesResponseData;
  searchParams?: {
    search?: string;
    department?: string;
    tab?: string;
    page?: string;
  };
  onSelectEmployee?: (employee: Employee) => void;
}

export function EmployeesView({
  data,
  searchParams = {},
  onSelectEmployee,
}: EmployeesViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  const { employees, total, page, totalPages } = data;
  const currentSearch = searchParams.search || nextSearchParams.get('search') || '';
  const currentDept = searchParams.department || nextSearchParams.get('department') || 'All';
  const currentTab = (searchParams.tab || nextSearchParams.get('tab') || 'Active') as EmployeeStatusTab;

  // Client-only UI States (Modals and Table Row Highlight)
  const [selectedRowId, setSelectedRowId] = useState<string>('2');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(['2']));
  const [activeEmployeeModal, setActiveEmployeeModal] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Status Tab filtering (client-side refinement if needed)
  const filteredEmployees = React.useMemo(() => {
    if (currentTab === 'All') return employees;
    if (currentTab === 'Active') return employees.filter((e) => e.status === 'Active' || !e.status);
    if (currentTab === 'On Leave') return employees.filter((e) => e.status === 'On Leave');
    if (currentTab === 'Contract') return employees.filter((e) => e.status === 'Contract' || e.status === 'Full Time');
    return employees;
  }, [employees, currentTab]);

  // Page navigation via URL searchParams (triggers Server Component SSR re-render)
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(nextSearchParams.toString());
    if (newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Checkbox toggles
  const toggleSelectAll = () => {
    if (checkedIds.size === filteredEmployees.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filteredEmployees.map((e) => e.id)));
    }
  };

  const toggleRowCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIds(next);
  };

  const handleRowClick = (emp: Employee) => {
    setSelectedRowId(emp.id);
    setActiveEmployeeModal(emp);
    if (onSelectEmployee) {
      onSelectEmployee(emp);
    }
  };

  const handleViewDetails = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveEmployeeModal(emp);
  };

  // CSV Export
  const exportCSV = () => {
    const headers = [...CSV_EXPORT_HEADERS];
    const rows = filteredEmployees.map((e) => [
      e.employeeId,
      `"${e.firstName} ${e.lastName}"`,
      e.email,
      e.department,
      `"${e.role}"`,
      `"${e.country}"`,
      e.baseSalaryUSD ?? e.baseSalary ?? 0,
      e.status || 'Active',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ACME_Employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Page Header with Action Buttons */}
      <PageHeader
        title="People"
        description="Manage organization members, compensation tiers, roles, and status."
      >
        <Button
          variant="secondary"
          size="sm"
          shape="pill"
          leftIcon={<Download className="w-3.5 h-3.5 text-stone-500" />}
          onClick={exportCSV}
        >
          Export CSV
        </Button>
        <Button
          variant="amber"
          size="sm"
          shape="pill"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Employee
        </Button>
      </PageHeader>

      {/* Server Action Filter Form - No Local State */}
      <EmployeeFilters
        search={currentSearch}
        department={currentDept}
        selectedTab={currentTab}
      />

      {/* Server-Rendered Employees Table */}
      <EmployeesTable
        employees={filteredEmployees}
        loading={false}
        selectedRowId={selectedRowId}
        checkedIds={checkedIds}
        onRowClick={handleRowClick}
        onToggleSelectAll={toggleSelectAll}
        onToggleRowCheck={toggleRowCheck}
        onViewDetails={handleViewDetails}
        page={page}
        totalPages={totalPages}
        totalCount={total}
        pageSize={10}
        onPageChange={handlePageChange}
      />

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={activeEmployeeModal}
        onClose={() => setActiveEmployeeModal(null)}
      />

      {/* Add Employee Modal (Invokes createEmployeeAction Server Action) */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
