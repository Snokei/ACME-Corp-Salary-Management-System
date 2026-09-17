'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, ConfirmDialog } from '@/components/ui';
import { Plus, Download, Trash2, X, Users } from 'lucide-react';

import { EmployeeDetailDrawer } from './EmployeeDetailDrawer';
import { AddEmployeeModal } from './AddEmployeeModal';
import { useEmployeesContext } from '@/components/people/EmployeesProvider';
import { exportEmployeesToCSV } from '@/lib/employeeUtils';
import toast from 'react-hot-toast';
import { deleteEmployeesAction } from '@/actions/employees';
import { useRouter } from 'next/navigation';

export interface EmployeesViewProps {
  children: React.ReactNode;
  filtersNode?: React.ReactNode;
}

export function EmployeesView({
  children,
  filtersNode,
}: EmployeesViewProps) {
  const router = useRouter();
  const { modalState, setModalState, checkedIds, setCheckedIds, filteredEmployeesRef } = useEmployeesContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportCSV = () => {
    const toExport =
      checkedIds.size > 0
        ? filteredEmployeesRef.current.filter((e) => checkedIds.has(e.id))
        : filteredEmployeesRef.current;
    exportEmployeesToCSV(toExport);
    toast.success(`Exported ${toExport.length} employees to CSV`);
    setCheckedIds(new Set());
  };

  const handleExportSelectedCSV = () => {
    const selectedEmployees = filteredEmployeesRef.current.filter((e) => checkedIds.has(e.id));
    exportEmployeesToCSV(selectedEmployees, `ACME_Selected_Employees_${checkedIds.size}.csv`);
    toast.success(`Exported ${selectedEmployees.length} selected employees to CSV`);
    setCheckedIds(new Set());
  };

  const handleBulkDeleteClick = () => {
    if (checkedIds.size === 0) return;
    setShowDeleteConfirm(true);
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
        setShowDeleteConfirm(false);
        router.refresh();
        toast.success(`Successfully deleted ${count} employees`, { id: toastId });
      } else {
        toast.error(`Failed to delete employees: ${res.error}`, { id: toastId });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`An error occurred while deleting employees: ${message}`, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteCount = checkedIds.size;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="People"
        description="Manage organization members, compensation tiers, roles, and status."
        icon={Users}
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

      {filtersNode}

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

      {/* Server-rendered filters/table stay as children — modal is client-only */}
      {children}

      <EmployeeDetailDrawer
        employee={modalState.type === 'view' ? modalState.employee : null}
        onClose={() => setModalState({ type: null, employee: null })}
        onEdit={(emp) => setModalState({ type: 'edit', employee: emp })}
      />

      <AddEmployeeModal
        isOpen={modalState.type === 'add' || modalState.type === 'edit'}
        onClose={() => setModalState({ type: null, employee: null })}
        initialData={modalState.type === 'edit' ? modalState.employee : null}
        onSuccess={() => {
          toast.success(`Employee ${modalState.type === 'edit' ? 'updated' : 'added'} successfully!`);
          router.refresh();
        }}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Confirm Deletion"
        message={
          deleteCount === 1
            ? 'Are you sure you want to delete the selected employee? This action cannot be undone.'
            : `Are you sure you want to delete ${deleteCount} selected employees? This action cannot be undone.`
        }
        confirmLabel={deleteCount === 1 ? 'Delete Employee' : `Delete ${deleteCount} Employees`}
        isLoading={isDeleting}
        onConfirm={confirmBulkDelete}
        onClose={() => {
          if (!isDeleting) setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
}
