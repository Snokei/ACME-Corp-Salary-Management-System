"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Users,
  Percent,
  DollarSign,
  Sparkles,
  Trash2,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
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
  Button,
  SearchableSelect,
  Modal,
  Input,
  Avatar,
  ConfirmDialog,
} from "@/components/ui";

interface EmployeeItem {
  id: string;
  planId: string;
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: string;
  role: string;
  payGrade: string;
  avatarUrl: string;
  currentSalaryUSD: number;
  proposedSalaryUSD: number;
  increaseAmountUSD: number;
  increasePercentage: number;
  currentCompaRatio: number | null;
  newCompaRatio: number | null;
  bandMin: number | null;
  bandMid: number | null;
  bandMax: number | null;
  bandStatus: string;
  status: string;
}

interface EmployeePlanningTableProps {
  planId: string;
  isEditable: boolean;
  onRefreshPlan: () => void;
}

const DEPARTMENTS = [
  "All",
  "Engineering",
  "Product",
  "Sales",
  "Marketing",
  "Finance",
  "Human Resources",
  "Legal",
  "Operations",
];

const getCompaBadge = (ratio: number | null) => {
  if (ratio === null) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
        N/A
      </span>
    );
  }
  let color = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
  if (ratio < 85.0) {
    color = "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
  } else if (ratio > 115.0) {
    color = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${color}`}>
      {ratio.toFixed(1)}%
    </span>
  );
};

// Memoized row component to eliminate whole-table re-renders on keystrokes
interface EmployeePlanningRowProps {
  item: EmployeeItem;
  isEditable: boolean;
  onUpdateItem: (
    itemId: string,
    field: "increasePercentage" | "proposedSalaryUSD",
    value: number
  ) => Promise<void>;
  onRemoveItem: (itemId: string, name: string) => void;
}

const EmployeePlanningRow = memo(function EmployeePlanningRow({
  item,
  isEditable,
  onUpdateItem,
  onRemoveItem,
}: EmployeePlanningRowProps) {
  const [draft, setDraft] = useState({
    pct: String(item.increasePercentage),
    salary: String(item.proposedSalaryUSD),
  });

  useEffect(() => {
    setDraft((prev) => ({ ...prev, pct: String(item.increasePercentage) }));
  }, [item.increasePercentage]);

  useEffect(() => {
    setDraft((prev) => ({ ...prev, salary: String(item.proposedSalaryUSD) }));
  }, [item.proposedSalaryUSD]);

  const handlePctBlur = () => {
    const num = parseFloat(draft.pct);
    if (isNaN(num) || num < 0) {
      toast.error("Increase percentage must be a non-negative number");
      setDraft((prev) => ({ ...prev, pct: String(item.increasePercentage) }));
      return;
    }
    if (num !== item.increasePercentage) {
      onUpdateItem(item.id, "increasePercentage", num);
    }
  };

  const handleSalaryBlur = () => {
    const num = parseFloat(draft.salary);
    if (isNaN(num) || num < item.currentSalaryUSD) {
      toast.error("Proposed salary cannot be less than current salary");
      setDraft((prev) => ({ ...prev, salary: String(item.proposedSalaryUSD) }));
      return;
    }
    if (num !== item.proposedSalaryUSD) {
      onUpdateItem(item.id, "proposedSalaryUSD", num);
    }
  };

  return (
    <TableRow hoverable>
      {/* Employee Info */}
      <TableCell className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={item.avatarUrl}
            alt={item.fullName}
            size={32}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-800"
          />
          <div>
            <div className="font-semibold text-stone-900 dark:text-white">
              {item.fullName}
            </div>
            <div className="text-[11px] text-stone-400">
              {item.role} • <span className="font-mono text-stone-500">{item.employeeCode}</span>
            </div>
          </div>
        </div>
      </TableCell>

      {/* Department */}
      <TableCell className="text-stone-600 dark:text-stone-300">
        {item.department}
      </TableCell>

      {/* Pay Grade & Band Info */}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            {item.payGrade}
          </span>
          {item.bandMid ? (
            <span className="text-[10px] text-stone-400 font-mono">
              Mid: ${(item.bandMid / 1000).toFixed(0)}k
            </span>
          ) : (
            <span className="text-[10px] text-stone-400">No Band</span>
          )}
        </div>
      </TableCell>

      {/* Current Salary */}
      <TableCell align="right" className="text-stone-900 dark:text-white font-semibold">
        ${item.currentSalaryUSD.toLocaleString("en-US")}
      </TableCell>

      {/* Current Compa-Ratio */}
      <TableCell align="center">
        {getCompaBadge(item.currentCompaRatio)}
      </TableCell>

      {/* Proposed Increase % Input */}
      <TableCell align="right">
        {isEditable ? (
          <div className="relative inline-block w-24">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={draft.pct}
              onChange={(e) => setDraft((prev) => ({ ...prev, pct: e.target.value }))}
              onBlur={handlePctBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="w-full pr-5 pl-2 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-right text-xs font-semibold text-amber-600 dark:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            <Percent className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>
        ) : (
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {item.increasePercentage}%
          </span>
        )}
      </TableCell>

      {/* Increase Amount ($) */}
      <TableCell align="right" className="text-amber-600 dark:text-amber-400 font-semibold">
        +${item.increaseAmountUSD.toLocaleString("en-US")}
      </TableCell>

      {/* Proposed Salary ($ Input) */}
      <TableCell align="right">
        {isEditable ? (
          <div className="relative inline-block w-32">
            <DollarSign className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="number"
              min={item.currentSalaryUSD}
              step="100"
              value={draft.salary}
              onChange={(e) => setDraft((prev) => ({ ...prev, salary: e.target.value }))}
              onBlur={handleSalaryBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="w-full pl-6 pr-2 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-right text-xs font-semibold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
        ) : (
          <span className="font-semibold text-stone-900 dark:text-white">
            ${item.proposedSalaryUSD.toLocaleString("en-US")}
          </span>
        )}
      </TableCell>

      {/* New Compa-Ratio */}
      <TableCell align="center">
        {getCompaBadge(item.newCompaRatio)}
      </TableCell>

      {/* Actions */}
      {isEditable && (
        <TableCell align="center">
          <button
            onClick={() => onRemoveItem(item.id, item.fullName)}
            className="p-1 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Remove from plan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </TableCell>
      )}
    </TableRow>
  );
});

export function EmployeePlanningTable({
  planId,
  isEditable,
  onRefreshPlan,
}: EmployeePlanningTableProps) {
  const [items, setItems] = useState<EmployeeItem[]>([]);
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    searchInput: "",
    debouncedSearch: "",
    department: "All",
    isLoading: true,
  });
  const [bulk, setBulk] = useState({
    pct: "5.0",
    isApplying: false,
    showModal: false,
  });
  const [pendingRemove, setPendingRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Debounce search input by 300ms to eliminate network storm
  useEffect(() => {
    const handler = setTimeout(() => {
      setQuery((prev) => ({
        ...prev,
        debouncedSearch: prev.searchInput,
        page: 1,
      }));
    }, 300);
    return () => clearTimeout(handler);
  }, [query.searchInput]);

  const fetchItems = useCallback(async () => {
    setQuery((prev) => ({ ...prev, isLoading: true }));
    try {
      const params = new URLSearchParams({
        page: String(query.page),
        limit: String(query.limit),
      });
      if (query.debouncedSearch.trim()) params.set("search", query.debouncedSearch.trim());
      if (query.department !== "All") params.set("department", query.department);

      const res = await fetch(`/api/compensation-planning/${planId}/items?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setItems(data.data.items || []);
        setQuery((prev) => ({
          ...prev,
          total: data.data.total || 0,
          totalPages: data.data.totalPages || 1,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch employee planning items:", err);
      toast.error("Failed to load employee planning table");
    } finally {
      setQuery((prev) => ({ ...prev, isLoading: false }));
    }
  }, [planId, query.page, query.limit, query.debouncedSearch, query.department]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle single item update without clobbering other rows
  const handleUpdateItem = useCallback(
    async (
      itemId: string,
      field: "increasePercentage" | "proposedSalaryUSD",
      value: number
    ) => {
      try {
        const payload =
          field === "increasePercentage"
            ? { increasePercentage: value }
            : { proposedSalaryUSD: value };

        const res = await fetch(`/api/compensation-planning/${planId}/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update employee salary proposal");
        }

        if (data.data) {
          setItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, ...data.data } : item))
          );
        } else {
          fetchItems();
        }
        onRefreshPlan();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update item";
        toast.error(message);
        fetchItems();
      }
    },
    [planId, fetchItems, onRefreshPlan]
  );

  const handleRemoveItem = useCallback(
    (itemId: string, name: string) => {
      setPendingRemove({ id: itemId, name });
    },
    []
  );

  const handleConfirmRemove = useCallback(async () => {
    if (!pendingRemove) return;
    try {
      const res = await fetch(
        `/api/compensation-planning/${planId}/items/${pendingRemove.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove employee");
      }
      toast.success("Employee removed from plan");
      setPendingRemove(null);
      fetchItems();
      onRefreshPlan();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not remove employee";
      toast.error(message);
    }
  }, [pendingRemove, planId, fetchItems, onRefreshPlan]);

  const handleApplyBulkIncrease = async () => {
    const pctNum = parseFloat(bulk.pct);
    if (isNaN(pctNum) || pctNum < 0) {
      toast.error("Please enter a valid percentage increase");
      return;
    }

    setBulk((prev) => ({ ...prev, isApplying: true }));
    try {
      const res = await fetch(`/api/compensation-planning/${planId}/items/bulk-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: query.department === "All" ? undefined : query.department,
          increasePercentage: pctNum,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to apply bulk increase");
      }

      toast.success(`Applied ${pctNum}% increase to ${data.data.count} employees!`);
      setBulk((prev) => ({ ...prev, showModal: false }));
      fetchItems();
      onRefreshPlan();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to apply bulk increase";
      toast.error(message);
    } finally {
      setBulk((prev) => ({ ...prev, isApplying: false }));
    }
  };

  const applySearchNow = () => {
    setQuery((prev) => ({
      ...prev,
      debouncedSearch: prev.searchInput,
      page: 1,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & Bulk Actions Bar with white bg container */}
      <div className="relative z-20 p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applySearchNow();
          }}
          className="flex-1 max-w-2xl flex items-center gap-2.5 flex-wrap sm:flex-nowrap"
        >
          <div className="flex-1 max-w-md flex items-center gap-2">
            <Input
              placeholder="Search employee by name, ID or role..."
              shape="pill"
              value={query.searchInput}
              onChange={(e) =>
                setQuery((prev) => ({ ...prev, searchInput: e.target.value }))
              }
              leftIcon={<Search className="w-4 h-4 text-stone-400" />}
              containerClassName="w-full"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              shape="pill"
              onClick={applySearchNow}
            >
              Search
            </Button>
          </div>

          <SearchableSelect
            name="department"
            options={DEPARTMENTS}
            defaultValue={query.department}
            placeholder="All Departments"
            shape="pill"
            onChange={(val) => {
              setQuery((prev) => ({ ...prev, department: val, page: 1 }));
            }}
          />
        </form>

        {/* Bulk Action Button */}
        {isEditable && (
          <div className="flex items-center justify-end">
            <Button
              variant="secondary"
              size="md"
              shape="pill"
              onClick={() => setBulk((prev) => ({ ...prev, showModal: true }))}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
            >
              Bulk Apply %
            </Button>
          </div>
        )}
      </div>

      {/* Main Employee Planning Table */}
      <TableContainer className="relative z-10">
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="px-4">Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Band & Pay Grade</TableHead>
              <TableHead align="right">Current Salary</TableHead>
              <TableHead align="center">Current Compa</TableHead>
              <TableHead align="right">Proposed Increase %</TableHead>
              <TableHead align="right">Increase ($)</TableHead>
              <TableHead align="right">Proposed Salary ($)</TableHead>
              <TableHead align="center">New Compa</TableHead>
              {isEditable && <TableHead align="center">Actions</TableHead>}
            </tr>
          </TableHeader>

          <TableBody>
            {query.isLoading ? (
              <TableLoading colSpan={isEditable ? 10 : 9} message="Loading employee salary proposals..." />
            ) : items.length === 0 ? (
              <TableEmpty
                colSpan={isEditable ? 10 : 9}
                icon={<Users className="w-8 h-8 text-stone-300 dark:text-stone-600 mb-1" />}
                title="No employees found"
                description="Try adjusting your department filter or search keyword."
              />
            ) : (
              items.map((item) => (
                <EmployeePlanningRow
                  key={item.id}
                  item={item}
                  isEditable={isEditable}
                  onUpdateItem={handleUpdateItem}
                  onRemoveItem={handleRemoveItem}
                />
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <TablePagination
          page={query.page}
          totalPages={query.totalPages}
          totalCount={query.total}
          pageSize={query.limit}
          onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
          itemLabel="employees"
        />
      </TableContainer>

      {/* Bulk Apply Increase Modal */}
      <Modal
        isOpen={bulk.showModal}
        onClose={() => setBulk((prev) => ({ ...prev, showModal: false }))}
        maxWidth="md"
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-stone-900 dark:text-white">
                Bulk Increase Tool
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-normal mt-0.5">
                Apply a uniform percentage increase across employees
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
              Target Scope
            </label>
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 font-medium">
              {query.department === "All"
                ? "All employees in compensation plan"
                : `Employees in ${query.department} department`}
            </div>
          </div>

          <div>
            <Input
              label="Increase Percentage (%)"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={bulk.pct}
              onChange={(e) => setBulk((prev) => ({ ...prev, pct: e.target.value }))}
              shape="rounded"
              rightIcon={<Percent className="w-4 h-4 text-stone-400" />}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200/80 dark:border-stone-800/80">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              shape="pill"
              onClick={() => setBulk((prev) => ({ ...prev, showModal: false }))}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              shape="pill"
              isLoading={bulk.isApplying}
              onClick={handleApplyBulkIncrease}
            >
              Apply Bulk Increase
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingRemove}
        title="Remove employee from plan"
        message={
          pendingRemove
            ? `Remove ${pendingRemove.name} from this compensation plan?`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
        onClose={() => setPendingRemove(null)}
      />
    </div>
  );
}
