import { Suspense } from 'react';
import { EmployeesView } from '@/components/EmployeesView';

export default function PeoplePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-stone-500 text-sm">
            <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Loading People Directory...</span>
          </div>
        </div>
      }
    >
      <EmployeesView />
    </Suspense>
  );
}
