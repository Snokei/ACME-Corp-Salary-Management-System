import { DashboardView } from "@/components/dashboard/DashboardView";
import { getDashboardData } from "@/lib/dashboardData";

export const metadata = {
  title: "Dashboard - ACME Salary Management System",
  description: "Overview of ACME Salary Management System",
};
export default async function HomePage() {
  const data = await getDashboardData();
  return <DashboardView initialData={data} />;
}
