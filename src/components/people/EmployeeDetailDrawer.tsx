'use client';

import React, { useState, useEffect } from 'react';
import { Employee } from '@/types';
import { Drawer, Button } from '@/components/ui';
import { SalaryAdjustmentModal } from '@/components/people/SalaryAdjustmentModal';
import { getSalaryHistoryAction } from '@/actions/salaryAdjustments';
import { getCompensationAnalysisAction } from '@/actions/salaryBands';
import { CompensationAnalysisResult } from '@/lib/compaRatioService';
import { Plus, History, DollarSign, Tag, Calendar, Layers, Target, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface EmployeeDetailDrawerProps {
  employee: Employee | null;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
  onEmployeeUpdated?: (updatedEmployee: Employee) => void;
}

export interface SalaryHistoryItem {
  id: string;
  employeeId: string;
  amount: number;
  currency: string;
  amountUSD: number;
  effectiveDate: string | Date;
  reason: string;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string | Date;
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

export function EmployeeDetailDrawer({
  employee,
  onClose,
  onEdit,
  onEmployeeUpdated,
}: EmployeeDetailDrawerProps) {
  const router = useRouter();
  const [currentEmp, setCurrentEmp] = useState<Employee | null>(employee);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState<boolean>(false);
  const [compAnalysis, setCompAnalysis] = useState<CompensationAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);

  useEffect(() => {
    setCurrentEmp(employee);
  }, [employee]);

  // Fetch salary history whenever the active employee changes
  useEffect(() => {
    if (currentEmp?.id) {
      setLoadingHistory(true);
      getSalaryHistoryAction(currentEmp.id)
        .then((res) => {
          if (res.success && res.history) {
            setSalaryHistory(res.history as SalaryHistoryItem[]);
          } else {
            setSalaryHistory([]);
          }
        })
        .catch((err) => {
          console.error('Failed to load salary history:', err);
          setSalaryHistory([]);
        })
        .finally(() => setLoadingHistory(false));
    }
  }, [currentEmp?.id]);

  // Fetch compensation analysis whenever employee salary or pay grade changes
  useEffect(() => {
    if (currentEmp) {
      const salary = currentEmp.baseSalaryUSD ?? currentEmp.baseSalary ?? 0;
      setLoadingAnalysis(true);
      getCompensationAnalysisAction(salary, currentEmp.payGrade || 'L4', currentEmp.currency || 'USD')
        .then((res) => {
          if (res.success && res.analysis) {
            setCompAnalysis(res.analysis);
          } else {
            setCompAnalysis(null);
          }
        })
        .catch((err) => {
          console.error('Failed to load compensation analysis:', err);
          setCompAnalysis(null);
        })
        .finally(() => setLoadingAnalysis(false));
    }
  }, [currentEmp?.id, currentEmp?.baseSalary, currentEmp?.baseSalaryUSD, currentEmp?.payGrade]);

  if (!currentEmp) return null;

  const avatar = getEmployeeAvatar(currentEmp);
  const fallbackAvatar = `https://ui-avatars.com/api/?background=f5c242&color=18181b&bold=true&name=${encodeURIComponent(
    currentEmp.firstName + ' ' + currentEmp.lastName
  )}`;

  const currentSalaryAmount = currentEmp.baseSalaryUSD ?? currentEmp.baseSalary ?? 0;

  const handleAdjustmentSuccess = async () => {
    if (currentEmp.id) {
      setLoadingHistory(true);
      try {
        const res = await getSalaryHistoryAction(currentEmp.id);
        if (res.success && res.history && res.history.length > 0) {
          setSalaryHistory(res.history as SalaryHistoryItem[]);
          const latest = res.history[0];
          const updated = {
            ...currentEmp,
            baseSalary: latest.amount,
            baseSalaryUSD: latest.amountUSD || latest.amount,
          };
          setCurrentEmp(updated);
          if (onEmployeeUpdated) {
            onEmployeeUpdated(updated);
          }
        }
      } catch (err) {
        console.error('Error refreshing salary history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    router.refresh();
  };

  return (
    <>
      <Drawer isOpen={Boolean(employee)} onClose={onClose} title="Employee Profile">
        <div className="space-y-6">
          {/* Header Profile */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt={`${currentEmp.firstName} ${currentEmp.lastName}`}
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
                  {currentEmp.firstName} {currentEmp.lastName}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {currentEmp.role} &bull; {currentEmp.email}
                </p>
                <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                  ID: {currentEmp.employeeId}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 py-1 text-xs">
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                Status
              </span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 mt-0.5 block">
                <span
                  className={`inline-flex items-center gap-1.5 ${
                    currentEmp.status === 'Active'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      currentEmp.status === 'Active' ? 'bg-emerald-500' : 'bg-stone-400'
                    }`}
                  ></span>
                  {currentEmp.status || 'Active'}
                </span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                Hire Date
              </span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 mt-0.5 block">
                {currentEmp.hireDate
                  ? new Date(currentEmp.hireDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                Department
              </span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 mt-0.5 block">
                {currentEmp.department}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                Pay Grade
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {currentEmp.payGrade || 'L5 Senior'}
              </span>
            </div>

            <div className="col-span-2 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800">
              <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                Location
              </span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 mt-0.5 block">
                {currentEmp.city ? `${currentEmp.city}, ${currentEmp.country}` : currentEmp.country}
              </span>
            </div>
          </div>

          {/* Current Compensation Section */}
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block">
                  Current Compensation
                </span>
                <span className="text-xl font-extrabold text-stone-900 dark:text-white mt-0.5 block">
                  ${currentSalaryAmount.toLocaleString('en-US')}{' '}
                  <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
                    {currentEmp.currency || 'USD'} / yr
                  </span>
                </span>
              </div>
              <Button
                variant="amber"
                size="sm"
                shape="pill"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsAdjustmentModalOpen(true)}
              >
                Add Salary Adjustment
              </Button>
            </div>

            {currentEmp.bonusUSD ? (
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
                <span className="text-stone-600 dark:text-stone-300 font-medium">Target Annual Bonus:</span>
                <span className="font-bold text-stone-800 dark:text-stone-100">
                  ${currentEmp.bonusUSD.toLocaleString('en-US')} USD
                </span>
              </div>
            ) : null}
          </div>

          {/* Compensation Position & Salary Band Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                <Target className="w-4 h-4 text-amber-500" />
                <span>Salary Band & Compa-Ratio</span>
              </div>
              {compAnalysis?.hasBand && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    compAnalysis.status === 'Within Band'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : compAnalysis.status === 'Below Band'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {compAnalysis.status}
                </span>
              )}
            </div>

            {loadingAnalysis ? (
              <div className="py-2 text-center text-xs text-stone-400 animate-pulse">
                Analyzing salary band position...
              </div>
            ) : !compAnalysis?.hasBand || !compAnalysis.band ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>No matching salary band defined for pay grade ({currentEmp.payGrade || 'N/A'}).</span>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Minimum</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ${compAnalysis.band.minSalary.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Midpoint</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ${compAnalysis.band.midpointSalary.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Maximum</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ${compAnalysis.band.maxSalary.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-amber-400/40">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block uppercase font-bold">Compa-Ratio</span>
                    <span className="font-extrabold text-stone-900 dark:text-white text-sm">
                      {compAnalysis.compaRatio !== null ? `${compAnalysis.compaRatio.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Range Bar Indicator */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 dark:text-stone-400">
                    <span>Position in Band: <strong className="text-stone-900 dark:text-white">{compAnalysis.displayPosition}</strong></span>
                    <span>Grade {compAnalysis.band.payGrade} ({compAnalysis.band.currency})</span>
                  </div>

                  <div className="relative w-full h-3 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        compAnalysis.status === 'Within Band'
                          ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                          : compAnalysis.status === 'Below Band'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${compAnalysis.visualPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                    <span>${compAnalysis.band.minSalary.toLocaleString()}</span>
                    <span>Mid: ${compAnalysis.band.midpointSalary.toLocaleString()}</span>
                    <span>${compAnalysis.band.maxSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Salary History Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-white">
                <History className="w-4 h-4 text-amber-500" />
                <span>Salary History</span>
              </div>
              <span className="text-[10px] text-stone-400">Ordered by date (desc)</span>
            </div>

            {loadingHistory ? (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 text-center text-xs text-stone-400 animate-pulse">
                Loading salary history...
              </div>
            ) : salaryHistory.length === 0 ? (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400">
                No previous salary adjustments recorded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {salaryHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 hover:border-amber-500/40 transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="font-bold text-stone-900 dark:text-white text-sm">
                        ${item.amount.toLocaleString('en-US')} {item.currency || 'USD'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full text-[10px]">
                        <Tag className="w-2.5 h-2.5" />
                        {item.reason}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {new Date(item.effectiveDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {item.createdBy && <span className="text-[10px]">By {item.createdBy}</span>}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 italic pt-0.5">
                        &quot;{item.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <Button variant="outline" shape="pill" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="amber"
              shape="pill"
              onClick={() => {
                if (onEdit && currentEmp) onEdit(currentEmp);
              }}
            >
              Edit Details
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Salary Adjustment Form Modal */}
      <SalaryAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        employee={currentEmp}
        onSuccess={handleAdjustmentSuccess}
      />
    </>
  );
}
