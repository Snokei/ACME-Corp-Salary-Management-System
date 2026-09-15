'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Employee } from '@/types';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Check,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  X,
  Sparkles,
} from 'lucide-react';

interface EmployeesViewProps {
  onSelectEmployee?: (employee: Employee) => void;
}

export function EmployeesView({ onSelectEmployee }: EmployeesViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'All' | 'Active' | 'On Leave' | 'Contract'>('Active');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedRowId, setSelectedRowId] = useState<string>('2'); // Default selected row highlighted in yellow as in screenshot
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(['2']));
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Drawer / Modal state
  const [activeEmployeeModal, setActiveEmployeeModal] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'Engineering',
    role: 'Software Engineer',
    country: 'United States',
    city: 'San Francisco',
    baseSalary: '135000',
    payGrade: 'L4',
  });

  const departments = ['All', 'Engineering', 'Product', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Legal', 'Operations'];

  const fetchEmployees = () => {
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
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, departmentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const filteredEmployees = useMemo(() => {
    if (selectedTab === 'All') return employees;
    if (selectedTab === 'Active') return employees.filter((e) => e.status === 'Active' || !e.status);
    if (selectedTab === 'On Leave') return employees.filter((e) => e.status === 'On Leave');
    if (selectedTab === 'Contract') return employees.filter((e) => e.status === 'Contract' || e.status === 'Full Time');
    return employees;
  }, [employees, selectedTab]);

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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployeeForm),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        fetchEmployees();
        setNewEmployeeForm({
          firstName: '',
          lastName: '',
          email: '',
          department: 'Engineering',
          role: 'Software Engineer',
          country: 'United States',
          city: 'San Francisco',
          baseSalary: '135000',
          payGrade: 'L4',
        });
      }
    } catch (err) {
      console.error('Error adding employee:', err);
    }
  };

  const exportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Country', 'Salary USD', 'Status'];
    const rows = filteredEmployees.map((e) => [
      e.employeeId,
      `${e.firstName} ${e.lastName}`,
      e.email,
      e.department,
      e.role,
      e.country,
      e.baseSalaryUSD,
      e.status || 'Active',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ACME_Employees.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">
            People
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Manage organization members, salary tiers, roles, and status.
          </p>
        </div>

        {/* Tab Filter Pills (All, Active, On Leave, Contract) */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-200/70 dark:border-stone-800 shadow-sm">
          {(['All', 'Active', 'On Leave', 'Contract'] as const).map((tab) => {
            const isTabActive = selectedTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-1 rounded-full text-xs font-medium transition-all ${
                  isTabActive
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Filter Drops, and Action Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, email..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400/50 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-stone-900 text-white dark:bg-white dark:text-stone-900 text-xs font-medium shadow-sm hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>

        {/* Filter dropdowns & buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-full bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 outline-none cursor-pointer shadow-sm"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                Dept: {dept}
              </option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" /> Export CSV
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950 text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Add Employee
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/90 dark:bg-stone-900/90 rounded-3xl border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-stone-400 uppercase tracking-wider bg-stone-50/50 dark:bg-stone-900/50">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={checkedIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-stone-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Job Title</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Salary</th>
                <th className="py-3.5 px-4">Date Joined</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent"></div>
                    <p className="mt-2 text-xs">Loading employee directory...</p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    No employees found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isHighlighted = selectedRowId === emp.id;
                  const isChecked = checkedIds.has(emp.id);

                  return (
                    <tr
                      key={emp.id}
                      onClick={() => {
                        setSelectedRowId(emp.id);
                        setActiveEmployeeModal(emp);
                      }}
                      className={`transition-all duration-150 cursor-pointer ${
                        isHighlighted
                          ? 'bg-amber-300/40 dark:bg-amber-500/20 font-medium'
                          : 'hover:bg-stone-50/80 dark:hover:bg-stone-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => toggleRowCheck(emp.id, e)}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-stone-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              emp.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80'
                            }
                            alt={emp.firstName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                          />
                          <div>
                            <div className="font-semibold text-stone-900 dark:text-stone-100">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Job Title */}
                      <td className="py-3 px-4 text-stone-700 dark:text-stone-300 font-medium">
                        {emp.role}
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium">
                          {emp.department}
                        </span>
                      </td>

                      {/* Location / Country */}
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400 flex items-center gap-1.5 pt-4">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {emp.city ? `${emp.city}, ${emp.country}` : emp.country}
                      </td>

                      {/* Salary */}
                      <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">
                        ${emp.baseSalaryUSD ? emp.baseSalaryUSD.toLocaleString() : emp.baseSalary?.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-stone-400">USD</span>
                      </td>

                      {/* Date Joined */}
                      <td className="py-3 px-4 text-stone-500 dark:text-stone-400 text-[11px]">
                        {typeof emp.hireDate === 'string'
                          ? emp.hireDate.substring(0, 10)
                          : new Date(emp.hireDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Status badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            emp.status === 'On Leave'
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                              : emp.status === 'Contract'
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {emp.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEmployeeModal(emp);
                          }}
                          className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/40 dark:bg-stone-900/40">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Showing <span className="font-semibold text-stone-800 dark:text-stone-200">{(page - 1) * 10 + 1}</span> to{' '}
            <span className="font-semibold text-stone-800 dark:text-stone-200">
              {Math.min(page * 10, totalCount || 10000)}
            </span>{' '}
            of <span className="font-semibold text-stone-800 dark:text-stone-200">{totalCount || 10000}</span> employees
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-full border border-stone-200 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2.5 text-stone-800 dark:text-stone-200">
              Page {page} of {totalPages || 1000}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-full border border-stone-200 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee Detail Drawer / Modal */}
      {activeEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-lg w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    activeEmployeeModal.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
                  }
                  alt={activeEmployeeModal.firstName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400"
                />
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                    {activeEmployeeModal.firstName} {activeEmployeeModal.lastName}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{activeEmployeeModal.role}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveEmployeeModal(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Department</span>
                <span className="font-semibold text-stone-800 dark:text-stone-100 mt-0.5 block">
                  {activeEmployeeModal.department}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Compensation</span>
                <span className="font-bold text-stone-800 dark:text-stone-100 mt-0.5 block">
                  ${activeEmployeeModal.baseSalaryUSD?.toLocaleString()} USD/yr
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Pay Grade</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {activeEmployeeModal.payGrade || 'L5 Senior'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Location</span>
                <span className="font-semibold text-stone-800 dark:text-stone-100 mt-0.5 block">
                  {activeEmployeeModal.city}, {activeEmployeeModal.country}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveEmployeeModal(null)}
                className="px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Close
              </button>
              <button
                onClick={() => setActiveEmployeeModal(null)}
                className="px-4 py-2 rounded-full bg-amber-400 text-stone-950 text-xs font-bold shadow-sm hover:bg-amber-300"
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-lg w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" /> Add New Employee
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1 font-medium">First Name</label>
                  <input
                    required
                    value={newEmployeeForm.firstName}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1 font-medium">Last Name</label>
                  <input
                    required
                    value={newEmployeeForm.lastName}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 mb-1 font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={newEmployeeForm.email}
                  onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1 font-medium">Department</label>
                  <select
                    value={newEmployeeForm.department}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  >
                    {departments.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-500 mb-1 font-medium">Role</label>
                  <input
                    required
                    value={newEmployeeForm.role}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1 font-medium">Base Salary (USD)</label>
                  <input
                    type="number"
                    required
                    value={newEmployeeForm.baseSalary}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, baseSalary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1 font-medium">Pay Grade</label>
                  <select
                    value={newEmployeeForm.payGrade}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, payGrade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white"
                  >
                    {['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 shadow-sm"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
