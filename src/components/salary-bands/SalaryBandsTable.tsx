'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Table, Button } from '@/components/ui';
import { Edit2, Layers } from 'lucide-react';
import { SalaryBandsResponseData } from '@/components/salary-bands/SalaryBandsView';
import { useSalaryBands } from './SalaryBandsProvider';

interface SalaryBandsTableProps {
  data: SalaryBandsResponseData;
}

export function SalaryBandsTable({ data }: SalaryBandsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useSearchParams();
  const { setModalState } = useSalaryBands();

  const bands = data.bands;
  const total = data.total;
  const page = data.page;
  const totalPages = data.totalPages;
  const pageSize = 10;

  const sortBy = nextSearchParams.get('sortBy') || '';
  const sortOrder = (nextSearchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
  const search = nextSearchParams.get('search') || '';

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(nextSearchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
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
  );
}
