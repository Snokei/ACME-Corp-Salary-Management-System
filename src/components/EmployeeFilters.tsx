import React from 'react';
import { Button, Input, Select, PillTabs } from '@/components/ui';
import { Search, RotateCcw } from 'lucide-react';
import {
  EMPLOYEE_STATUS_TABS,
  EmployeeStatusTab,
  DEPARTMENTS,
} from '@/constants';

export interface EmployeeFiltersProps {
  // Search state
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;

  // Status tab state
  selectedTab: EmployeeStatusTab;
  onTabChange: (tab: EmployeeStatusTab) => void;

  // Department state
  department: string;
  onDepartmentChange: (dept: string) => void;

  // Action callbacks
  onResetFilters?: () => void;

  // State indicators
  hasActiveFilters?: boolean;
  className?: string;
}

export function EmployeeFilters({
  search,
  onSearchChange,
  onSearchSubmit,
  selectedTab,
  onTabChange,
  department,
  onDepartmentChange,
  onResetFilters,
  hasActiveFilters,
  className = '',
}: EmployeeFiltersProps) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(e);
    }
  };

  return (
    <div
      className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 ${className}`}
    >
      {/* Left side: Search field */}
      <div className="flex-1 max-w-md">
        <form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2 w-full"
        >
          <Input
            shape="pill"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, role, email..."
            leftIcon={<Search className="w-4 h-4 text-stone-400" />}
            containerClassName="w-full"
          />
          <Button type="submit" variant="primary" size="md" shape="pill">
            Search
          </Button>
        </form>
      </div>

      {/* Right side: Department dropdown together with Status tabs & Reset button */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        <div className="min-w-[140px]">
          <Select
            shape="pill"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            containerClassName="w-full"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Depts' : dept}
              </option>
            ))}
          </Select>
        </div>

        <PillTabs
          options={EMPLOYEE_STATUS_TABS}
          value={selectedTab}
          onChange={onTabChange}
          variant="amber"
          size="sm"
        />

        {hasActiveFilters && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            shape="pill"
            onClick={onResetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
