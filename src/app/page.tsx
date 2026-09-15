'use client';

import React from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Building2, Users, DollarSign, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen p-6 md:p-12 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              ACME Corp Salary Management System
            </h1>
            <p className="text-sm text-slate-400">
              Enterprise HR Compensation Intelligence Platform • 10,000 Global Employees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Preview Card */}
      <main className="glass-panel p-8 rounded-2xl space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Theme System Active
        </div>

        <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Craftsperson-Grade HR Analytics Architecture
        </h2>

        <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Glassmorphism design system initialized with Light & Dark mode support, custom design tokens, micro-animations, and responsive layout context.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
          <div className="glass-card p-6 rounded-xl space-y-2">
            <div className="flex items-center gap-3 text-sky-400 font-semibold">
              <Users className="w-5 h-5" /> 10,000 Employees
            </div>
            <p className="text-xs text-slate-400">
              Indexed SQLite dataset with fast sub-50ms pagination and multi-column debounced filtering.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-2">
            <div className="flex items-center gap-3 text-emerald-400 font-semibold">
              <DollarSign className="w-5 h-5" /> Salary Analytics
            </div>
            <p className="text-xs text-slate-400">
              Real-time USD normalization, median salary calculations, bonus distribution & pay equity insights.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-2">
            <div className="flex items-center gap-3 text-indigo-400 font-semibold">
              <Sparkles className="w-5 h-5" /> Vitest & Layered Design
            </div>
            <p className="text-xs text-slate-400">
              Clean architecture (Controller → Service → Repository) with fast, deterministic unit test coverage.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
