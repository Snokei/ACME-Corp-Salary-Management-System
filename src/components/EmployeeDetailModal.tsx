import React from 'react';
import { Employee } from '@/types';
import { Modal, Button } from '@/components/ui';

export interface EmployeeDetailModalProps {
  employee: Employee | null;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
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

export function EmployeeDetailModal({
  employee,
  onClose,
  onEdit,
}: EmployeeDetailModalProps) {
  if (!employee) return null;

  const avatar = getEmployeeAvatar(employee);
  const fallbackAvatar = `https://ui-avatars.com/api/?background=f5c242&color=18181b&bold=true&name=${encodeURIComponent(
    employee.firstName + ' ' + employee.lastName
  )}`;

  return (
    <Modal isOpen={Boolean(employee)} onClose={onClose} maxWidth="lg">
      <div className="space-y-5">
        {/* Header Profile */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt={`${employee.firstName} ${employee.lastName}`}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== fallbackAvatar) {
                  target.src = fallbackAvatar;
                }
              }}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-amber-400 shrink-0 bg-stone-100 dark:bg-stone-800"
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
              ${(employee.baseSalaryUSD ?? employee.baseSalary ?? 0).toLocaleString('en-US')} USD/yr
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
