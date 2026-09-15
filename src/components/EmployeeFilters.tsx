'use client';

import React from 'react';
import { Button, Input, Select } from '@/components/ui';
import { Search, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import {
  EMPLOYEE_STATUS_TABS,
  EmployeeStatusTab,
  DEPARTMENTS,
} from '@/constants';
import { filterEmployeesAction } from '@/actions/employees';

export interface EmployeeFiltersProps {
  search?: string;
  selectedTab?: EmployeeStatusTab;
  department?: string;
  className?: string;
}

export function EmployeeFilters({
  search = '',
  selectedTab = 'Active',
  department = 'All',
  className = '',
}: EmployeeFiltersProps) {
  const hasActiveFilters = Boolean(
    search.trim() !== '' || (selectedTab !== 'Active' && selectedTab !== 'All') || department !== 'All'
  );

  return (
    <form
      action={filterEmployeesAction}
      className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 ${className}`}
    >
      {/* Left side: Search field */}
      <div className="flex-1 max-w-md flex items-center gap-2">
        <Input
          name="search"
          shape="pill"
          defaultValue={search}
          placeholder="Search by name, role, email..."
          leftIcon={<Search className="w-4 h-4 text-stone-400" />}
          containerClassName="w-full"
        />
        <Button type="submit" variant="primary" size="md" shape="pill">
          Search
        </Button>
      </div>

      {/* Right side: Department dropdown, Status tabs, Reset */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        <div className="min-w-[140px]">
          <Select
            name="department"
            shape="pill"
            defaultValue={department}
            onChange={(e) => e.target.form?.requestSubmit()}
            containerClassName="w-full"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Depts' : dept}
              </option>
            ))}
          </Select>
        </div>

        {/* Status Tabs as Submit Buttons */}
        <div className="inline-flex p-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60">
          {EMPLOYEE_STATUS_TABS.map((tab) => {
            const isSelected = selectedTab === tab;
            return (
              <button
                key={tab}
                type="submit"
                name="tab"
                value={tab}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <Link href="/people">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              shape="pill"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            >
              Reset
            </Button>
          </Link>
        )}
      </div>
    </form>
  );
}
