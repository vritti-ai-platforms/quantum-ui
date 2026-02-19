import type { ColumnDef, Row } from '@tanstack/react-table';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileWarning,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../lib/components/Avatar';
import { Badge } from '../lib/components/Badge';
import { Button } from '../lib/components/Button';
import { Checkbox } from '../lib/components/Checkbox';
import { DataTableColumnHeader } from '../lib/components/DataTable/components/DataTableColumnHeader';
import { DataTableEmpty } from '../lib/components/DataTable/components/DataTableEmpty';
import { DataTablePagination } from '../lib/components/DataTable/components/DataTablePagination';
import { DataTableToolbar } from '../lib/components/DataTable/components/DataTableToolbar';
import { DataTable } from '../lib/components/DataTable/DataTable';
import { useDataTable } from '../lib/components/DataTable/hooks/useDataTable';
import { getSelectionColumn } from '../lib/components/DataTable/utils';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../lib/components/DropdownMenu/DropdownMenu';
import { Progress } from '../lib/components/Progress';
import { Separator } from '../lib/components/Separator';

// ─────────────────────────────────────────────────
// Section wrapper for consistent layout
// ─────────────────────────────────────────────────
const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {children}
  </section>
);

// ─────────────────────────────────────────────────
// 1. BASIC TABLE — minimal, no frills
// ─────────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
}

const tasks: Task[] = [
  { id: 'TASK-001', title: 'Setup CI/CD pipeline', priority: 'high', status: 'done' },
  { id: 'TASK-002', title: 'Design login page', priority: 'medium', status: 'in_progress' },
  { id: 'TASK-003', title: 'Fix header alignment', priority: 'low', status: 'todo' },
  { id: 'TASK-004', title: 'Add dark mode support', priority: 'medium', status: 'done' },
  { id: 'TASK-005', title: 'Write unit tests for auth', priority: 'high', status: 'in_progress' },
  { id: 'TASK-006', title: 'Optimize bundle size', priority: 'high', status: 'todo' },
  { id: 'TASK-007', title: 'Update dependencies', priority: 'low', status: 'done' },
  { id: 'TASK-008', title: 'Create onboarding flow', priority: 'medium', status: 'in_progress' },
];

const basicColumns: ColumnDef<Task, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string;
      const variant = priority === 'high' ? 'destructive' : priority === 'medium' ? 'secondary' : 'outline';
      return <Badge variant={variant}>{priority}</Badge>;
    },
  },
  { accessorKey: 'status', header: 'Status' },
];

const BasicTableDemo = () => {
  const { table } = useDataTable({
    data: tasks,
    columns: basicColumns,
    enableSorting: false,
    enableFiltering: false,
    enablePagination: false,
    enableColumnVisibility: false,
  });

  return <DataTable table={table} />;
};

// ─────────────────────────────────────────────────
// 2. SORTING — single + multi-sort
// ─────────────────────────────────────────────────
interface Employee {
  id: number;
  name: string;
  department: string;
  salary: number;
  joinDate: string;
  performance: number;
}

const employees: Employee[] = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 125000, joinDate: '2021-03-15', performance: 92 },
  { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 95000, joinDate: '2020-07-22', performance: 78 },
  { id: 3, name: 'Charlie Brown', department: 'Engineering', salary: 135000, joinDate: '2019-01-10', performance: 95 },
  { id: 4, name: 'Diana Ross', department: 'Design', salary: 105000, joinDate: '2022-05-08', performance: 88 },
  { id: 5, name: 'Eve Williams', department: 'Engineering', salary: 142000, joinDate: '2018-11-30', performance: 97 },
  { id: 6, name: 'Frank Miller', department: 'Sales', salary: 88000, joinDate: '2023-02-14', performance: 72 },
  { id: 7, name: 'Grace Lee', department: 'Design', salary: 115000, joinDate: '2020-09-01', performance: 91 },
  { id: 8, name: 'Henry Chen', department: 'Marketing', salary: 98000, joinDate: '2021-12-05', performance: 83 },
  { id: 9, name: 'Iris Park', department: 'Engineering', salary: 155000, joinDate: '2017-06-20', performance: 99 },
  { id: 10, name: 'Jack Davis', department: 'Sales', salary: 82000, joinDate: '2023-08-10', performance: 68 },
  { id: 11, name: 'Kate Wilson', department: 'Design', salary: 110000, joinDate: '2021-04-18', performance: 85 },
  { id: 12, name: 'Leo Martinez', department: 'Engineering', salary: 130000, joinDate: '2020-02-28', performance: 90 },
];

const sortingColumns: ColumnDef<Employee, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {(row.getValue('name') as string)
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.getValue('name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'department',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    cell: ({ row }) => <Badge variant="outline">{row.getValue('department')}</Badge>,
  },
  {
    accessorKey: 'salary',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Salary" className="justify-end" />,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
          row.getValue('salary'),
        )}
      </div>
    ),
  },
  {
    accessorKey: 'joinDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) =>
      new Date(row.getValue('joinDate') as string).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
  },
  {
    accessorKey: 'performance',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Performance" />,
    cell: ({ row }) => {
      const score = row.getValue('performance') as number;
      return (
        <div className="flex items-center gap-2 w-[140px]">
          <Progress value={score} className="h-2" />
          <span className="text-xs text-muted-foreground w-8">{score}%</span>
        </div>
      );
    },
  },
];

const SortingDemo = () => {
  const { table } = useDataTable({
    data: employees,
    columns: sortingColumns,
    enableMultiSort: true,
    initialSorting: [{ id: 'salary', desc: true }],
    initialPagination: { pageIndex: 0, pageSize: 6 },
  });

  return <DataTable table={table} pagination={<DataTablePagination table={table} pageSizeOptions={[6, 12]} />} />;
};

// ─────────────────────────────────────────────────
// 3. FILTERING — global search + column filters
// ─────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
}

const products: Product[] = [
  { id: 'PRD-001', name: 'Wireless Headphones', category: 'Electronics', price: 79.99, stock: 145, rating: 4.5 },
  { id: 'PRD-002', name: 'Running Shoes', category: 'Sports', price: 129.99, stock: 89, rating: 4.8 },
  { id: 'PRD-003', name: 'Coffee Maker', category: 'Home', price: 49.99, stock: 230, rating: 4.2 },
  { id: 'PRD-004', name: 'Yoga Mat', category: 'Sports', price: 34.99, stock: 310, rating: 4.6 },
  { id: 'PRD-005', name: 'Desk Lamp', category: 'Home', price: 42.99, stock: 178, rating: 4.1 },
  { id: 'PRD-006', name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99, stock: 67, rating: 4.3 },
  { id: 'PRD-007', name: 'Water Bottle', category: 'Sports', price: 24.99, stock: 520, rating: 4.7 },
  { id: 'PRD-008', name: 'Mechanical Keyboard', category: 'Electronics', price: 149.99, stock: 43, rating: 4.9 },
  { id: 'PRD-009', name: 'Throw Pillow', category: 'Home', price: 19.99, stock: 400, rating: 4.0 },
  { id: 'PRD-010', name: 'Fitness Tracker', category: 'Electronics', price: 99.99, stock: 112, rating: 4.4 },
  { id: 'PRD-011', name: 'Camping Tent', category: 'Sports', price: 199.99, stock: 25, rating: 4.6 },
  { id: 'PRD-012', name: 'Scented Candle', category: 'Home', price: 14.99, stock: 600, rating: 4.3 },
  { id: 'PRD-013', name: 'Gaming Mouse', category: 'Electronics', price: 69.99, stock: 88, rating: 4.7 },
  { id: 'PRD-014', name: 'Resistance Bands', category: 'Sports', price: 15.99, stock: 450, rating: 4.5 },
  { id: 'PRD-015', name: 'Air Purifier', category: 'Home', price: 159.99, stock: 34, rating: 4.8 },
];

const filteringColumns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const cat = row.getValue('category') as string;
      const colors: Record<string, string> = {
        Electronics: 'bg-primary/10 text-primary',
        Sports: 'bg-success/10 text-success',
        Home: 'bg-warning/10 text-warning',
      };
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[cat] ?? ''}`}>{cat}</span>;
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" className="justify-end" />,
    cell: ({ row }) => <div className="text-right font-mono">${(row.getValue('price') as number).toFixed(2)}</div>,
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Stock" />,
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number;
      return (
        <div className="flex items-center gap-2">
          <span
            className={stock < 50 ? 'text-destructive font-medium' : stock < 100 ? 'text-warning' : 'text-foreground'}
          >
            {stock}
          </span>
          {stock < 50 && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
        </div>
      );
    },
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />,
    cell: ({ row }) => {
      const rating = row.getValue('rating') as number;
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-warning">{'★'.repeat(Math.round(rating))}</span>
          <span className="text-muted">{'★'.repeat(5 - Math.round(rating))}</span>
        </div>
      );
    },
  },
];

const FilteringDemo = () => {
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: products,
    columns: filteringColumns,
    initialPagination: { pageIndex: 0, pageSize: 8 },
  });

  const categories = ['Electronics', 'Sports', 'Home'];
  const activeCategory = (table.getColumn('category')?.getFilterValue() as string[]) ?? [];

  return (
    <DataTable
      table={table}
      toolbar={
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder="Search products..."
        >
          <div className="flex items-center gap-1">
            {categories.map((cat) => {
              const isActive = activeCategory.includes(cat);
              return (
                <Button
                  key={cat}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    const next = isActive ? activeCategory.filter((c) => c !== cat) : [...activeCategory, cat];
                    table.getColumn('category')?.setFilterValue(next.length ? next : undefined);
                  }}
                >
                  {cat}
                </Button>
              );
            })}
          </div>
        </DataTableToolbar>
      }
      pagination={<DataTablePagination table={table} pageSizeOptions={[8, 15]} />}
      emptyState={<DataTableEmpty title="No products found" description="Try different search terms or filters." />}
    />
  );
};

// ─────────────────────────────────────────────────
// 4. ROW SELECTION + ROW ACTIONS
// ─────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  active: boolean;
  lastSeen: string;
}

const users: User[] = [
  { id: 'U-001', name: 'Alice Johnson', email: 'alice@acme.com', role: 'admin', active: true, lastSeen: '2 min ago' },
  { id: 'U-002', name: 'Bob Smith', email: 'bob@acme.com', role: 'editor', active: true, lastSeen: '1 hr ago' },
  {
    id: 'U-003',
    name: 'Charlie Brown',
    email: 'charlie@acme.com',
    role: 'viewer',
    active: false,
    lastSeen: '3 days ago',
  },
  { id: 'U-004', name: 'Diana Ross', email: 'diana@acme.com', role: 'editor', active: true, lastSeen: '5 min ago' },
  { id: 'U-005', name: 'Eve Williams', email: 'eve@acme.com', role: 'admin', active: true, lastSeen: 'Just now' },
  { id: 'U-006', name: 'Frank Miller', email: 'frank@acme.com', role: 'viewer', active: false, lastSeen: '1 week ago' },
  { id: 'U-007', name: 'Grace Lee', email: 'grace@acme.com', role: 'editor', active: true, lastSeen: '30 min ago' },
  { id: 'U-008', name: 'Henry Chen', email: 'henry@acme.com', role: 'viewer', active: true, lastSeen: '2 hr ago' },
];

const roleColors: Record<User['role'], string> = {
  admin: 'bg-destructive/10 text-destructive',
  editor: 'bg-primary/10 text-primary',
  viewer: 'bg-muted text-muted-foreground',
};

const selectionColumns: ColumnDef<User, unknown>[] = [
  getSelectionColumn<User>(),
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('');
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${name}`} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.getValue('role') as User['role'];
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[role]}`}
        >
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => {
      const active = row.getValue('active') as boolean;
      return (
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${active ? 'bg-success' : 'bg-muted-foreground/40'}`} />
          <span className="text-sm">{active ? 'Active' : 'Inactive'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'lastSeen',
    header: 'Last seen',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('lastSeen')}</span>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" /> View profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy className="mr-2 h-4 w-4" /> Copy email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Remove user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    ),
  },
];

const SelectionDemo = () => {
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: users,
    columns: selectionColumns,
    enableRowSelection: true,
    enablePagination: false,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="space-y-4">
      <DataTable
        table={table}
        toolbar={
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <input
                placeholder="Search users..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-8 w-[250px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {selectedCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{selectedCount} selected</span>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="mr-2 h-3.5 w-3.5" /> Export
                  </Button>
                  <Button variant="destructive" size="sm" className="h-8">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              )}
            </div>
            <Button size="sm" className="h-8">
              <UserPlus className="mr-2 h-3.5 w-3.5" /> Invite user
            </Button>
          </div>
        }
      />
    </div>
  );
};

// ─────────────────────────────────────────────────
// 5. COLUMN VISIBILITY + INITIAL STATE
// ─────────────────────────────────────────────────
interface Order {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  total: number;
  status: 'shipped' | 'delivered' | 'cancelled' | 'pending';
  date: string;
  address: string;
  trackingId: string;
}

const orders: Order[] = [
  {
    id: 'ORD-1001',
    customer: 'John Doe',
    product: 'MacBook Pro',
    quantity: 1,
    total: 2499,
    status: 'delivered',
    date: '2024-01-15',
    address: '123 Main St',
    trackingId: 'TRK-ABC123',
  },
  {
    id: 'ORD-1002',
    customer: 'Jane Smith',
    product: 'iPad Air',
    quantity: 2,
    total: 1198,
    status: 'shipped',
    date: '2024-01-18',
    address: '456 Oak Ave',
    trackingId: 'TRK-DEF456',
  },
  {
    id: 'ORD-1003',
    customer: 'Mike Wilson',
    product: 'AirPods Pro',
    quantity: 3,
    total: 747,
    status: 'pending',
    date: '2024-01-20',
    address: '789 Pine Rd',
    trackingId: '',
  },
  {
    id: 'ORD-1004',
    customer: 'Sarah Lee',
    product: 'Apple Watch',
    quantity: 1,
    total: 399,
    status: 'cancelled',
    date: '2024-01-22',
    address: '321 Elm St',
    trackingId: '',
  },
  {
    id: 'ORD-1005',
    customer: 'Tom Brown',
    product: 'iPhone 15',
    quantity: 1,
    total: 999,
    status: 'delivered',
    date: '2024-01-25',
    address: '654 Maple Dr',
    trackingId: 'TRK-GHI789',
  },
  {
    id: 'ORD-1006',
    customer: 'Amy Chen',
    product: 'Magic Keyboard',
    quantity: 2,
    total: 598,
    status: 'shipped',
    date: '2024-01-28',
    address: '987 Cedar Ln',
    trackingId: 'TRK-JKL012',
  },
];

const orderStatusIcon: Record<Order['status'], React.ReactNode> = {
  delivered: <CheckCircle2 className="h-3.5 w-3.5 text-success" />,
  shipped: <Loader2 className="h-3.5 w-3.5 text-primary" />,
  pending: <Clock className="h-3.5 w-3.5 text-warning" />,
  cancelled: <AlertCircle className="h-3.5 w-3.5 text-destructive" />,
};

const orderColumns: ColumnDef<Order, unknown>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue('customer')}</span>,
  },
  {
    accessorKey: 'product',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Product" />,
  },
  {
    accessorKey: 'quantity',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Qty" />,
  },
  {
    accessorKey: 'total',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" className="justify-end" />,
    cell: ({ row }) => (
      <div className="text-right font-mono font-medium">${(row.getValue('total') as number).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as Order['status'];
      return (
        <div className="flex items-center gap-1.5 capitalize">
          {orderStatusIcon[status]}
          <span>{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => new Date(row.getValue('date') as string).toLocaleDateString(),
  },
  {
    accessorKey: 'address',
    header: 'Shipping Address',
    enableHiding: true,
  },
  {
    accessorKey: 'trackingId',
    header: 'Tracking ID',
    enableHiding: true,
    cell: ({ row }) => {
      const val = row.getValue('trackingId') as string;
      return val ? (
        <span className="font-mono text-xs">{val}</span>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
  },
];

const ColumnVisibilityDemo = () => {
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: orders,
    columns: orderColumns,
    initialColumnVisibility: { address: false, trackingId: false },
    enablePagination: false,
  });

  return (
    <DataTable
      table={table}
      toolbar={
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder="Search orders..."
        />
      }
    />
  );
};

// ─────────────────────────────────────────────────
// 6. LOADING SKELETON
// ─────────────────────────────────────────────────
const LoadingDemo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { table } = useDataTable({
    data: isLoading ? [] : tasks.slice(0, 5),
    columns: basicColumns,
    initialPagination: { pageIndex: 0, pageSize: 5 },
  });

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={() => setIsLoading(!isLoading)}>
        {isLoading ? 'Show data' : 'Show skeleton'}
      </Button>
      <DataTable table={table} isLoading={isLoading} />
    </div>
  );
};

// ─────────────────────────────────────────────────
// 7. EMPTY STATE — various styles
// ─────────────────────────────────────────────────
const EmptyStateDemo = () => {
  const { table } = useDataTable({
    data: [] as Task[],
    columns: basicColumns,
    enablePagination: false,
  });

  return (
    <DataTable
      table={table}
      emptyState={
        <DataTableEmpty
          icon={Users}
          title="No team members yet"
          description="Start by inviting your first team member."
          action={
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add member
            </Button>
          }
        />
      }
    />
  );
};

// ─────────────────────────────────────────────────
// 8. FULL FEATURED — everything together
// ─────────────────────────────────────────────────
interface Invoice {
  id: string;
  client: string;
  email: string;
  amount: number;
  status: 'paid' | 'overdue' | 'pending' | 'draft';
  dueDate: string;
  category: string;
}

const invoices: Invoice[] = [
  {
    id: 'INV-0001',
    client: 'Acme Corp',
    email: 'billing@acme.com',
    amount: 15000,
    status: 'paid',
    dueDate: '2024-01-15',
    category: 'Enterprise',
  },
  {
    id: 'INV-0002',
    client: 'Globex Inc',
    email: 'ap@globex.com',
    amount: 8500,
    status: 'overdue',
    dueDate: '2024-01-10',
    category: 'SMB',
  },
  {
    id: 'INV-0003',
    client: 'Stark Industries',
    email: 'finance@stark.com',
    amount: 42000,
    status: 'paid',
    dueDate: '2024-02-01',
    category: 'Enterprise',
  },
  {
    id: 'INV-0004',
    client: 'Wayne Enterprises',
    email: 'accounts@wayne.com',
    amount: 28000,
    status: 'pending',
    dueDate: '2024-02-15',
    category: 'Enterprise',
  },
  {
    id: 'INV-0005',
    client: 'Umbrella Corp',
    email: 'billing@umbrella.com',
    amount: 3200,
    status: 'draft',
    dueDate: '2024-02-20',
    category: 'SMB',
  },
  {
    id: 'INV-0006',
    client: 'Cyberdyne Systems',
    email: 'ap@cyberdyne.com',
    amount: 19500,
    status: 'paid',
    dueDate: '2024-01-28',
    category: 'Enterprise',
  },
  {
    id: 'INV-0007',
    client: 'Pied Piper',
    email: 'billing@piedpiper.com',
    amount: 4800,
    status: 'overdue',
    dueDate: '2024-01-05',
    category: 'Startup',
  },
  {
    id: 'INV-0008',
    client: 'Hooli',
    email: 'finance@hooli.com',
    amount: 67000,
    status: 'paid',
    dueDate: '2024-03-01',
    category: 'Enterprise',
  },
  {
    id: 'INV-0009',
    client: 'Initech',
    email: 'ap@initech.com',
    amount: 2100,
    status: 'pending',
    dueDate: '2024-02-25',
    category: 'SMB',
  },
  {
    id: 'INV-0010',
    client: 'Wonka Industries',
    email: 'billing@wonka.com',
    amount: 11200,
    status: 'paid',
    dueDate: '2024-01-20',
    category: 'Enterprise',
  },
  {
    id: 'INV-0011',
    client: 'Dunder Mifflin',
    email: 'ap@dundermifflin.com',
    amount: 950,
    status: 'draft',
    dueDate: '2024-03-05',
    category: 'SMB',
  },
  {
    id: 'INV-0012',
    client: 'Bluth Company',
    email: 'finance@bluth.com',
    amount: 5600,
    status: 'overdue',
    dueDate: '2024-01-02',
    category: 'Startup',
  },
  {
    id: 'INV-0013',
    client: 'Sterling Cooper',
    email: 'billing@sc.com',
    amount: 33000,
    status: 'paid',
    dueDate: '2024-02-10',
    category: 'Enterprise',
  },
  {
    id: 'INV-0014',
    client: 'Prestige Worldwide',
    email: 'ap@prestige.com',
    amount: 780,
    status: 'pending',
    dueDate: '2024-03-10',
    category: 'Startup',
  },
  {
    id: 'INV-0015',
    client: 'Massive Dynamic',
    email: 'finance@massive.com',
    amount: 51000,
    status: 'paid',
    dueDate: '2024-01-30',
    category: 'Enterprise',
  },
  {
    id: 'INV-0016',
    client: 'Weyland-Yutani',
    email: 'billing@weyland.com',
    amount: 24000,
    status: 'pending',
    dueDate: '2024-02-28',
    category: 'Enterprise',
  },
  {
    id: 'INV-0017',
    client: 'Soylent Corp',
    email: 'ap@soylent.com',
    amount: 6700,
    status: 'overdue',
    dueDate: '2024-01-08',
    category: 'SMB',
  },
  {
    id: 'INV-0018',
    client: 'Tyrell Corp',
    email: 'finance@tyrell.com',
    amount: 89000,
    status: 'paid',
    dueDate: '2024-03-15',
    category: 'Enterprise',
  },
  {
    id: 'INV-0019',
    client: 'Los Pollos',
    email: 'billing@pollos.com',
    amount: 1450,
    status: 'draft',
    dueDate: '2024-03-20',
    category: 'Startup',
  },
  {
    id: 'INV-0020',
    client: 'Oscorp',
    email: 'ap@oscorp.com',
    amount: 37500,
    status: 'paid',
    dueDate: '2024-02-05',
    category: 'Enterprise',
  },
];

const invoiceStatusConfig: Record<
  Invoice['status'],
  { variant: 'default' | 'destructive' | 'outline' | 'secondary'; icon: React.ReactNode }
> = {
  paid: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  overdue: { variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
  pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  draft: { variant: 'outline', icon: <FileWarning className="h-3 w-3" /> },
};

const invoiceColumns: ColumnDef<Invoice, unknown>[] = [
  getSelectionColumn<Invoice>(),
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice" />,
    cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'client',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.getValue('client')}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => <Badge variant="outline">{row.getValue('category')}</Badge>,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" className="justify-end" />,
    cell: ({ row }) => (
      <div className="text-right font-mono font-semibold">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
          row.getValue('amount'),
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as Invoice['status'];
      const config = invoiceStatusConfig[status];
      return (
        <Badge variant={config.variant} className="gap-1 capitalize">
          {config.icon} {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Due Date" />,
    cell: ({ row }) =>
      new Date(row.getValue('dueDate') as string).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Eye className="mr-2 h-4 w-4" /> View invoice
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    ),
  },
];

const FullFeaturedDemo = () => {
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: invoices,
    columns: invoiceColumns,
    enableRowSelection: true,
    enableMultiSort: true,
    initialSorting: [{ id: 'amount', desc: true }],
    initialPagination: { pageIndex: 0, pageSize: 8 },
  });

  const statuses = ['paid', 'overdue', 'pending', 'draft'] as const;
  const activeStatus = (table.getColumn('status')?.getFilterValue() as string[]) ?? [];
  const categories = ['Enterprise', 'SMB', 'Startup'];
  const activeCategory = (table.getColumn('category')?.getFilterValue() as string[]) ?? [];
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <DataTable
      table={table}
      toolbar={
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-between">
            <input
              placeholder="Search invoices..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 w-[300px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="flex items-center gap-2">
              {selectedCount > 0 && <span className="text-sm text-muted-foreground">{selectedCount} selected</span>}
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Invoice
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-muted-foreground mr-1">Status:</span>
              {statuses.map((s) => {
                const isActive = activeStatus.includes(s);
                return (
                  <Button
                    key={s}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs capitalize"
                    onClick={() => {
                      const next = isActive ? activeStatus.filter((v) => v !== s) : [...activeStatus, s];
                      table.getColumn('status')?.setFilterValue(next.length ? next : undefined);
                    }}
                  >
                    {s}
                  </Button>
                );
              })}
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-muted-foreground mr-1">Category:</span>
              {categories.map((c) => {
                const isActive = activeCategory.includes(c);
                return (
                  <Button
                    key={c}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      const next = isActive ? activeCategory.filter((v) => v !== c) : [...activeCategory, c];
                      table.getColumn('category')?.setFilterValue(next.length ? next : undefined);
                    }}
                  >
                    {c}
                  </Button>
                );
              })}
            </div>
            {(activeStatus.length > 0 || activeCategory.length > 0 || globalFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  table.resetColumnFilters();
                  setGlobalFilter('');
                }}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      }
      pagination={<DataTablePagination table={table} pageSizeOptions={[8, 15, 30]} showSelectedCount />}
      emptyState={
        <DataTableEmpty
          icon={CreditCard}
          title="No invoices match"
          description="Try adjusting your filters or search terms."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
                setGlobalFilter('');
              }}
            >
              Clear all filters
            </Button>
          }
        />
      }
    />
  );
};

// ─────────────────────────────────────────────────
// APP — All demos combined
// ─────────────────────────────────────────────────
export const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        <div>
          <h1 className="text-3xl font-bold">DataTable Component Showcase</h1>
          <p className="text-muted-foreground mt-1">
            All features of @vritti/quantum-ui DataTable powered by TanStack React Table
          </p>
        </div>

        <Section
          title="1. Basic Table"
          description="Minimal table with no sorting, filtering, or pagination. Just data and columns."
        >
          <BasicTableDemo />
        </Section>

        <Separator />

        <Section
          title="2. Sorting (Multi-sort)"
          description="Click column headers to sort. Hold Shift+click for multi-column sort. Pre-sorted by salary descending. Includes avatars and progress bars."
        >
          <SortingDemo />
        </Section>

        <Separator />

        <Section
          title="3. Filtering (Global + Column)"
          description="Global search across all columns. Category facet buttons for column-level filtering. Column visibility toggle in toolbar. Custom stock level warnings."
        >
          <FilteringDemo />
        </Section>

        <Separator />

        <Section
          title="4. Row Selection + Row Actions"
          description="Checkbox column for multi-select. Bulk action buttons appear when rows are selected. Per-row action dropdown menus. Custom toolbar with invite button."
        >
          <SelectionDemo />
        </Section>

        <Separator />

        <Section
          title="5. Column Visibility"
          description="Address and Tracking ID columns are hidden by default. Use the View dropdown to toggle column visibility. Sortable headers with status icons."
        >
          <ColumnVisibilityDemo />
        </Section>

        <Separator />

        <Section
          title="6. Loading Skeleton"
          description="Toggle between loading skeleton and actual data. Skeleton rows match the configured page size."
        >
          <LoadingDemo />
        </Section>

        <Separator />

        <Section
          title="7. Empty State"
          description="Custom empty state with icon, title, description, and call-to-action button."
        >
          <EmptyStateDemo />
        </Section>

        <Separator />

        <Section
          title="8. Full Featured"
          description="Everything combined: row selection, multi-sort, global search, status + category facet filters, column visibility, row actions, pagination with page size selector, and empty state."
        >
          <FullFeaturedDemo />
        </Section>
      </div>
    </div>
  );
};
