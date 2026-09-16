import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-300">
      <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
      <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Loading module...</p>
    </div>
  );
}
