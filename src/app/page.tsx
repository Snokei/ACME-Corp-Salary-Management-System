import { DashboardView } from "@/components/dashboard/DashboardView";
import { getDashboardData } from "@/lib/dashboardData";
import { getCurrentUserAction } from "@/actions/auth";

export const metadata = {
  title: "Dashboard - ACME Salary Management System",
  description: "Overview of ACME Salary Management System",
};
export default async function HomePage() {
  // Fetch dashboard data and the session user on the server. Passing the user
  // down as a prop lets a Server Action (updateUserAction) revalidate this
  // route and instantly re-render the greeting after a profile save.
  const [data, currentUser] = await Promise.all([
    getDashboardData(),
    getCurrentUserAction(),
  ]);
  return <DashboardView initialData={data} currentUser={currentUser} />;
}
