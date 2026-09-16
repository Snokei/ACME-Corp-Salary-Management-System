'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui';
import { Briefcase, Plus } from 'lucide-react';
import { usePlanningContext } from './PlanningProvider';

export function PlanningHeader() {
  const { setIsModalOpen } = usePlanningContext();

  return (
    <PageHeader
      title="Planning & Budget"
      description="Create fiscal year budgets, allocate compensation pools across departments, plan employee salary increases, and model scenarios."
      icon={Briefcase}
    >
      <Button
        variant="primary"
        shape="pill"
        size="md"
        onClick={() => setIsModalOpen(true)}
        leftIcon={<Plus className="w-4 h-4" />}
      >
        Create Compensation Plan
      </Button>
    </PageHeader>
  );
}
