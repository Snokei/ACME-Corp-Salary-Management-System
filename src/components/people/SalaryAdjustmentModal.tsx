'use client';

import React, { useState, useEffect } from 'react';
import { Employee } from '@/types';
import { Modal, Button, Input, Select } from '@/components/ui';
import { SALARY_ADJUSTMENT_REASONS, calculateSalaryChange } from '@/lib/salaryAdjustmentService';
import { createSalaryAdjustmentAction } from '@/actions/salaryAdjustments';
import { getCompensationAnalysisAction } from '@/actions/salaryBands';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Tag,
  AlertTriangle,
  FileText,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export interface SalaryAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSuccess: () => void;
}

export function SalaryAdjustmentModal({
  isOpen,
  onClose,
  employee,
  onSuccess,
}: SalaryAdjustmentModalProps) {
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [form, setForm] = useState({
    newSalary: '',
    effectiveDate: '',
    reason: 'Annual Increase',
    notes: '',
  });
  const [ui, setUi] = useState({ isSubmitting: false, loadingBand: false });
  const [errors, setErrors] = useState<{ newSalary?: string; effectiveDate?: string; reason?: string }>({});
  const [bandData, setBandData] = useState<{
    minSalary: number;
    midpointSalary: number;
    maxSalary: number;
    payGrade: string;
  } | null>(null);

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (isOpen && employee) {
      setStep('form');
      const today = new Date().toISOString().split('T')[0];
      setForm({
        newSalary: '',
        effectiveDate: today,
        reason: 'Annual Increase',
        notes: '',
      });
      setErrors({});
      setUi({ isSubmitting: false, loadingBand: false });

      if (employee.payGrade) {
        setUi((prev) => ({ ...prev, loadingBand: true }));
        const empSalary = employee.baseSalaryUSD ?? employee.baseSalary ?? 0;
        getCompensationAnalysisAction(empSalary, employee.payGrade, employee.currency || 'USD')
          .then((res) => {
            if (res.success && res.analysis?.hasBand && res.analysis.band) {
              setBandData({
                minSalary: res.analysis.band.minSalary,
                midpointSalary: res.analysis.band.midpointSalary,
                maxSalary: res.analysis.band.maxSalary,
                payGrade: employee.payGrade,
              });
            } else {
              setBandData(null);
            }
          })
          .catch(() => setBandData(null))
          .finally(() => setUi((prev) => ({ ...prev, loadingBand: false })));
      } else {
        setBandData(null);
      }
    }
  }, [isOpen, employee]);

  if (!employee) return null;

  const currentSalary = employee.baseSalaryUSD ?? employee.baseSalary ?? 0;
  const numericNewSalary = parseFloat(form.newSalary);
  const isValidNewSalary = !isNaN(numericNewSalary) && numericNewSalary > 0;

  const { change, percentage } = isValidNewSalary
    ? calculateSalaryChange(currentSalary, numericNewSalary)
    : { change: 0, percentage: 0 };

  // Calculate live position in band & compa ratio for proposed new salary
  const targetSalaryForAnalysis = isValidNewSalary ? numericNewSalary : currentSalary;
  let newCompaRatio: number | null = null;
  let newBandStatus: 'Within Band' | 'Below Band' | 'Above Band' | null = null;
  let visualPercent = 0;
  let diffFromMin = 0;
  let diffFromMax = 0;

  if (bandData && bandData.minSalary && bandData.maxSalary && bandData.midpointSalary) {
    if (bandData.midpointSalary > 0) {
      newCompaRatio = Math.round((targetSalaryForAnalysis / bandData.midpointSalary) * 1000) / 10;
    }
    const range = bandData.maxSalary - bandData.minSalary;
    if (range > 0) {
      const pos = ((targetSalaryForAnalysis - bandData.minSalary) / range) * 100;
      visualPercent = Math.max(0, Math.min(100, Math.round(pos * 10) / 10));
    }

    if (targetSalaryForAnalysis < bandData.minSalary) {
      newBandStatus = 'Below Band';
      diffFromMin = Math.round(bandData.minSalary - targetSalaryForAnalysis);
    } else if (targetSalaryForAnalysis > bandData.maxSalary) {
      newBandStatus = 'Above Band';
      diffFromMax = Math.round(targetSalaryForAnalysis - bandData.maxSalary);
    } else {
      newBandStatus = 'Within Band';
    }
  }

  const isDecrease = change < 0;

  const validateForm = () => {
    const newErrors: { newSalary?: string; effectiveDate?: string; reason?: string } = {};

    if (!form.newSalary || isNaN(numericNewSalary)) {
      newErrors.newSalary = 'New salary is required and must be a valid number';
    } else if (numericNewSalary <= 0) {
      newErrors.newSalary = 'New salary must be greater than 0';
    }

    if (!form.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }

    if (!form.reason || !form.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReviewClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('confirm');
    }
  };

  const handleConfirmSubmit = async () => {
    if (ui.isSubmitting) return;

    setUi((prev) => ({ ...prev, isSubmitting: true }));
    const toastId = toast.loading('Applying salary adjustment...');

    try {
      const res = await createSalaryAdjustmentAction(employee.id, {
        amount: numericNewSalary,
        currency: employee.currency || 'USD',
        amountUSD: numericNewSalary,
        effectiveDate: form.effectiveDate,
        reason: form.reason,
        notes: form.notes,
      });

      if (res.success) {
        toast.success('Salary adjustment applied successfully!', { id: toastId });
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'Failed to apply salary adjustment', { id: toastId });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(message, { id: toastId });
    } finally {
      setUi((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!ui.isSubmitting) onClose();
      }}
      title={step === 'form' ? 'Add Salary Adjustment' : 'Confirm Salary Adjustment?'}
      maxWidth="lg"
    >
      {step === 'form' ? (
        <form onSubmit={handleReviewClick} className="space-y-4 text-xs">
          {/* Employee Header Info */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Employee
              </span>
              <span className="font-bold text-sm text-stone-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 ml-2 font-mono">
                ({employee.employeeId})
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Current Base Salary
              </span>
              <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                ${currentSalary.toLocaleString('en-US')} {employee.currency || 'USD'}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <Input
                label="New Salary ($)"
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 135000"
                value={form.newSalary}
                onChange={(e) => {
                  updateForm('newSalary', e.target.value);
                  if (errors.newSalary) setErrors({ ...errors, newSalary: undefined });
                }}
                error={errors.newSalary}
                required
                leftIcon={<DollarSign className="w-3.5 h-3.5 text-stone-400" />}
              />
            </div>

            <div>
              <Input
                label="Effective Date"
                type="date"
                value={form.effectiveDate}
                onChange={(e) => {
                  updateForm('effectiveDate', e.target.value);
                  if (errors.effectiveDate) setErrors({ ...errors, effectiveDate: undefined });
                }}
                error={errors.effectiveDate}
                required
                leftIcon={<Calendar className="w-3.5 h-3.5 text-stone-400" />}
              />
            </div>
          </div>

          <div>
            <Select
              label="Reason for Adjustment"
              value={form.reason}
              onChange={(e) => {
                updateForm('reason', e.target.value);
                if (errors.reason) setErrors({ ...errors, reason: undefined });
              }}
              error={errors.reason}
              required
            >
              {SALARY_ADJUSTMENT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
              Notes <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              className="w-full rounded-xl bg-white/90 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700/80 p-2.5 text-xs text-stone-800 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-400/50"
              placeholder="e.g. Promoted to Senior Software Engineer"
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
            />
          </div>

          {/* Salary Band & Range Guardrails */}
          {bandData && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs text-stone-900 dark:text-white">
                    Salary Band for {bandData.payGrade}
                  </span>
                </div>
                {newBandStatus && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      newBandStatus === 'Within Band'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : newBandStatus === 'Below Band'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {newBandStatus === 'Within Band' && <CheckCircle2 className="w-3 h-3" />}
                    {newBandStatus !== 'Within Band' && <AlertCircle className="w-3 h-3" />}
                    <span>{newBandStatus}</span>
                  </span>
                )}
              </div>

              {/* Band Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Minimum</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-xs">
                    ${bandData.minSalary.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Midpoint</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-xs">
                    ${bandData.midpointSalary.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-700/60">
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">Maximum</span>
                  <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-xs">
                    ${bandData.maxSalary.toLocaleString('en-US')}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-stone-900/60 border border-amber-400/40">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold block">New Compa</span>
                  <span className="font-mono font-extrabold text-stone-900 dark:text-white text-xs">
                    {newCompaRatio !== null ? `${newCompaRatio.toFixed(1)}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Visual Position in Band Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>${bandData.minSalary.toLocaleString('en-US')} (Min)</span>
                  <span>Midpoint: ${bandData.midpointSalary.toLocaleString('en-US')}</span>
                  <span>${bandData.maxSalary.toLocaleString('en-US')} (Max)</span>
                </div>
                <div className="relative w-full h-2.5 rounded-full bg-stone-200/80 dark:bg-stone-700/80 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      newBandStatus === 'Below Band'
                        ? 'bg-amber-500'
                        : newBandStatus === 'Above Band'
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${visualPercent}%` }}
                  />
                </div>
              </div>

              {/* Guardrail Guidance Alerts */}
              {newBandStatus === 'Below Band' && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    Proposed salary is <strong>${diffFromMin.toLocaleString('en-US')} below</strong> the band minimum ($
                    {bandData.minSalary.toLocaleString('en-US')}). This employee may be underpaid relative to their {bandData.payGrade} market range.
                  </span>
                </div>
              )}

              {newBandStatus === 'Above Band' && (
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-800 dark:text-indigo-300 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
                  <span>
                    Proposed salary is <strong>${diffFromMax.toLocaleString('en-US')} above</strong> the band maximum ($
                    {bandData.maxSalary.toLocaleString('en-US')}). Exceeding the band top may require leadership or compensation committee approval.
                  </span>
                </div>
              )}

              {newBandStatus === 'Within Band' && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>
                    Proposed salary is within the official range for {bandData.payGrade} (Compa-Ratio: {newCompaRatio}% of market midpoint).
                  </span>
                </div>
              )}
            </div>
          )}

          {ui.loadingBand && (
            <div className="py-2 text-center text-xs text-stone-400 animate-pulse">
              Loading salary band metrics...
            </div>
          )}

          {/* Calculated Live Preview */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block">
              Salary Change Preview
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center pt-1">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-800/80">
                <span className="text-[10px] text-stone-400 block">Current Salary</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  ${currentSalary.toLocaleString('en-US')}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-800/80">
                <span className="text-[10px] text-stone-400 block">New Salary</span>
                <span className="font-bold text-stone-900 dark:text-white">
                  {isValidNewSalary ? `$${numericNewSalary.toLocaleString('en-US')}` : '—'}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-800/80">
                <span className="text-[10px] text-stone-400 block">Change</span>
                <span
                  className={`font-bold ${
                    !isValidNewSalary
                      ? 'text-stone-400'
                      : isDecrease
                      ? 'text-rose-600 dark:text-rose-400'
                      : change > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-stone-700'
                  }`}
                >
                  {isValidNewSalary
                    ? `${change >= 0 ? '+' : '-'}$${Math.abs(change).toLocaleString('en-US')}`
                    : '—'}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/80 dark:bg-stone-800/80">
                <span className="text-[10px] text-stone-400 block">Percentage</span>
                <span
                  className={`font-bold flex items-center justify-center gap-1 ${
                    !isValidNewSalary
                      ? 'text-stone-400'
                      : isDecrease
                      ? 'text-rose-600 dark:text-rose-400'
                      : percentage > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-stone-700'
                  }`}
                >
                  {isValidNewSalary ? (
                    <>
                      {isDecrease ? (
                        <TrendingDown className="w-3 h-3 shrink-0" />
                      ) : percentage > 0 ? (
                        <TrendingUp className="w-3 h-3 shrink-0" />
                      ) : null}
                      <span>{percentage >= 0 ? `+${percentage.toFixed(2)}%` : `${percentage.toFixed(2)}%`}</span>
                    </>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
            </div>

            {isValidNewSalary && isDecrease && (
              <div className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>Notice: New salary is lower than the current salary (-{Math.abs(percentage).toFixed(2)}%).</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" shape="pill" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="amber" shape="pill" disabled={!isValidNewSalary}>
              Review Adjustment
            </Button>
          </div>
        </form>
      ) : (
        /* Confirmation Stage */
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-700">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                  Employee
                </span>
                <span className="font-bold text-stone-900 dark:text-white text-sm">
                  {employee.firstName} {employee.lastName}
                </span>
                <span className="text-stone-500 dark:text-stone-400 ml-2 font-mono text-xs">
                  ({employee.employeeId})
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                  Reason
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full text-xs">
                  <Tag className="w-3 h-3" />
                  {form.reason}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Current Salary</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                  ${currentSalary.toLocaleString('en-US')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">New Salary</span>
                <span className="font-bold text-stone-900 dark:text-white text-sm">
                  ${numericNewSalary.toLocaleString('en-US')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Change Amount</span>
                <span
                  className={`font-bold text-sm ${
                    isDecrease ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {change >= 0 ? '+' : '-'}${Math.abs(change).toLocaleString('en-US')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Change Percentage</span>
                <span
                  className={`font-bold text-sm ${
                    isDecrease ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {percentage >= 0 ? `+${percentage.toFixed(2)}%` : `${percentage.toFixed(2)}%`}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Effective Date</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {new Date(form.effectiveDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {bandData && (
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Band Position ({bandData.payGrade})
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`font-semibold text-xs inline-flex items-center gap-1 ${
                        newBandStatus === 'Within Band'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : newBandStatus === 'Below Band'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {newBandStatus === 'Within Band' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {newBandStatus !== 'Within Band' && <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{newBandStatus}</span>
                    </span>
                    {newCompaRatio !== null && (
                      <span className="text-stone-400 font-mono text-[11px]">
                        ({newCompaRatio}% Compa)
                      </span>
                    )}
                  </div>
                </div>
              )}
              {form.notes && (
                <div className="col-span-2">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Notes</span>
                  <p className="text-stone-700 dark:text-stone-300 italic">{form.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              shape="pill"
              disabled={ui.isSubmitting}
              onClick={() => setStep('form')}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="amber"
              shape="pill"
              disabled={ui.isSubmitting}
              onClick={handleConfirmSubmit}
            >
              {ui.isSubmitting ? 'Saving...' : 'Confirm Salary Adjustment'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
