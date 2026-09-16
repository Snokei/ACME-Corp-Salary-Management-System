'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SearchableSelect } from '@/components/ui';
import { SalaryBandData } from '@/lib/compaRatioService';
import { createSalaryBandAction, updateSalaryBandAction } from '@/actions/salaryBands';
import toast from 'react-hot-toast';
import { DollarSign, Tag, Layers } from 'lucide-react';

export interface SalaryBandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  band: SalaryBandData | null;
  onSuccess: () => void;
}

export function SalaryBandsModal({
  isOpen,
  onClose,
  band,
  onSuccess,
}: SalaryBandsModalProps) {
  const [payGrade, setPayGrade] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [minSalary, setMinSalary] = useState<string>('');
  const [midpointSalary, setMidpointSalary] = useState<string>('');
  const [maxSalary, setMaxSalary] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (band) {
        setPayGrade(band.payGrade);
        setCurrency(band.currency || 'USD');
        setMinSalary(String(band.minSalary));
        setMidpointSalary(String(band.midpointSalary));
        setMaxSalary(String(band.maxSalary));
      } else {
        setPayGrade('L4');
        setCurrency('USD');
        setMinSalary('');
        setMidpointSalary('');
        setMaxSalary('');
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, band]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!payGrade || !payGrade.trim()) {
      errs.payGrade = 'Pay grade is required';
    }

    const min = parseFloat(minSalary);
    const mid = parseFloat(midpointSalary);
    const max = parseFloat(maxSalary);

    if (isNaN(min) || min <= 0) {
      errs.minSalary = 'Minimum salary must be a positive number';
    }
    if (isNaN(mid) || mid <= 0) {
      errs.midpointSalary = 'Midpoint salary must be a positive number';
    }
    if (isNaN(max) || max <= 0) {
      errs.maxSalary = 'Maximum salary must be a positive number';
    }

    if (!errs.minSalary && !errs.midpointSalary && min >= mid) {
      errs.minSalary = 'Min salary must be less than midpoint salary';
    }
    if (!errs.midpointSalary && !errs.maxSalary && mid >= max) {
      errs.midpointSalary = 'Midpoint salary must be less than max salary';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading(band ? 'Updating salary band...' : 'Creating salary band...');

    try {
      const payload = {
        payGrade,
        currency,
        minSalary: parseFloat(minSalary),
        midpointSalary: parseFloat(midpointSalary),
        maxSalary: parseFloat(maxSalary),
      };

      const res = band?.id
        ? await updateSalaryBandAction(band.id, payload)
        : await createSalaryBandAction(payload);

      if (res.success) {
        toast.success(`Salary band ${band ? 'updated' : 'created'} successfully!`, { id: toastId });
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'Operation failed', { id: toastId });
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
      title={band ? `Edit Salary Band (${band.payGrade})` : 'Add New Salary Band'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Pay Grade"
              placeholder="e.g. L4 or P4"
              value={payGrade}
              onChange={(e) => {
                setPayGrade(e.target.value);
                if (errors.payGrade) {
                  const { payGrade: _, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              error={errors.payGrade}
              required
              leftIcon={<Tag className="w-3.5 h-3.5 text-stone-400" />}
            />
          </div>

          <div>
            <SearchableSelect
              name="currency"
              label="Currency"
              options={['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD']}
              value={currency}
              shape="rounded"
              onChange={(val) => setCurrency(val)}
            />
          </div>
        </div>

        <div>
          <Input
            label="Minimum Salary ($)"
            type="number"
            step="any"
            placeholder="e.g. 90000"
            value={minSalary}
            onChange={(e) => {
              setMinSalary(e.target.value);
              if (errors.minSalary) {
                const { minSalary: _, ...rest } = errors;
                setErrors(rest);
              }
            }}
            error={errors.minSalary}
            required
            leftIcon={<DollarSign className="w-3.5 h-3.5 text-stone-400" />}
          />
        </div>

        <div>
          <Input
            label="Midpoint Salary ($)"
            type="number"
            step="any"
            placeholder="e.g. 120000"
            value={midpointSalary}
            onChange={(e) => {
              setMidpointSalary(e.target.value);
              if (errors.midpointSalary) {
                const { midpointSalary: _, ...rest } = errors;
                setErrors(rest);
              }
            }}
            error={errors.midpointSalary}
            required
            leftIcon={<DollarSign className="w-3.5 h-3.5 text-stone-400" />}
          />
        </div>

        <div>
          <Input
            label="Maximum Salary ($)"
            type="number"
            step="any"
            placeholder="e.g. 150000"
            value={maxSalary}
            onChange={(e) => {
              setMaxSalary(e.target.value);
              if (errors.maxSalary) {
                const { maxSalary: _, ...rest } = errors;
                setErrors(rest);
              }
            }}
            error={errors.maxSalary}
            required
            leftIcon={<DollarSign className="w-3.5 h-3.5 text-stone-400" />}
          />
        </div>

        {/* Live Band Preview */}
        {minSalary && midpointSalary && maxSalary && (
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
              Band Range Summary
            </span>
            <div className="flex justify-between text-xs font-semibold text-stone-800 dark:text-stone-200">
              <span>Min: ${parseFloat(minSalary || '0').toLocaleString()}</span>
              <span className="text-amber-600 dark:text-amber-400">Mid: ${parseFloat(midpointSalary || '0').toLocaleString()}</span>
              <span>Max: ${parseFloat(maxSalary || '0').toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" shape="pill" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="amber" shape="pill" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : band ? 'Save Changes' : 'Create Salary Band'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
