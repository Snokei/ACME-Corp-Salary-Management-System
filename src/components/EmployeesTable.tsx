import React from 'react';
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
} from '@/components/ui';
import { MapPin, MoreVertical, Users } from 'lucide-react';

export interface EmployeesTableProps {
  employees: Employee[];
  loading?: boolean;
  selectedRowId?: string;
  checkedIds?: Set<string>;
  onRowClick?: (employee: Employee) => void;
  onToggleSelectAll?: () => void;
  onToggleRowCheck?: (id: string, e: React.MouseEvent) => void;
  onViewDetails?: (employee: Employee, e: React.MouseEvent) => void;

  // Pagination props
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (page: number) => void;

  className?: string;
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return '—';
  if (typeof date === 'string') {
    return date.substring(0, 10);
  }
  try {
    return date.toISOString().substring(0, 10);
  } catch {
    return String(date);
  }
}

export function EmployeesTable({
  employees,
  loading = false,
  selectedRowId,
  checkedIds = new Set(),
  onRowClick,
  onToggleSelectAll,
  onToggleRowCheck,
  onViewDetails,
  page,
  totalPages,
  totalCount,
  pageSize = 10,
  onPageChange,
  className = '',
}: EmployeesTableProps) {
  const isAllChecked =
    employees.length > 0 && checkedIds.size === employees.length;

  return (
    <TableContainer className={className}>
      <Table>
        <TableHeader>
          <tr>
            <TableHead className="w-10 text-center" align="center">
              <input
                type="checkbox"
                aria-label="Select all employees"
                checked={isAllChecked}
                onChange={onToggleSelectAll}
                className="rounded border-stone-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Date Joined</TableHead>
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
              const isHighlighted = selectedRowId === emp.id;
              const isChecked = checkedIds.has(emp.id);

              return (
                <TableRow
                  key={emp.id}
                  selected={isHighlighted}
                  clickable={Boolean(onRowClick)}
                  onClick={() => onRowClick && onRowClick(emp)}
                >
                  {/* Row Checkbox */}
                  <TableCell
                    align="center"
                    onClick={(e) => {
                      if (onToggleRowCheck) {
                        e.stopPropagation();
                        onToggleRowCheck(emp.id, e);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${emp.firstName} ${emp.lastName}`}
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-stone-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                  </TableCell>

                  {/* Name & Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          emp.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'
                        }
                        alt={`${emp.firstName} ${emp.lastName}`}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          {emp.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Job Title */}
                  <TableCell className="text-stone-700 dark:text-stone-300 font-medium">
                    {emp.role}
                  </TableCell>

                  {/* Department */}
                  <TableCell>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium whitespace-nowrap">
                      {emp.department}
                    </span>
                  </TableCell>

                  {/* Location */}
                  <TableCell className="text-stone-600 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {emp.city ? `${emp.city}, ${emp.country}` : emp.country}
                    </span>
                  </TableCell>

                  {/* Salary */}
                  <TableCell className="font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                    ${(emp.baseSalaryUSD ?? emp.baseSalary ?? 0).toLocaleString()}{' '}
                    <span className="text-[10px] font-normal text-stone-400">USD</span>
                  </TableCell>

                  {/* Date Joined */}
                  <TableCell className="text-stone-500 dark:text-stone-400 text-[11px] whitespace-nowrap">
                    {formatDate(emp.hireDate)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={emp.status || 'Active'} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <Button
                      variant="ghost"
                      shape="circle"
                      size="sm"
                      aria-label={`Options for ${emp.firstName}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewDetails) {
                          onViewDetails(emp, e);
                        }
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
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
