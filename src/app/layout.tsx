import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { HeaderNav } from '@/components/HeaderNav';

export const metadata: Metadata = {
  title: 'ACME Corp - Salary Management System',
  description: 'Enterprise HR Salary Analytics & Employee Management System for 10,000 global employees.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased bg-[#FBF9F5] dark:bg-[#0C0F14] text-stone-900 dark:text-stone-100 transition-colors duration-300 relative overflow-x-hidden">
        <ThemeProvider>
          {/* Warm ambient corner glow matching screenshot aesthetic */}
          <div className="fixed top-0 right-0 w-[500px] h-[400px] bg-gradient-to-b from-amber-200/40 via-amber-100/20 to-transparent dark:from-amber-500/10 dark:via-amber-500/5 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-0"></div>
          <div className="fixed bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-t from-stone-200/40 to-transparent dark:from-stone-900/40 dark:to-transparent rounded-full blur-3xl pointer-events-none -z-0"></div>

          {/* Main Layout Container */}
          <div className="relative z-10 max-w-[1400px] mx-auto p-3 md:p-6 lg:p-8 space-y-6">
            <HeaderNav />
            <main className="transition-all duration-300">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

