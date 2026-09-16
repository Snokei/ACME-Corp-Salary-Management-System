'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button, Input, SearchableSelect } from '@/components/ui';
import { Search } from 'lucide-react';

export function SalaryBandsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();

  const currentSearch = nextSearchParams.get('search') || '';
  const currentCurrency = nextSearchParams.get('currency') || 'All';

  const [search, setSearch] = useState<string>(currentSearch);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
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

  const handleClear = () => {
    setSearch('');
    const params = new URLSearchParams(nextSearchParams.toString());
    params.delete('search');
    params.delete('currency');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = Boolean(search.trim() || currentCurrency !== 'All');

  return (
    <form onSubmit={handleSearchSubmit} className="relative z-20 p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
      <div className="flex-1 max-w-xl flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        <div className="flex-1 max-w-md flex items-center gap-2">
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
  );
}
