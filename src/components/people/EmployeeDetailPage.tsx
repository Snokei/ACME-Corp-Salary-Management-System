'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Employee } from '@/types';
import { Avatar, Button, StatusBadge } from '@/components/ui';
import { SalaryAdjustmentModal } from '@/components/people/SalaryAdjustmentModal';
import { AddEmployeeModal } from '@/components/people/AddEmployeeModal';
import { getSalaryHistoryAction } from '@/actions/salaryAdjustments';
import { getCompensationAnalysisAction } from '@/actions/salaryBands';
import { CompensationAnalysisResult } from '@/lib/compaRatioService';
import {
  ArrowLeft,
  Plus,
  History,
  DollarSign,
  Tag,
  Calendar,
  MapPin,
  Briefcase,
  User,
  Star,
  Target,
  AlertTriangle,
  Edit2,
  Building,
  Mail,
  Award,
} from 'lucide-react';

export interface EmployeeDetailPageProps {
  initialEmployee: Employee;
}

export interface SalaryHistoryItem {
  id: string;
  employeeId: string;
  amount: number;
  currency: string;
  amountUSD: number;
  effectiveDate: string | Date;
  reason: string;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string | Date;
}

const VERIFIED_AVATAR_SEEDS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&h=120&q=80',
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=120&h=120&q=80',
];

function getEmployeeAvatar(emp: Employee): string {
  if (emp.avatarUrl && emp.avatarUrl.startsWith('http') && !emp.avatarUrl.includes('photo-NaN')) {
    return emp.avatarUrl;
  }
  const key = `${emp.id || ''}${emp.firstName || ''}${emp.lastName || ''}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % VERIFIED_AVATAR_SEEDS.length;
  return VERIFIED_AVATAR_SEEDS[index];
}

export function EmployeeDetailPage({ initialEmployee }: EmployeeDetailPageProps) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee>(initialEmployee);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [compAnalysis, setCompAnalysis] = useState<CompensationAnalysisResult | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(true);

  // Sync initial employee state
  useEffect(() => {
    setEmployee(initialEmployee);
  }, [initialEmployee]);

  // Load Salary History
  const loadSalaryHistory = async () => {
    if (!employee.id) return;
    setLoadingHistory(true);
    try {
      const res = await getSalaryHistoryAction(employee.id);
      if (res.success && res.history) {
        setSalaryHistory(res.history as SalaryHistoryItem[]);
      } else {
        setSalaryHistory([]);
      }
    } catch (err) {
      console.error('Failed to load salary history:', err);
      setSalaryHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadSalaryHistory();
  }, [employee.id]);

  // Load Compensation Analysis
  useEffect(() => {
    if (employee) {
      const salary = employee.baseSalaryUSD ?? employee.baseSalary ?? 0;
      setLoadingAnalysis(true);
      getCompensationAnalysisAction(salary, employee.payGrade || 'L4', employee.currency || 'USD')
        .then((res) => {
          if (res.success && res.analysis) {
            setCompAnalysis(res.analysis);
          } else {
            setCompAnalysis(null);
          }
        })
        .catch((err) => {
          console.error('Failed to load compensation analysis:', err);
          setCompAnalysis(null);
        })
        .finally(() => setLoadingAnalysis(false));
    }
  }, [employee.id, employee.baseSalary, employee.baseSalaryUSD, employee.payGrade, employee.currency]);

  const handleAdjustmentSuccess = async () => {
    if (employee.id) {
      setLoadingHistory(true);
      try {
        const res = await getSalaryHistoryAction(employee.id);
        if (res.success && res.history && res.history.length > 0) {
          setSalaryHistory(res.history as SalaryHistoryItem[]);
          const latest = res.history[0];
          const updated = {
            ...employee,
            baseSalary: latest.amount,
            baseSalaryUSD: latest.amountUSD || latest.amount,
          };
          setEmployee(updated);
        }
      } catch (err) {
        console.error('Error refreshing salary history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    router.refresh();
  };

  const handleEmployeeUpdated = (updatedEmp: Employee) => {
    setEmployee(updatedEmp);
    router.refresh();
  };

  const avatar = getEmployeeAvatar(employee);
  const fallbackAvatar = `https://ui-avatars.com/api/?background=f5c242&color=18181b&bold=true&name=${encodeURIComponent(
    employee.firstName + ' ' + employee.lastName
  )}`;

  const currentSalaryAmount = employee.baseSalaryUSD ?? employee.baseSalary ?? 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Navigation & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
            <Link
              href="/people"
              className="inline-flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              People Directory
            </Link>
            <span>/</span>
            <span className="font-mono text-stone-700 dark:text-stone-300 font-semibold">
              {employee.employeeId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
            Employee Profile
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            shape="pill"
            leftIcon={<Edit2 className="w-4 h-4" />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
          <Button
            variant="amber"
            shape="pill"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAdjustmentModalOpen(true)}
          >
            Add Salary Adjustment
          </Button>
        </div>
      </div>

      {/* Main Profile Hero Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <Avatar
              src={avatar}
              fallbackSrc={fallbackAvatar}
              alt={`${employee.firstName} ${employee.lastName}`}
              size={96}
              priority
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-amber-400/60 shadow-md shrink-0 bg-stone-100 dark:bg-stone-800"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {employee.employeeId}
                </span>
                <StatusBadge status={employee.status || 'Active'} />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                  Pay Grade {employee.payGrade || 'L4'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-stone-400 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                  {employee.role}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-500" />
                  {employee.department}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  {employee.email}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-center w-full md:min-w-[220px] md:w-auto">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
              Total Base Compensation
            </span>
            <div className="text-2xl font-black text-stone-900 dark:text-white mt-0.5">
              ${currentSalaryAmount.toLocaleString('en-US')}{' '}
              <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
                {employee.currency || 'USD'} / yr
              </span>
            </div>
            {employee.bonusUSD ? (
              <div className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                Target Bonus: <strong className="text-stone-900 dark:text-white">${employee.bonusUSD.toLocaleString()} USD</strong>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Grid: Left column (Details & Compensation Band), Right Column (Salary History) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: 2 Columns on desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Info Grid Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <User className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Employment & Personal Details
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">
                  Employee ID
                </span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {employee.employeeId}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">
                  Hire Date
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {employee.hireDate
                    ? new Date(employee.hireDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">
                  Department
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {employee.department}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">
                  Location
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  {employee.city ? `${employee.city}, ${employee.country}` : employee.country}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">
                  Gender
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 capitalize">
                  {employee.gender || 'Not Specified'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800/80 space-y-1">
                <span className="text-stone-400 text-[10px] uppercase font-bold block">
                  Performance Rating
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {employee.performanceRating ? `${employee.performanceRating} / 5` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Salary Band & Compa-Ratio Position Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Salary Band & Compa-Ratio Analysis
                </h3>
              </div>
              {compAnalysis?.hasBand && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    compAnalysis.status === 'Within Band'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : compAnalysis.status === 'Below Band'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {compAnalysis.status}
                </span>
              )}
            </div>

            {loadingAnalysis ? (
              <div className="py-8 text-center text-xs text-stone-400 animate-pulse">
                Analyzing salary band position and compa-ratio...
              </div>
            ) : !compAnalysis?.hasBand || !compAnalysis.band ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                <span>
                  No configured salary band found for Pay Grade <strong>{employee.payGrade || 'N/A'}</strong> ({employee.currency || 'USD'}). Configure salary bands to see position analysis.
                </span>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Min Salary</span>
                    <span className="font-extrabold text-stone-900 dark:text-stone-100 text-sm mt-0.5 block">
                      ${compAnalysis.band.minSalary.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Midpoint</span>
                    <span className="font-extrabold text-stone-900 dark:text-stone-100 text-sm mt-0.5 block">
                      ${compAnalysis.band.midpointSalary.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Max Salary</span>
                    <span className="font-extrabold text-stone-900 dark:text-stone-100 text-sm mt-0.5 block">
                      ${compAnalysis.band.maxSalary.toLocaleString('en-US')}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/40">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block uppercase font-bold">Compa-Ratio</span>
                    <span className="font-black text-amber-700 dark:text-amber-300 text-base mt-0.5 block">
                      {compAnalysis.compaRatio !== null ? `${compAnalysis.compaRatio.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Range Bar Indicator */}
                <div className="space-y-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-300">
                    <span>Position in Band: <strong className="text-stone-900 dark:text-white">{compAnalysis.displayPosition}</strong></span>
                    <span>Pay Grade {compAnalysis.band.payGrade} ({compAnalysis.band.currency})</span>
                  </div>

                  <div className="relative w-full h-4 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        compAnalysis.status === 'Within Band'
                          ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                          : compAnalysis.status === 'Below Band'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${compAnalysis.visualPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>${compAnalysis.band.minSalary.toLocaleString()}</span>
                    <span>Mid: ${compAnalysis.band.midpointSalary.toLocaleString()}</span>
                    <span>${compAnalysis.band.maxSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Salary History Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Salary History
                </h3>
              </div>
            </div>

            {loadingHistory ? (
              <div className="py-8 text-center text-xs text-stone-400 animate-pulse">
                Loading compensation history...
              </div>
            ) : salaryHistory.length === 0 ? (
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800 text-center text-xs text-stone-400 space-y-2">
                <p>No previous salary adjustments recorded yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  shape="pill"
                  onClick={() => setIsAdjustmentModalOpen(true)}
                >
                  Create First Adjustment
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {salaryHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 hover:border-amber-500/40 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="font-extrabold text-stone-900 dark:text-white text-sm">
                        ${item.amount.toLocaleString('en-US')} {item.currency || 'USD'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full text-[10px]">
                        <Tag className="w-2.5 h-2.5" />
                        {item.reason}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {new Date(item.effectiveDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {item.createdBy && <span className="text-[10px]">By {item.createdBy}</span>}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 italic pt-0.5 border-t border-stone-200/50 dark:border-stone-700/50">
                        &quot;{item.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Salary Adjustment Form Modal */}
      <SalaryAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        employee={employee}
        onSuccess={handleAdjustmentSuccess}
      />

      {/* Edit Employee Details Modal */}
      <AddEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={employee}
        onSuccess={() => {
          setIsEditModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
