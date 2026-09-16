import React from 'react';
import { getAllCompensationPlans } from "@/lib/compensationPlanningService";
import { CompensationPlanningOverview } from "@/components/planning/CompensationPlanningOverview";

export async function PlanningDataFetcher() {
  const initialPlans = await getAllCompensationPlans();
  return <CompensationPlanningOverview initialPlans={initialPlans} />;
}
