import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, FileX2, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FilterCondition } from '../../types/conditions';
import { EMPTY_TABLE_STATE } from '../../types/table-state';
import { filter } from '../../utils/filter';
import { isoTodayDate } from '../../utils/timezone';
import { Button } from '../Button';
import { DateFilter } from '../DateFilter';
import { SelectFilter } from '../Select';
import { ValueFilter } from '../ValueFilter';
import { RowActions } from './components/RowActions';
import { DataTable } from './DataTable';
import { useDataTable } from './hooks/useDataTable';
import { useDataTableStore } from './store/store';
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
  const table = useDataTable({
    columns,
    slug: 'story-default',
    label: 'Payments',
    query: { data: { result: sampleData, count: sampleData.length } },
  });
  return <DataTable table={table} />;
}

function WithSelectionStory() {
  const table = useDataTable({
    columns: selectionColumns,
    slug: 'story-selection',
    label: 'Payments',
    query: { data: { result: sampleData, count: sampleData.length } },
  });
  return (
    <DataTable
      table={table}
      selectActions={(rows) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() =>
            console.log(
              'Delete',
              rows.map((r) => r.original.id),
            )
          }
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete {rows.length} item{rows.length !== 1 ? 's' : ''}
        </Button>
      )}
    />
  );
}

function EmptyStateStory() {
  const table = useDataTable({
    columns,
    slug: 'story-empty',
    label: 'Payments',
    query: { data: { result: [] as Payment[], count: 0 } },
    enableRowSelection: false,
  });
  return (
    <DataTable
      table={table}
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
  const table = useDataTable({ columns, slug: 'story-loading', label: 'Payments', query: { isLoading: true } });
  return <DataTable table={table} />;
}

function CustomPaginationStory() {
  const table = useDataTable({
    columns,
    slug: 'story-pagination',
    label: 'Payments',
    query: { data: { result: sampleData, count: sampleData.length } },
  });
  return <DataTable table={table} />;
}

// Two header rows: "Customer" spans Email, "Payment" spans Status and Amount; ID has no group above it
const groupedColumns: ColumnDef<Payment, unknown>[] = [
  { accessorKey: 'id', header: 'ID', enableSorting: false },
  {
    id: 'customer',
    header: 'Customer',
    columns: [{ accessorKey: 'email', header: 'Email', size: 260, meta: { grow: true } }],
  },
  {
    id: 'payment',
    header: 'Payment',
    columns: [
      { accessorKey: 'status', header: 'Status', size: 110 },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 110,
        cell: ({ row }) =>
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.getValue('amount')),
      },
    ],
  },
];

function GroupedHeadersStory() {
  const slug = 'story-grouped-headers';
  const table = useDataTable({
    columns: [getSelectionColumn<Payment>(), ...groupedColumns],
    slug,
    label: 'Payments',
    query: { data: useStoryServerState(slug) },
    enableRowSelection: true,
  });
  return <DataTable table={table} />;
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

export const GroupedHeaders: Story = {
  render: () => <GroupedHeadersStory />,
};

export const Loading: Story = {
  render: () => <LoadingStory />,
};

export const CustomPagination: Story = {
  render: () => <CustomPaginationStory />,
};

// ─── Scroll behaviour (tall + wide + actions) ───
// Verifies: (1) vertical scrollbar starts BELOW the header, (2) header columns stay aligned with the
// body while horizontal-scrolling, (3) the actions column stays pinned on the right in header + body.

const tallData: Payment[] = Array.from({ length: 60 }, (_, i) => ({
  id: `pay_${String(i + 1).padStart(3, '0')}`,
  amount: Math.round(100 + Math.random() * 900),
  status: (['pending', 'processing', 'success', 'failed'] as const)[i % 4],
  email: `user${i + 1}@really-long-example-domain-to-force-width.com`,
}));

const wideColumns: ColumnDef<Payment, unknown>[] = [
  { accessorKey: 'id', header: 'Payment ID', size: 220, enableSorting: false },
  { accessorKey: 'email', header: 'Customer Email Address', size: 360 },
  { accessorKey: 'status', header: 'Payment Status', size: 220 },
  {
    accessorKey: 'amount',
    header: 'Amount Charged (USD)',
    size: 240,
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'));
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    },
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <RowActions
        actions={[
          { id: 'view', icon: Eye, label: 'View', onClick: () => console.log('view', row.original.id) },
          { id: 'edit', icon: Pencil, label: 'Edit', onClick: () => console.log('edit', row.original.id) },
          {
            id: 'delete',
            icon: Trash2,
            label: 'Delete',
            variant: 'destructive',
            onClick: () => console.log('delete', row.original.id),
          },
        ]}
      />
    ),
  },
];

function ScrollBehaviorStory() {
  const scrollTable = useDataTable({
    columns: wideColumns,
    slug: 'story-scroll',
    label: 'Payments',
    query: { data: { result: tallData, count: tallData.length } },
  });
  return <DataTable table={scrollTable} mode="page" enableViews={false} />;
}

export const ScrollBehavior: Story = {
  render: () => <ScrollBehaviorStory />,
};

// ─── Live filters + context bar ───
// The same SelectFilter is a panel filter in the first table and a context in the second (only the JSX moves and
// `mode="context"` is added). Filters apply as they change (no Apply button). Both halves have page defaults, and the
// "As of" date resets to today each time the table opens (`resetOnOpen`).

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
];

// Stands in for the server's WHERE: applies equals / isAnyOf / contains conditions to the sample rows
function applyConditions(rows: Payment[], conditions: FilterCondition[]): Payment[] {
  return rows.filter((row) =>
    conditions.every((c) => {
      const cell = String(row[c.field as keyof Payment]);
      if (c.operator === 'equals') return cell === String(c.value);
      if (c.operator === 'isAnyOf') return Array.isArray(c.value) && c.value.includes(cell);
      if (c.operator === 'contains') return cell.includes(String(c.value));
      return true;
    }),
  );
}

// Simulates the table endpoint: rows filtered by both halves of the stored filters, echoing the state it used
function useStoryServerState(slug: string) {
  const state = useDataTableStore((s) => s.tables[slug]?.activeState ?? EMPTY_TABLE_STATE);
  const rowConditions = state.filters.context.filter((c) => c.field !== 'asOf');
  const result = applyConditions(sampleData, [...state.filters.panel, ...rowConditions]);
  return { result, count: result.length, state, activeViewId: null };
}

const statusFilter = (mode?: 'context') => (
  <SelectFilter key="status" name="status" label="Status" options={statusOptions} mode={mode} />
);

function StatusAsFilterTable() {
  const slug = 'story-live-filter';
  const table = useDataTable({
    columns,
    slug,
    label: 'Payments',
    query: { data: useStoryServerState(slug) },
  });
  return (
    <DataTable
      table={table}
      mode="compact"
      enableViews={false}
      filters={[
        statusFilter(),
        <ValueFilter key="email" name="email" label="Email" fieldType="string" />,
        <SelectFilter
          key="id"
          name="id"
          label="Payment"
          options={sampleData.map((p) => ({ value: p.id, label: p.id }))}
          multiple
        />,
      ]}
    />
  );
}

function StatusAsContextTable() {
  const slug = 'story-live-context';
  const table = useDataTable({
    columns,
    slug,
    label: 'Payments',
    query: { data: useStoryServerState(slug) },
    defaultContext: [filter('status').equals('pending'), filter('asOf').equals(isoTodayDate(null))],
    resetOnOpen: ['asOf'],
  });
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Context status: {table.contextValue('status') ?? 'none'} · as of: {table.contextValue('asOf') ?? 'none'}
      </p>
      <DataTable
        table={table}
        mode="compact"
        enableViews={false}
        contextBar={
          <>
            {statusFilter('context')}
            <DateFilter name="asOf" label="As of" mode="context" />
          </>
        }
        filters={[<ValueFilter key="email" name="email" label="Email" fieldType="string" />]}
      />
    </div>
  );
}

// Unmounts and remounts the context table, as leaving and coming back to a page does: its saved state is shown again,
// except the "As of" day, which opens on today
function ReopenableContextTable() {
  const [opening, setOpening] = useState(0);
  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" size="sm" className="self-start" onClick={() => setOpening((n) => n + 1)}>
        Reopen table
      </Button>
      <StatusAsContextTable key={opening} />
    </div>
  );
}

export const LiveFiltersAndContext: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <StatusAsFilterTable />
      <ReopenableContextTable />
    </div>
  ),
};
