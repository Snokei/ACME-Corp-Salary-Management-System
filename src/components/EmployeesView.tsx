'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { EmployeeFilters } from '@/components/EmployeeFilters';
import { EmployeesTable } from '@/components/EmployeesTable';
import { EmployeeDetailModal } from '@/components/EmployeeDetailModal';
import { AddEmployeeModal } from '@/components/AddEmployeeModal';
import { Button } from '@/components/ui';
import { Download, Plus } from 'lucide-react';
import { Employee } from '@/types';
import {
  EMPLOYEE_STATUS_TABS,
  EmployeeStatusTab,
  CSV_EXPORT_HEADERS,
} from '@/constants';

export interface EmployeesViewProps {
  onSelectEmployee?: (employee: Employee) => void;
}

export function EmployeesView({ onSelectEmployee }: EmployeesViewProps) {
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get('tab');
  const initialDeptParam = searchParams.get('department');

  // State: Employee data & pagination
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // State: Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTab, setSelectedTab] = useState<EmployeeStatusTab>(() => {
    if (initialTabParam && (EMPLOYEE_STATUS_TABS as readonly string[]).includes(initialTabParam)) {
      return initialTabParam as EmployeeStatusTab;
    }
    return 'Active';
  });
  const [departmentFilter, setDepartmentFilter] = useState(initialDeptParam || 'All');

  // State: Selections & Highlights
  const [selectedRowId, setSelectedRowId] = useState<string>('2');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(['2']));

  // State: Modals
  const [activeEmployeeModal, setActiveEmployeeModal] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch employees from API
  const fetchEmployees = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      search,
      department: departmentFilter,
    });

    fetch(`/api/employees?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || (data.employees ? data.employees.length : 0));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch employees:', err);
        setLoading(false);
      });
  }, [page, search, departmentFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [page, departmentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTab('Active');
    setDepartmentFilter('All');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search.trim() !== '' || selectedTab !== 'Active' || departmentFilter !== 'All'
  );

  // Status Tab filtering (client-side refinement)
  const filteredEmployees = useMemo(() => {
    if (selectedTab === 'All') return employees;
    if (selectedTab === 'Active') return employees.filter((e) => e.status === 'Active' || !e.status);
    if (selectedTab === 'On Leave') return employees.filter((e) => e.status === 'On Leave');
    if (selectedTab === 'Contract') return employees.filter((e) => e.status === 'Contract' || e.status === 'Full Time');
    return employees;
  }, [employees, selectedTab]);

  // Selection toggles
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
      {/* Title & Page Header with Action Buttons inline */}
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

      {/* Reusable Filters Component (Status tabs, search bar & department dropdown inline) */}
      <EmployeeFilters
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        selectedTab={selectedTab}
        onTabChange={(tab) => {
          setSelectedTab(tab);
          setPage(1);
        }}
        department={departmentFilter}
        onDepartmentChange={(dept) => {
          setDepartmentFilter(dept);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Reusable Employees Table Component */}
      <EmployeesTable
        employees={filteredEmployees}
        loading={loading}
        selectedRowId={selectedRowId}
        checkedIds={checkedIds}
        onRowClick={handleRowClick}
        onToggleSelectAll={toggleSelectAll}
        onToggleRowCheck={toggleRowCheck}
        onViewDetails={handleViewDetails}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={activeEmployeeModal}
        onClose={() => setActiveEmployeeModal(null)}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchEmployees();
        }}
      />
    </div>
  );
}
