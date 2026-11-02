'use client';

import { useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Loader2,
  X,
  SearchX,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getColumnValue, resultRange } from '@/lib/utils/table';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  onCreate?: () => void;
  createLabel?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  refreshing = false,
  error = null,
  pagination,
  onPageChange,
  onSortChange,
  onSearchChange,
  searchValue,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data found',
  onRetry,
  onCreate,
  createLabel = 'Add a record',
  className,
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localSearchQuery, setSearchQuery] = useState('');
  const searchQuery = searchValue ?? localSearchQuery;
  const searchInput = useRef<HTMLInputElement>(null);
  const range = pagination
    ? resultRange(pagination.page, pagination.limit, pagination.total, data.length)
    : resultRange(1, data.length, data.length, data.length);

  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;

    let newSortOrder: 'asc' | 'desc' = 'asc';
    if (sortBy === columnKey) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }

    setSortBy(columnKey);
    setSortOrder(newSortOrder);
    onSortChange(columnKey, newSortOrder);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className={cn('space-y-4 rounded-xl border bg-white p-4 sm:p-5', className)}>
      {/* Search */}
      {onSearchChange && (
        <div role="search" className="relative max-w-md">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <Input
            ref={searchInput}
            type="search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              className="absolute right-1 top-1 h-8 w-8"
              onClick={() => {
                handleSearch('');
                searchInput.current?.focus();
              }}
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium text-red-900">
              {data.length > 0 ? 'Unable to refresh these records' : 'Unable to load these records'}
            </p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            {data.length > 0 && (
              <p className="mt-1 text-sm text-red-700">Your last loaded records are still shown.</p>
            )}
          </div>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} disabled={loading || refreshing}>
              <RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
        </div>
      )}

      {refreshing && !loading && data.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          Refreshing results...
        </div>
      )}

      {/* Table */}
      {(!error || data.length > 0) && (
        <div className="overflow-hidden rounded-lg border">
          <Table aria-busy={loading || refreshing}>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key as string}
                    className={column.className}
                    aria-sort={
                      sortBy === column.key
                        ? sortOrder === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {column.sortable && onSortChange ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={loading || refreshing}
                        className="h-auto py-2 px-0 font-medium"
                        onClick={() => handleSort(column.key as string)}
                      >
                        {column.header}
                        <span className="ml-2">{renderSortIcon(column.key as string)}</span>
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading || (refreshing && data.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin" />
                      <span role="status" className="ml-2">
                        {loading ? 'Loading records...' : 'Updating results...'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-8">
                      <span className="rounded-full bg-slate-100 p-3 text-slate-500">
                        <SearchX aria-hidden="true" className="h-6 w-6" />
                      </span>
                      <p className="font-medium text-slate-900">
                        {searchQuery.trim() ? 'No matching records' : emptyMessage}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery.trim()
                          ? 'Try a different search or clear it to see all records.'
                          : 'Keep your relationships in one place. Add a record to get started.'}
                      </p>
                      {searchQuery.trim() ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleSearch('');
                            searchInput.current?.focus();
                          }}
                        >
                          Clear search
                        </Button>
                      ) : (
                        onCreate && (
                          <Button onClick={onCreate}>
                            <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
                            {createLabel}
                          </Button>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={String(getColumnValue(item, 'id') ?? index)}>
                    {columns.map((column) => {
                      const value = getColumnValue(item, column.key as string);
                      return (
                        <TableCell key={column.key as string} className={column.className}>
                          {column.render ? column.render(value, item) : String(value ?? '')}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!error && !loading && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
            {refreshing
              ? 'Updating result count...'
              : range.total === 0
                ? '0 results'
                : `Showing ${range.start}–${range.end} of ${range.total} results`}
          </div>

          {pagination && onPageChange && pagination.totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="First page"
                onClick={() => onPageChange(1)}
                disabled={refreshing || pagination.page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Previous page"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={refreshing || pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                aria-label="Next page"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={refreshing || pagination.page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Last page"
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={refreshing || pagination.page === pagination.totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
