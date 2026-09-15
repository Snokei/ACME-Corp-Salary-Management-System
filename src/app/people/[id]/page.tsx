import { Suspense } from 'react';
import Link from 'next/link';
import { getEmployeeById } from '@/lib/employeeData';
import { EmployeeDetailPage } from '@/components/EmployeeDetailPage';
import { ArrowLeft, UserX } from 'lucide-react';
import { Button } from '@/components/ui';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EmployeePage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const employeeId = resolvedParams?.id;

  const employee = await getEmployeeById(employeeId);

  if (!employee) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <UserX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
            Employee Not Found
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            We couldn&apos;t find an employee with ID &quot;{employeeId}&quot;. The employee may have been deleted or the ID in the URL is incorrect.
          </p>
        </div>

        <div>
          <Link href="/people">
            <Button variant="amber" shape="pill" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to People Directory
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-stone-500 text-sm">
            <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Loading Employee Profile...</span>
          </div>
        </div>
      }
    >
      <EmployeeDetailPage initialEmployee={employee} />
    </Suspense>
  );
}
