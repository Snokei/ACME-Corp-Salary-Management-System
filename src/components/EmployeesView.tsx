'use client';

import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { EmployeeFilters } from '@/components/EmployeeFilters';
import { EmployeesTable } from '@/components/EmployeesTable';
import { EmployeeDetailModal } from '@/components/EmployeeDetailModal';
import { AddEmployeeModal } from '@/components/AddEmployeeModal';
import { Button } from '@/components/ui';
import { Download, Plus, Trash2, X } from 'lucide-react';
import { Employee } from '@/types';
import { EmployeeStatusTab } from '@/constants';
import { EmployeesResponseData } from '@/lib/employeeData';
import {
  exportEmployeesToCSV,
  buildPaginationUrl,
} from '@/lib/employeeUtils';
import { deleteEmployeesAction } from '@/actions/employees';
import { showConfirmDeleteToast } from '@/lib/toastUtils';

export interface EmployeesViewProps {
  data: EmployeesResponseData;
  uniqueRoles: string[];
  uniqueLocations: string[];
  searchParams?: {
    search?: string;
    department?: string;
    role?: string;
    location?: string;
    tab?: string;
    page?: string;
  };
  onSelectEmployee?: (employee: Employee) => void;
}

export function EmployeesView({
  data,
  uniqueRoles,
  uniqueLocations,
  searchParams = {},
  onSelectEmployee,
}: EmployeesViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  const { employees, total, page, totalPages } = data;
  const currentSearch = searchParams.search || nextSearchParams.get('search') || '';
  const currentDept = searchParams.department || nextSearchParams.get('department') || 'All';
  const currentRole = searchParams.role || nextSearchParams.get('role') || 'All';
  const currentLocation = searchParams.location || nextSearchParams.get('location') || 'All';
  const currentTab = (searchParams.tab || nextSearchParams.get('tab') || 'Active') as EmployeeStatusTab;

  // Client-only UI States (Modals, Selection and Row Highlight)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit' | 'view' | null; employee: Employee | null }>({ type: null, employee: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredEmployees = employees;

  // Page navigation via URL searchParams
  const handlePageChange = (newPage: number) => {
    const targetUrl = buildPaginationUrl(pathname, nextSearchParams, newPage);
    router.push(targetUrl, { scroll: false });
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

  const handleViewDetails = (employee: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    // Instead of opening EmployeeDetailModal on Edit, open AddEmployeeModal in edit mode
    setModalState({ type: 'edit', employee });
  };

  // CSV Export handlers
  const handleExportCSV = () => {
    const toExport =
      checkedIds.size > 0
        ? filteredEmployees.filter((e) => checkedIds.has(e.id))
        : filteredEmployees;
    exportEmployeesToCSV(toExport);
    toast.success(`Exported ${toExport.length} employees to CSV`);
    setCheckedIds(new Set());
  };

  const handleExportSelectedCSV = () => {
    const selectedEmployees = filteredEmployees.filter((e) => checkedIds.has(e.id));
    exportEmployeesToCSV(selectedEmployees, `ACME_Selected_Employees_${checkedIds.size}.csv`);
    toast.success(`Exported ${selectedEmployees.length} selected employees to CSV`);
    setCheckedIds(new Set());
  };

  // Bulk Delete handler
  const handleBulkDeleteClick = () => {
    if (checkedIds.size === 0) return;
    
    showConfirmDeleteToast({
      message: (
        <>
          Are you sure you want to delete <strong className="text-stone-900 dark:text-white">{checkedIds.size}</strong> selected employee(s)? This action cannot be undone.
        </>
      ),
      onConfirm: confirmBulkDelete,
    });
  };

  const confirmBulkDelete = async () => {
    if (checkedIds.size === 0) return;
    setIsDeleting(true);
    const count = checkedIds.size;
    const toastId = toast.loading('Deleting employees...');
    
    try {
      const idsToDelete = Array.from(checkedIds);
      const res = await deleteEmployeesAction(idsToDelete);
      if (res.success) {
        setCheckedIds(new Set());
        router.refresh();
        toast.success(`Successfully deleted ${count} employees`, { id: toastId });
      } else {
        toast.error(`Failed to delete employees: ${res.error}`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(`An error occurred while deleting employees: ${err.message}`, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
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
          onClick={handleExportCSV}
        >
          {checkedIds.size > 0 ? `Export Selected (${checkedIds.size})` : 'Export CSV'}
        </Button>
        <Button
          variant="primary"
          shape="pill"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setModalState({ type: 'add', employee: null })}
        >
          Add Employee
        </Button>
      </PageHeader>

      {/* Server Action Filter Form - No Local State */}
      <EmployeeFilters
        search={currentSearch}
        selectedTab={currentTab}
        department={currentDept}
        role={currentRole}
        location={currentLocation}
        uniqueRoles={uniqueRoles}
        uniqueLocations={uniqueLocations}
      />

      {/* Bulk Selection Actions Toolbar */}
      {checkedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5 font-medium text-xs sm:text-sm">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-stone-950 text-xs font-bold shadow-xs">
              {checkedIds.size}
            </span>
            <span>
              {checkedIds.size === 1
                ? '1 employee selected'
                : `${checkedIds.size} employees selected`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              shape="pill"
              leftIcon={<Download className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />}
              onClick={handleExportSelectedCSV}
            >
              Export Selected ({checkedIds.size})
            </Button>

            <Button
              variant="danger"
              size="sm"
              shape="pill"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleBulkDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : `Delete Selected (${checkedIds.size})`}
            </Button>

            <button
              type="button"
              onClick={() => setCheckedIds(new Set())}
              className="p-1.5 rounded-full hover:bg-amber-500/20 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors ml-1"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Server-Rendered Employees Table */}
      <EmployeesTable
        employees={filteredEmployees}
        loading={false}
        checkedIds={checkedIds}
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
        employee={modalState.type === 'view' ? modalState.employee : null}
        onClose={() => setModalState({ type: null, employee: null })}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={modalState.type === 'add' || modalState.type === 'edit'}
        onClose={() => setModalState({ type: null, employee: null })}
        initialData={modalState.type === 'edit' ? modalState.employee : null}
        onSuccess={() => {
          toast.success(`Employee ${modalState.type === 'edit' ? 'updated' : 'added'} successfully!`);
          router.refresh();
        }}
      />
    </div>
  );
}
