import { CompensationPlanningOverview } from "@/components/CompensationPlanningOverview";
import { getAllCompensationPlans } from "@/lib/compensationPlanningService";

export const metadata = {
  title: "Compensation Planning & Budget - ACME Salary Management System",
  description: "Annual fiscal budget planning, department allocations, and salary increase workflows.",
};

export const revalidate = 0;

export default async function CompensationPlanningPage() {
  let initialPlans = [];
  try {
    initialPlans = await getAllCompensationPlans();
  } catch (error) {
    console.error("Failed to load initial compensation plans server-side:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CompensationPlanningOverview initialPlans={initialPlans} />
    </div>
  );
}
