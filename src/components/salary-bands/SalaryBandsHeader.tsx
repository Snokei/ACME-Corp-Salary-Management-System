'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui';
import { Plus, Banknote } from 'lucide-react';
import { useSalaryBands } from './SalaryBandsProvider';

export function SalaryBandsHeader() {
  const { setModalState } = useSalaryBands();

  return (
    <PageHeader
      title="Salary Bands"
      description="Manage compensation structures, pay grade salary ranges, and midpoint targets."
      icon={Banknote}
    >
      <Button
        variant="primary"
        shape="pill"
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={() => setModalState({ isOpen: true, band: null })}
      >
        Add Salary Band
      </Button>
    </PageHeader>
  );
}
