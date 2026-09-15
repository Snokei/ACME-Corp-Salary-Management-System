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
  Checkbox,
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

const VERIFIED_AVATAR_SEEDS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=120&h=120&q=80',
];

function getEmployeeAvatar(emp: Employee): string {
  // If employee has a valid avatar that is not a broken dynamic template
  if (emp.avatarUrl && emp.avatarUrl.startsWith('http') && !emp.avatarUrl.includes('photo-NaN')) {
    return emp.avatarUrl;
  }
  const key = `${emp.id || ''}${emp.firstName || ''}${emp.lastName || ''}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % VERIFIED_AVATAR_SEEDS.length;
  return VERIFIED_AVATAR_SEEDS[index];
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
            <TableHead className="w-12 text-center" align="center">
              <Checkbox
                checked={isAllChecked}
                onChange={() => onToggleSelectAll && onToggleSelectAll()}
                ariaLabel="Select all employees"
                size="sm"
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
              const avatar = getEmployeeAvatar(emp);
              const fallbackAvatar = `https://ui-avatars.com/api/?background=f5c242&color=18181b&bold=true&name=${encodeURIComponent(
                emp.firstName + ' ' + emp.lastName
              )}`;

              return (
                <TableRow
                  key={emp.id}
                  selected={isHighlighted}
                  clickable={Boolean(onRowClick)}
                  onClick={() => onRowClick && onRowClick(emp)}
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
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== fallbackAvatar) {
                            target.src = fallbackAvatar;
                          }
                        }}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/40 group-hover:ring-amber-400 transition-all duration-200 shrink-0 bg-stone-100 dark:bg-stone-800"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
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
                      className="hover:bg-amber-300/40 dark:hover:bg-amber-500/20 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
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
