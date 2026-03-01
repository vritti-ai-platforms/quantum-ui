import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { FileX2, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import type { DataTableProps } from './types';
import { getSelectionColumn } from './utils';

// ─── Sample data ───

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
}

const sampleData: Payment[] = [
  { id: 'pay_001', amount: 316, status: 'success', email: 'alice@example.com' },
  { id: 'pay_002', amount: 242, status: 'success', email: 'bob@example.com' },
  { id: 'pay_003', amount: 837, status: 'processing', email: 'carol@example.com' },
  { id: 'pay_004', amount: 874, status: 'success', email: 'dave@example.com' },
  { id: 'pay_005', amount: 721, status: 'failed', email: 'eve@example.com' },
  { id: 'pay_006', amount: 190, status: 'pending', email: 'frank@example.com' },
  { id: 'pay_007', amount: 450, status: 'success', email: 'grace@example.com' },
  { id: 'pay_008', amount: 125, status: 'processing', email: 'henry@example.com' },
  { id: 'pay_009', amount: 560, status: 'success', email: 'iris@example.com' },
  { id: 'pay_010', amount: 333, status: 'pending', email: 'jack@example.com' },
  { id: 'pay_011', amount: 150, status: 'failed', email: 'kate@example.com' },
  { id: 'pay_012', amount: 999, status: 'success', email: 'leo@example.com' },
];

const columns: ColumnDef<Payment, unknown>[] = [
  { accessorKey: 'id', header: 'ID', enableSorting: false },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'status', header: 'Status' },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'));
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    },
  },
];

const selectionColumns: ColumnDef<Payment, unknown>[] = [getSelectionColumn<Payment>(), ...columns];

// ─── Story wrappers ───

function DefaultStory() {
  const table = useDataTable({ data: sampleData, columns, slug: 'story-default' });
  return <DataTable table={table} enableSearch={{}} paginationConfig={{ pageSizeOptions: [5, 10, 20] }} />;
}

function WithSelectionStory() {
  const table = useDataTable({ data: sampleData, columns: selectionColumns, slug: 'story-selection' });
  return (
    <DataTable
      table={table}
      enableSearch={{}}
      paginationConfig={{ pageSizeOptions: [5, 10] }}
      selectActions={(rows) => (
        <Button variant="destructive" size="sm" onClick={() => console.log('Delete', rows.map((r) => r.original.id))}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete {rows.length} item{rows.length !== 1 ? 's' : ''}
        </Button>
      )}
    />
  );
}

function EmptyStateStory() {
  const table = useDataTable({
    data: [] as Payment[],
    columns,
    slug: 'story-empty',
    enableRowSelection: false,
  });
  return (
    <DataTable
      table={table}
      enableSearch={{}}
      paginationConfig={{ pageSizeOptions: [5, 10] }}
      emptyStateConfig={{
        icon: FileX2,
        title: 'No payments found',
        description: 'There are no payments matching your criteria.',
        action: <Button size="sm">Create payment</Button>,
      }}
    />
  );
}

function LoadingStory() {
  const table = useDataTable({ data: [] as Payment[], columns, slug: 'story-loading' });
  return <DataTable table={table} isLoading paginationConfig={{ pageSizeOptions: [5, 10] }} />;
}

function CustomPaginationStory() {
  const table = useDataTable({
    data: sampleData,
    columns,
    slug: 'story-pagination',
    initialState: { pagination: { pageIndex: 0, pageSize: 3 } },
  });
  return (
    <DataTable
      table={table}
      enableSearch={{}}
      paginationConfig={{ pageSizeOptions: [3, 6, 12] }}
    />
  );
}

// ─── Meta ───

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DataTableProps<Payment>>;

export const Default: Story = {
  render: () => <DefaultStory />,
};

export const WithSelection: Story = {
  render: () => <WithSelectionStory />,
};

export const EmptyState: Story = {
  render: () => <EmptyStateStory />,
};

export const Loading: Story = {
  render: () => <LoadingStory />,
};

export const CustomPagination: Story = {
  render: () => <CustomPaginationStory />,
};
