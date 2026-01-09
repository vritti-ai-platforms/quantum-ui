import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './DataTable';

// Sample data type
type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

// Sample data
const payments: Payment[] = [
  {
    id: '728ed52f',
    amount: 100,
    status: 'pending',
    email: 'm@example.com',
  },
  {
    id: '489e1d42',
    amount: 125,
    status: 'processing',
    email: 'example@gmail.com',
  },
  {
    id: 'a3b2c1d0',
    amount: 250,
    status: 'success',
    email: 'user@test.com',
  },
  {
    id: 'e4f5g6h7',
    amount: 75,
    status: 'failed',
    email: 'failed@example.com',
  },
  {
    id: 'i8j9k0l1',
    amount: 300,
    status: 'success',
    email: 'success@test.com',
  },
];

// Basic columns
const basicColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
];

// Formatted columns with custom cells
const formattedColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variantClass =
        status === 'success'
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : status === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : status === 'processing'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${variantClass}`}
        >
          {status}
        </span>
      );
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
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    enablePagination: {
      control: 'boolean',
      description: 'Enable pagination',
    },
    enableSorting: {
      control: 'boolean',
      description: 'Enable sorting',
    },
    enableFiltering: {
      control: 'boolean',
      description: 'Enable filtering',
    },
    enableColumnVisibility: {
      control: 'boolean',
      description: 'Enable column visibility toggle',
    },
    pageSize: {
      control: 'number',
      description: 'Number of rows per page',
    },
    emptyMessage: {
      control: 'text',
      description: 'Message to show when table is empty',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic table
export const Basic: Story = {
  args: {
    columns: basicColumns,
    data: payments,
    enablePagination: true,
    enableSorting: false,
    enableFiltering: false,
    enableColumnVisibility: false,
  },
};

// Formatted table with custom cells
export const Formatted: Story = {
  args: {
    columns: formattedColumns,
    data: payments,
    enablePagination: true,
    enableSorting: false,
    enableFiltering: false,
    enableColumnVisibility: false,
  },
};

// Table with sorting
export const WithSorting: Story = {
  args: {
    columns: formattedColumns,
    data: payments,
    enablePagination: true,
    enableSorting: true,
    enableFiltering: false,
    enableColumnVisibility: false,
  },
};

// Table with filtering
export const WithFiltering: Story = {
  args: {
    columns: formattedColumns,
    data: payments,
    enablePagination: true,
    enableSorting: false,
    enableFiltering: true,
    filterColumn: 'email',
    filterPlaceholder: 'Filter emails...',
    enableColumnVisibility: false,
  },
};

// Table with sorting and filtering
export const WithSortingAndFiltering: Story = {
  args: {
    columns: formattedColumns,
    data: payments,
    enablePagination: true,
    enableSorting: true,
    enableFiltering: true,
    filterColumn: 'email',
    filterPlaceholder: 'Filter emails...',
    enableColumnVisibility: false,
  },
};

// Table with column visibility
export const WithColumnVisibility: Story = {
  args: {
    columns: formattedColumns,
    data: payments,
    enablePagination: true,
    enableSorting: false,
    enableFiltering: false,
    enableColumnVisibility: true,
  },
};

// Table with all features
export const WithAllFeatures: Story = {
  args: {
    columns: formattedColumns,
    data: Array.from({ length: 50 }, (_, i) => ({
      id: `payment-${i}`,
      amount: Math.floor(Math.random() * 1000) + 10,
      status: ['pending', 'processing', 'success', 'failed'][Math.floor(Math.random() * 4)] as Payment['status'],
      email: `user${i}@example.com`,
    })),
    enablePagination: true,
    enableSorting: true,
    enableFiltering: true,
    filterColumn: 'email',
    filterPlaceholder: 'Filter emails...',
    enableColumnVisibility: true,
  },
};

// Table without pagination
export const NoPagination: Story = {
  args: {
    columns: formattedColumns,
    data: payments,
    enablePagination: false,
    enableSorting: false,
    enableFiltering: false,
    enableColumnVisibility: false,
  },
};

// Empty table
export const Empty: Story = {
  args: {
    columns: formattedColumns,
    data: [],
    enablePagination: true,
    enableSorting: false,
    enableFiltering: false,
    enableColumnVisibility: false,
    emptyMessage: 'No payments found.',
  },
};

// Large dataset with pagination
export const LargeDataset: Story = {
  args: {
    columns: formattedColumns,
    data: Array.from({ length: 50 }, (_, i) => ({
      id: `payment-${i}`,
      amount: Math.floor(Math.random() * 1000) + 10,
      status: ['pending', 'processing', 'success', 'failed'][Math.floor(Math.random() * 4)] as Payment['status'],
      email: `user${i}@example.com`,
    })),
    enablePagination: true,
    enableSorting: false,
    enableFiltering: false,
    enableColumnVisibility: false,
    pageSize: 10,
  },
};

// Custom page size
export const CustomPageSize: Story = {
  args: {
    columns: formattedColumns,
    data: Array.from({ length: 20 }, (_, i) => ({
      id: `payment-${i}`,
      amount: Math.floor(Math.random() * 1000) + 10,
      status: ['pending', 'processing', 'success', 'failed'][Math.floor(Math.random() * 4)] as Payment['status'],
      email: `user${i}@example.com`,
    })),
    enablePagination: true,
    enableSorting: false,
    enableFiltering: false,
    enableColumnVisibility: false,
    pageSize: 5,
  },
};
