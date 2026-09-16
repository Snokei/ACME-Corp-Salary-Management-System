'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Employee } from '@/types';
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableLoading,
  TableEmpty,
  TablePagination,
  StatusBadge,
  Button,
  Checkbox,
  Avatar,
} from '@/components/ui';
import { MapPin, Edit2, Users, Eye } from 'lucide-react';
import { getEmployeeAvatar, formatDateSafe } from '@/lib/employeeUtils';
import { useEmployeesContext } from '@/components/people/EmployeesProvider';

export interface EmployeesTableProps {
  employees: Employee[];
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
}

export function EmployeesTable({
  employees,
  page,
  totalPages,
  totalCount,
  pageSize = 10,
}: EmployeesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();
  const { checkedIds, setCheckedIds, setModalState, filteredEmployeesRef } = useEmployeesContext();

  // Keep ref up to date for CSV exports
  useEffect(() => {
    filteredEmployeesRef.current = employees;
  }, [employees, filteredEmployeesRef]);

  const sortBy = nextSearchParams.get('sortBy') || '';
  const sortOrder = (nextSearchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const onSort = (field: string) => {
    const params = new URLSearchParams(nextSearchParams.toString());
    if (sortBy === field) {
      if (sortOrder === 'asc') {
        params.set('sortOrder', 'desc');
      } else {
        params.delete('sortBy');
        params.delete('sortOrder');
      }
    } else {
      params.set('sortBy', field);
      params.set('sortOrder', 'asc');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onPageChange = (newPage: number) => {
    const params = new URLSearchParams(nextSearchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const onToggleSelectAll = () => {
    if (checkedIds.size === employees.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(employees.map((e) => e.id)));
    }
  };

  const onToggleRowCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIds(next);
  };

  const isAllChecked = employees.length > 0 && checkedIds.size === employees.length;

  return (
    <TableContainer className="relative z-10">
      <Table>
        <TableHeader>
          <tr>
            <TableHead className="w-12 text-center" align="center">
              <Checkbox
                checked={isAllChecked}
                onChange={onToggleSelectAll}
                ariaLabel="Select all employees"
                size="sm"
              />
            </TableHead>
            <TableHead
              sortable
              sorted={sortBy === 'name' ? sortOrder : false}
              onSort={() => onSort('name')}
            >
              Name
            </TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Location</TableHead>
            <TableHead
              sortable
              sorted={sortBy === 'salary' ? sortOrder : false}
              onSort={() => onSort('salary')}
            >
              Salary
            </TableHead>
            <TableHead
              sortable
              sorted={sortBy === 'hireDate' ? sortOrder : false}
              onSort={() => onSort('hireDate')}
            >
              Date Joined
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="center">Action</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {employees.length === 0 ? (
            <TableEmpty
              colSpan={9}
              icon={<Users className="w-8 h-8 text-stone-300 dark:text-stone-600 mb-1" />}
              title="No employees found"
              description="Try changing your filters or searching with another keyword."
            />
          ) : (
            employees.map((emp) => {
              const isChecked = checkedIds.has(emp.id);
              const avatar = getEmployeeAvatar(emp);
              const fallbackAvatar = `https://ui-avatars.com/api/?background=f5c242&color=18181b&bold=true&name=${encodeURIComponent(
                emp.firstName + ' ' + emp.lastName
              )}`;

              return (
                <TableRow key={emp.id} className="group">
                  <TableCell align="center" onClick={(e) => onToggleRowCheck(emp.id, e)}>
                    <Checkbox
                      checked={isChecked}
                      onChange={(_, e) => onToggleRowCheck(emp.id, e)}
                      ariaLabel={`Select ${emp.firstName} ${emp.lastName}`}
                      size="sm"
                    />
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/people/${encodeURIComponent(emp.employeeId || emp.id)}`}
                      className="flex items-center gap-3 group/link cursor-pointer"
                    >
                      <Avatar
                        src={avatar}
                        fallbackSrc={fallbackAvatar}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        size={32}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/40 group-hover/link:ring-amber-400 transition-all duration-200 shrink-0 bg-stone-100 dark:bg-stone-800"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 truncate group-hover/link:text-amber-600 dark:group-hover/link:text-amber-400 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          {emp.email}
                        </div>
                      </div>
                    </Link>
                  </TableCell>

                  <TableCell className="text-stone-700 dark:text-stone-300 font-medium">
                    {emp.role}
                  </TableCell>

                  <TableCell>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium whitespace-nowrap group-hover:bg-amber-100/70 dark:group-hover:bg-amber-950/40 transition-colors">
                      {emp.department}
                    </span>
                  </TableCell>

                  <TableCell className="text-stone-600 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 group-hover:text-amber-500 transition-colors" />
                      {emp.city ? `${emp.city}, ${emp.country}` : emp.country}
                    </span>
                  </TableCell>

                  <TableCell className="font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                    ${(emp.baseSalaryUSD ?? emp.baseSalary ?? 0).toLocaleString('en-US')}{' '}
                    <span className="text-[10px] font-normal text-stone-400">USD</span>
                  </TableCell>

                  <TableCell className="text-stone-500 dark:text-stone-400 text-[11px] whitespace-nowrap">
                    {formatDateSafe(emp.hireDate)}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={emp.status || 'Active'} />
                  </TableCell>

                  <TableCell align="center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        shape="circle"
                        size="sm"
                        title="View Profile"
                        aria-label={`View ${emp.firstName}`}
                        className="hover:bg-amber-300/40 dark:hover:bg-amber-500/20 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/people/${encodeURIComponent(emp.employeeId || emp.id)}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        shape="circle"
                        size="sm"
                        title="Edit Details"
                        aria-label={`Edit ${emp.firstName}`}
                        className="hover:bg-amber-300/40 dark:hover:bg-amber-500/20 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalState({ type: 'edit', employee: emp });
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        itemLabel="employees"
      />
    </TableContainer>
  );
}
