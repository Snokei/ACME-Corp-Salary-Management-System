import React from 'react';
import Link from 'next/link';
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
} from '@/components/ui';
import { MapPin, Edit2, Users, Eye } from 'lucide-react';

export interface EmployeesTableProps {
  employees: Employee[];
  loading?: boolean;
  checkedIds?: Set<string>;
  onToggleSelectAll?: () => void;
  onToggleRowCheck?: (id: string, e: React.MouseEvent) => void;
  onViewDetails?: (employee: Employee, e: React.MouseEvent) => void;
  onEditDetails?: (employee: Employee, e: React.MouseEvent) => void;

  // Pagination props
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (page: number) => void;

  // Sorting props
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;

  className?: string;
}

import { getEmployeeAvatar, formatDateSafe, formatSalaryUSD } from '@/lib/employeeUtils';

export function EmployeesTable({
  employees,
  loading = false,
  checkedIds = new Set(),
  onToggleSelectAll,
  onToggleRowCheck,
  onViewDetails,
  onEditDetails,
  page,
  totalPages,
  totalCount,
  pageSize = 10,
  onPageChange,
  sortBy = '',
  sortOrder = 'desc',
  onSort,
  className = '',
}: EmployeesTableProps) {
  const isAllChecked =
    employees.length > 0 && checkedIds.size === employees.length;

  return (
    <TableContainer className={`relative z-10 ${className}`}>
      <Table>
        <TableHeader>
          <tr>
            <TableHead className="w-12 text-center" align="center">
              <Checkbox
                checked={isAllChecked}
                onChange={() => onToggleSelectAll && onToggleSelectAll()}
                ariaLabel="Select all employees"
                size="sm"
              />
            </TableHead>
            <TableHead
              sortable
              sorted={sortBy === 'name' ? sortOrder : false}
              onSort={() => onSort && onSort('name')}
            >
              Name
            </TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Location</TableHead>
            <TableHead
              sortable
              sorted={sortBy === 'salary' ? sortOrder : false}
              onSort={() => onSort && onSort('salary')}
            >
              Salary
            </TableHead>
            <TableHead
              sortable
              sorted={sortBy === 'hireDate' ? sortOrder : false}
              onSort={() => onSort && onSort('hireDate')}
            >
              Date Joined
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="center">Action</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableLoading colSpan={9} message="Loading employee directory..." />
          ) : employees.length === 0 ? (
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
                <TableRow
                  key={emp.id}
                  className="group"
                >
                  {/* Row Checkbox with custom small yellow check tick */}
                  <TableCell
                    align="center"
                    onClick={(e) => {
                      if (onToggleRowCheck) {
                        e.stopPropagation();
                        onToggleRowCheck(emp.id, e);
                      }
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={(_, e) => {
                        if (onToggleRowCheck) {
                          onToggleRowCheck(emp.id, e);
                        }
                      }}
                      ariaLabel={`Select ${emp.firstName} ${emp.lastName}`}
                      size="sm"
                    />
                  </TableCell>

                  {/* Name & Avatar with Amber Accent Ring + resilient fallback */}
                  <TableCell>
                    <Link
                      href={`/people/${encodeURIComponent(emp.employeeId || emp.id)}`}
                      className="flex items-center gap-3 group/link cursor-pointer"
                    >
                      <img
                        src={avatar}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== fallbackAvatar) {
                            target.src = fallbackAvatar;
                          }
                        }}
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

                  {/* Job Title */}
                  <TableCell className="text-stone-700 dark:text-stone-300 font-medium">
                    {emp.role}
                  </TableCell>

                  {/* Department */}
                  <TableCell>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium whitespace-nowrap group-hover:bg-amber-100/70 dark:group-hover:bg-amber-950/40 transition-colors">
                      {emp.department}
                    </span>
                  </TableCell>

                  {/* Location */}
                  <TableCell className="text-stone-600 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 group-hover:text-amber-500 transition-colors" />
                      {emp.city ? `${emp.city}, ${emp.country}` : emp.country}
                    </span>
                  </TableCell>

                  {/* Salary */}
                  <TableCell className="font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                    ${(emp.baseSalaryUSD ?? emp.baseSalary ?? 0).toLocaleString('en-US')}{' '}
                    <span className="text-[10px] font-normal text-stone-400">USD</span>
                  </TableCell>

                  {/* Date Joined */}
                  <TableCell className="text-stone-500 dark:text-stone-400 text-[11px] whitespace-nowrap">
                    {formatDateSafe(emp.hireDate)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={emp.status || 'Active'} />
                  </TableCell>

                  {/* Actions */}
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
                          if (onViewDetails) {
                            onViewDetails(emp, e);
                          }
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
                          if (onEditDetails) {
                            onEditDetails(emp, e);
                          }
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
