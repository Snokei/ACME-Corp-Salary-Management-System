'use client';

import React, { useState, useEffect } from 'react';
import { Employee } from '@/types';
import { Modal, Button, Input, Select } from '@/components/ui';
import { SALARY_ADJUSTMENT_REASONS, calculateSalaryChange } from '@/lib/salaryAdjustmentService';
import { createSalaryAdjustmentAction } from '@/actions/salaryAdjustments';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Tag, AlertTriangle, FileText } from 'lucide-react';

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
  const [newSalary, setNewSalary] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  const [reason, setReason] = useState<string>('Annual Increase');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ newSalary?: string; effectiveDate?: string; reason?: string }>({});

  useEffect(() => {
    if (isOpen && employee) {
      setStep('form');
      setNewSalary('');
      const today = new Date().toISOString().split('T')[0];
      setEffectiveDate(today);
      setReason('Annual Increase');
      setNotes('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, employee]);

  if (!employee) return null;

  const currentSalary = employee.baseSalaryUSD ?? employee.baseSalary ?? 0;
  const numericNewSalary = parseFloat(newSalary);
  const isValidNewSalary = !isNaN(numericNewSalary) && numericNewSalary > 0;

  const { change, percentage } = isValidNewSalary
    ? calculateSalaryChange(currentSalary, numericNewSalary)
    : { change: 0, percentage: 0 };

  const isDecrease = change < 0;

  const validateForm = () => {
    const newErrors: { newSalary?: string; effectiveDate?: string; reason?: string } = {};

    if (!newSalary || isNaN(numericNewSalary)) {
      newErrors.newSalary = 'New salary is required and must be a valid number';
    } else if (numericNewSalary <= 0) {
      newErrors.newSalary = 'New salary must be greater than 0';
    }

    if (!effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }

    if (!reason || !reason.trim()) {
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
    if (isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading('Applying salary adjustment...');

    try {
      const res = await createSalaryAdjustmentAction(employee.id, {
        amount: numericNewSalary,
        currency: employee.currency || 'USD',
        amountUSD: numericNewSalary, // Assuming 1:1 or USD standard
        effectiveDate,
        reason,
        notes,
      });

      if (res.success) {
        toast.success('Salary adjustment applied successfully!', { id: toastId });
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'Failed to apply salary adjustment', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
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
                value={newSalary}
                onChange={(e) => {
                  setNewSalary(e.target.value);
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
                value={effectiveDate}
                onChange={(e) => {
                  setEffectiveDate(e.target.value);
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
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

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
                  {reason}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-1">
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
                  {new Date(effectiveDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {notes && (
                <div className="col-span-2">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Notes</span>
                  <p className="text-stone-700 dark:text-stone-300 italic">{notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              shape="pill"
              disabled={isSubmitting}
              onClick={() => setStep('form')}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="amber"
              shape="pill"
              disabled={isSubmitting}
              onClick={handleConfirmSubmit}
            >
              {isSubmitting ? 'Saving...' : 'Confirm Salary Adjustment'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
