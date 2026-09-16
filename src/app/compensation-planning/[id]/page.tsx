import { notFound } from "next/navigation";
import { CompensationPlanDetailView } from "@/components/CompensationPlanDetailView";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CompensationPlanDetailView initialPlan={plan} />
    </div>
  );
}
