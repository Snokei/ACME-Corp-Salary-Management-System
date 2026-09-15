import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

/* ==========================================================================
   Table Container & Root
   ========================================================================== */
export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function TableContainer({
  children,
  className = '',
  glass = true,
  ...props
}: TableContainerProps) {
  const baseContainerStyle = glass
    ? 'bg-white/90 dark:bg-stone-900/90 rounded-3xl border border-stone-200/70 dark:border-stone-800 shadow-sm backdrop-blur-sm overflow-hidden'
    : 'bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden';

  return (
    <div className={`${baseContainerStyle} ${className}`} {...props}>
      {children}
    </div>
  );
}

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
}

export function Table({
  children,
  className = '',
  wrapperClassName = '',
  ...props
}: TableProps) {
  return (
    <div className={`overflow-x-auto ${wrapperClassName}`}>
      <table className={`w-full text-left border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

/* ==========================================================================
   Table Header & Head Cells
   ========================================================================== */
export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableHeader({ children, className = '', ...props }: TableHeaderProps) {
  return (
    <thead
      className={`border-b border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-stone-400 uppercase tracking-wider bg-stone-50/50 dark:bg-stone-900/50 ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | false;
  onSort?: () => void;
}

export function TableHead({
  children,
  className = '',
  align = 'left',
  sortable = false,
  sorted = false,
  onSort,
  ...props
}: TableHeadProps) {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <th
      className={`py-3.5 px-4 font-semibold ${alignClass} ${
        sortable ? 'cursor-pointer select-none hover:text-stone-600 dark:hover:text-stone-300' : ''
      } ${className}`}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div
        className={`inline-flex items-center gap-1.5 ${
          align === 'center' ? 'justify-center w-full' : align === 'right' ? 'justify-end w-full' : ''
        }`}
      >
        {children}
        {sortable && sorted && (
          <span className="text-amber-500 font-bold text-xs">
            {sorted === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
}

/* ==========================================================================
   Table Body & Row Cells
   ========================================================================== */
export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ children, className = '', ...props }: TableBodyProps) {
  return (
    <tbody
      className={`divide-y divide-stone-100 dark:divide-stone-800/60 text-xs ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  clickable?: boolean;
}

export function TableRow({
  children,
  className = '',
  selected = false,
  clickable = false,
  ...props
}: TableRowProps) {
  const stateClass = selected
    ? 'bg-amber-200/60 dark:bg-amber-400/20 font-medium text-stone-900 dark:text-stone-100 shadow-xs'
    : clickable
    ? 'hover:bg-amber-100/50 dark:hover:bg-amber-400/10 transition-colors duration-200'
    : '';

  return (
    <tr
      className={`transition-all duration-200 ${clickable ? 'cursor-pointer group' : ''} ${stateClass} ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export function TableCell({
  children,
  className = '',
  align = 'left',
  ...props
}: TableCellProps) {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <td className={`py-3 px-4 ${alignClass} ${className}`} {...props}>
      {children}
    </td>
  );
}

/* ==========================================================================
   Table Footer
   ========================================================================== */
export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export function TableFooter({ children, className = '', ...props }: TableFooterProps) {
  return (
    <tfoot
      className={`border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/40 dark:bg-stone-900/40 ${className}`}
      {...props}
    >
      {children}
    </tfoot>
  );
}

/* ==========================================================================
   Table Feedback States: Loading & Empty
   ========================================================================== */
export interface TableLoadingProps {
  colSpan: number;
  message?: string;
}

export function TableLoading({
  colSpan,
  message = 'Loading data...',
}: TableLoadingProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-stone-400">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent" />
        <p className="mt-2 text-xs font-medium text-stone-500 dark:text-stone-400">{message}</p>
      </td>
    </tr>
  );
}

export interface TableEmptyProps {
  colSpan: number;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function TableEmpty({
  colSpan,
  title = 'No records found',
  description = 'Try adjusting your search query or filters.',
  icon,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-stone-400 dark:text-stone-500">
        {icon && <div className="mb-2 flex justify-center text-stone-400">{icon}</div>}
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">{title}</p>
        {description && <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">{description}</p>}
      </td>
    </tr>
  );
}

/* ==========================================================================
   Table Pagination
   ========================================================================== */
export interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
}

export function TablePagination({
  page,
  totalPages,
  totalCount,
  pageSize = 10,
  onPageChange,
  itemLabel = 'records',
  className = '',
}: TablePaginationProps) {
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/40 dark:bg-stone-900/40 ${className}`}
    >
      <div className="text-xs text-stone-500 dark:text-stone-400">
        Showing <span className="font-semibold text-stone-800 dark:text-stone-200">{startItem}</span> to{' '}
        <span className="font-semibold text-stone-800 dark:text-stone-200">{endItem}</span> of{' '}
        <span className="font-semibold text-stone-800 dark:text-stone-200">{totalCount.toLocaleString()}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          shape="pill"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>
        <span className="text-xs font-semibold px-2 text-stone-800 dark:text-stone-200">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <Button
          variant="secondary"
          size="sm"
          shape="pill"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
