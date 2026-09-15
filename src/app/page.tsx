'use client';

import React, { useState } from 'react';
import { HeaderNav } from '@/components/HeaderNav';
import { DashboardView } from '@/components/DashboardView';
import { EmployeesView } from '@/components/EmployeesView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'people' | 'salary' | 'reviews' | 'leaves' | 'payroll' | 'settings'>('dashboard');

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0C0F14] text-stone-900 dark:text-stone-100 transition-colors duration-300 relative overflow-x-hidden p-3 md:p-6 lg:p-8">
      {/* Warm ambient corner glow matching screenshot aesthetic */}
      <div className="fixed top-0 right-0 w-[500px] h-[400px] bg-gradient-to-b from-amber-200/40 via-amber-100/20 to-transparent dark:from-amber-500/10 dark:via-amber-500/5 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-t from-stone-200/40 to-transparent dark:from-stone-900/40 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-0"></div>

      {/* Main Container Card */}
      <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
        {/* Navigation Bar */}
        <HeaderNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* View Switcher */}
        <main className="transition-all duration-300">
          {activeTab === 'dashboard' && (
            <DashboardView onNavigateToPeople={() => setActiveTab('people')} />
          )}

          {(activeTab === 'people' || activeTab === 'salary' || activeTab === 'payroll' || activeTab === 'reviews' || activeTab === 'leaves' || activeTab === 'settings') && (
            <EmployeesView />
          )}
        </main>
      </div>
    </div>
  );
}
