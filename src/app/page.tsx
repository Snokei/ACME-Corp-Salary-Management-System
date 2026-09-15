import { DashboardView } from "@/components/DashboardView";
import { getDashboardData } from "@/lib/dashboardData";

export default async function HomePage() {
  const data = await getDashboardData();
  return <DashboardView initialData={data} />;
}
