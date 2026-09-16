'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Input, Table, SearchableSelect } from '@/components/ui';
import { SalaryBandsModal } from '@/components/salary-bands/SalaryBandsModal';
import { SalaryBandData } from '@/lib/compaRatioService';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, Search, Edit2, Layers, Banknote } from 'lucide-react';

export interface SalaryBandsResponseData {
  bands: SalaryBandData[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SalaryBandsViewProps {
  data?: SalaryBandsResponseData;
  initialBands?: SalaryBandData[];
  searchParams?: {
    search?: string;
    currency?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
}

export function SalaryBandsView({ data, initialBands, searchParams = {} }: SalaryBandsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  const bands = data?.bands || initialBands || [];
  const total = data?.total ?? bands.length;
  const page = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = 10;

  const currentSearch = searchParams.search || nextSearchParams.get('search') || '';
  const currentCurrency = searchParams.currency || nextSearchParams.get('currency') || 'All';
  const sortBy = searchParams.sortBy || nextSearchParams.get('sortBy') || '';
  const sortOrder = (searchParams.sortOrder || nextSearchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

  const [search, setSearch] = useState<string>(currentSearch);
  const [modalState, setModalState] = useState<{ isOpen: boolean; band: SalaryBandData | null }>({
    isOpen: false,
    band: null,
  });

  const handleSort = (field: string) => {
    const params = new URLSearchParams(nextSearchParams.toString());
    if (sortBy === field) {
      if (sortOrder === 'asc') {
        params.set('sortOrder', 'desc');
      } else {
        params.delete('sortBy');
        params.delete('sortOrder');
      }
    } else {
      params.set('sortBy', field);
      params.set('sortOrder', 'asc');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    const params = new URLSearchParams(nextSearchParams.toString());
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCurrencyChange = (curr: string) => {
    const params = new URLSearchParams(nextSearchParams.toString());
    if (curr && curr !== 'All') {
      params.set('currency', curr);
    } else {
      params.delete('currency');
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(nextSearchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClear = () => {
    setSearch('');
    const params = new URLSearchParams(nextSearchParams.toString());
    params.delete('search');
    params.delete('currency');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = Boolean(search.trim() || currentCurrency !== 'All');

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Salary Bands"
        description="Manage compensation structures, pay grade salary ranges, and midpoint targets."
        icon={Banknote}
      >
        <Button
          variant="primary"
          shape="pill"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setModalState({ isOpen: true, band: null })}
        >
          Add Salary Band
        </Button>
      </PageHeader>

      {/* Filter / Search Bar - with white bg container */}
      <form onSubmit={handleSearchSubmit} className="relative z-20 p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-md">
            <Input
              placeholder="Search by pay grade or currency..."
              shape="pill"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-stone-400" />}
              containerClassName="w-full"
            />
            <Button type="submit" variant="primary" size="md" shape="pill">
              Search
            </Button>
          </div>

          <SearchableSelect
            name="currency"
            options={['All', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']}
            value={currentCurrency}
            placeholder="All Currencies"
            shape="pill"
            containerClassName="w-36"
            onChange={handleCurrencyChange}
          />

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              shape="pill"
              onClick={handleClear}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Salary Bands Table inside TableContainer matching People module */}
      <Table.Container className="relative z-10">
        <Table>
          <Table.Header>
            <Table.Row hoverable={false}>
              <Table.Head
                sortable
                sorted={sortBy === 'payGrade' ? (sortOrder as 'asc' | 'desc') : false}
                onSort={() => handleSort('payGrade')}
              >
                Pay Grade
              </Table.Head>
              <Table.Head>Currency</Table.Head>
              <Table.Head
                sortable
                sorted={sortBy === 'minSalary' ? (sortOrder as 'asc' | 'desc') : false}
                onSort={() => handleSort('minSalary')}
              >
                Minimum Salary
              </Table.Head>
              <Table.Head
                sortable
                sorted={sortBy === 'midpointSalary' ? (sortOrder as 'asc' | 'desc') : false}
                onSort={() => handleSort('midpointSalary')}
              >
                Midpoint Salary
              </Table.Head>
              <Table.Head
                sortable
                sorted={sortBy === 'maxSalary' ? (sortOrder as 'asc' | 'desc') : false}
                onSort={() => handleSort('maxSalary')}
              >
                Maximum Salary
              </Table.Head>
              <Table.Head>Spread Range</Table.Head>
              <Table.Head align="center" className="text-center">Action</Table.Head>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {bands.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7} className="text-center py-12 text-stone-400 dark:text-stone-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 text-stone-300 dark:text-stone-600" />
                    <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No salary bands found</p>
                    {search && <p className="text-xs text-stone-400">Try adjusting your search query &quot;{search}&quot;</p>}
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              bands.map((band) => {
                const spread = band.maxSalary - band.minSalary;
                return (
                  <Table.Row key={band.id || `${band.payGrade}-${band.currency}`} hoverable>
                    <Table.Cell>
                      <span className="font-bold text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20">
                        {band.payGrade}
                      </span>
                    </Table.Cell>

                    <Table.Cell className="font-mono text-xs font-semibold text-stone-600 dark:text-stone-300">
                      {band.currency}
                    </Table.Cell>

                    <Table.Cell className="font-semibold text-stone-800 dark:text-stone-100 text-xs">
                      ${band.minSalary.toLocaleString('en-US')}
                    </Table.Cell>

                    <Table.Cell className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                      ${band.midpointSalary.toLocaleString('en-US')}
                    </Table.Cell>

                    <Table.Cell className="font-semibold text-stone-800 dark:text-stone-100 text-xs">
                      ${band.maxSalary.toLocaleString('en-US')}
                    </Table.Cell>

                    <Table.Cell className="text-xs text-stone-500 dark:text-stone-400">
                      ${spread.toLocaleString('en-US')}
                    </Table.Cell>

                    <Table.Cell align="center">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          shape="circle"
                          size="sm"
                          title="Edit Band"
                          aria-label={`Edit ${band.payGrade} band`}
                          className="hover:bg-amber-300/40 dark:hover:bg-amber-500/20 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 font-medium"
                          onClick={() => setModalState({ isOpen: true, band })}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>

        <Table.Pagination
          page={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          itemLabel="salary bands"
        />
      </Table.Container>

      {/* Add / Edit Salary Bands Modal */}
      <SalaryBandsModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, band: null })}
        band={modalState.band}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
