import { notFound } from "next/navigation";
import { CompensationPlanDetailView } from "@/components/planning/CompensationPlanDetailView";
import { getCompensationPlanById } from "@/lib/compensationPlanningService";

export const metadata = {
  title: "Compensation Plan Details - ACME Salary Management System",
  description: "Manage employee proposals, department allocations, and compensation scenarios.",
};

export const revalidate = 0;

export default async function CompensationPlanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let plan = null;
  try {
    plan = await getCompensationPlanById(params.id);
  } catch (error) {
    console.error(`Failed to load compensation plan ${params.id} server-side:`, error);
  }

  if (!plan) {
    notFound();
  }

  return <CompensationPlanDetailView initialPlan={plan} />;
}
