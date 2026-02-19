import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import { DataTableColumnHeader } from './components/DataTableColumnHeader';
import { DataTableEmpty } from './components/DataTableEmpty';
import { DataTablePagination } from './components/DataTablePagination';
import { DataTableToolbar } from './components/DataTableToolbar';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import { getSelectionColumn } from './utils';

// Mock data types
interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
}

// Mock data generator
function makePayments(count: number): Payment[] {
  const statuses: Payment['status'][] = ['pending', 'processing', 'success', 'failed'];
  const names = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry', 'iris', 'jack'];
  return Array.from({ length: count }, (_, i) => ({
    id: `PAY-${String(i + 1).padStart(4, '0')}`,
    amount: Math.round(Math.random() * 500 * 100) / 100,
    status: statuses[i % statuses.length],
    email: `${names[i % names.length]}@example.com`,
  }));
}

const payments = makePayments(42);

// Base columns without sorting
const baseColumns: ColumnDef<Payment, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <span className="font-medium">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant =
        status === 'success'
          ? 'default'
          : status === 'failed'
            ? 'destructive'
            : status === 'processing'
              ? 'secondary'
              : 'outline';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];

// Columns with sortable headers
const sortableColumns: ColumnDef<Payment, unknown>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant =
        status === 'success'
          ? 'default'
          : status === 'failed'
            ? 'destructive'
            : status === 'processing'
              ? 'secondary'
              : 'outline';
      return <Badge variant={variant}>{status}</Badge>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" className="justify-end" />,
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];

// Columns with row actions
const columnsWithActions: ColumnDef<Payment, unknown>[] = [
  ...sortableColumns,
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>View customer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>
      );
    },
  },
];

// Story wrapper components

const DefaultStory = () => {
  const { table } = useDataTable({ data: payments, columns: baseColumns });
  return <DataTable table={table} pagination={<DataTablePagination table={table} />} />;
};

const WithSortingStory = () => {
  const { table } = useDataTable({ data: payments, columns: sortableColumns });
  return <DataTable table={table} pagination={<DataTablePagination table={table} />} />;
};

const WithSearchStory = () => {
  const { table, globalFilter, setGlobalFilter } = useDataTable({ data: payments, columns: sortableColumns });
  return (
    <DataTable
      table={table}
      toolbar={
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder="Filter payments..."
        />
      }
      pagination={<DataTablePagination table={table} />}
    />
  );
};

const WithRowSelectionStory = () => {
  const { table } = useDataTable({
    data: payments,
    columns: [getSelectionColumn<Payment>(), ...sortableColumns],
    enableRowSelection: true,
  });
  return <DataTable table={table} pagination={<DataTablePagination table={table} showSelectedCount />} />;
};

const WithColumnVisibilityStory = () => {
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: payments,
    columns: sortableColumns,
    initialColumnVisibility: { status: false },
  });
  return (
    <DataTable
      table={table}
      toolbar={
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder="Filter payments..."
        />
      }
      pagination={<DataTablePagination table={table} />}
    />
  );
};

const EmptyStateStory = () => {
  const { table } = useDataTable({ data: [] as Payment[], columns: baseColumns });
  return (
    <DataTable
      table={table}
      emptyState={
        <DataTableEmpty
          title="No payments found"
          description="There are no payments to display yet."
          action={<Button size="sm">Create payment</Button>}
        />
      }
    />
  );
};

const LoadingStory = () => {
  const { table } = useDataTable({ data: [] as Payment[], columns: baseColumns });
  return <DataTable table={table} isLoading pagination={<DataTablePagination table={table} />} />;
};

const FullFeaturedStory = () => {
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: payments,
    columns: [getSelectionColumn<Payment>(), ...columnsWithActions],
    enableRowSelection: true,
  });
  return (
    <DataTable
      table={table}
      toolbar={
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder="Filter payments..."
        />
      }
      pagination={<DataTablePagination table={table} pageSizeOptions={[10, 20, 50, 100]} showSelectedCount />}
      emptyState={<DataTableEmpty title="No results" description="No payments match your search." />}
    />
  );
};

// Meta
const meta: Meta = {
  title: 'Components/DataTable',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

// Stories
export const Default: StoryObj = {
  render: () => <DefaultStory />,
};

export const WithSorting: StoryObj = {
  render: () => <WithSortingStory />,
};

export const WithSearch: StoryObj = {
  render: () => <WithSearchStory />,
};

export const WithRowSelection: StoryObj = {
  render: () => <WithRowSelectionStory />,
};

export const WithColumnVisibility: StoryObj = {
  render: () => <WithColumnVisibilityStory />,
};

export const EmptyState: StoryObj = {
  render: () => <EmptyStateStory />,
};

export const Loading: StoryObj = {
  render: () => <LoadingStory />,
};

export const FullFeatured: StoryObj = {
  render: () => <FullFeaturedStory />,
};
