import React from 'react';
import { Employee } from '@/types';
import { Modal, Button } from '@/components/ui';

export interface EmployeeDetailModalProps {
  employee: Employee | null;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
}

export function EmployeeDetailModal({
  employee,
  onClose,
  onEdit,
}: EmployeeDetailModalProps) {
  if (!employee) return null;

  return (
    <Modal isOpen={Boolean(employee)} onClose={onClose} maxWidth="lg">
      <div className="space-y-5">
        {/* Header Profile */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={
                employee.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
              }
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400 shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {employee.role} &bull; {employee.email}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 py-2 text-xs">
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">
              Department
            </span>
            <span className="font-semibold text-stone-800 dark:text-stone-100 mt-0.5 block">
              {employee.department}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">
              Compensation
            </span>
            <span className="font-bold text-stone-800 dark:text-stone-100 mt-0.5 block">
              ${(employee.baseSalaryUSD ?? employee.baseSalary ?? 0).toLocaleString()} USD/yr
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">
              Pay Grade
            </span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block">
              {employee.payGrade || 'L5 Senior'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 block text-[10px] uppercase font-semibold">
              Location
            </span>
            <span className="font-semibold text-stone-800 dark:text-stone-100 mt-0.5 block">
              {employee.city ? `${employee.city}, ${employee.country}` : employee.country}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" shape="pill" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="amber"
            shape="pill"
            onClick={() => {
              if (onEdit) onEdit(employee);
              onClose();
            }}
          >
            Edit Details
          </Button>
        </div>
      </div>
    </Modal>
  );
}
