import type { ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileWarning,
  MoreHorizontal,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../lib/components/Avatar';
import { Badge } from '../lib/components/Badge';
import { Button } from '../lib/components/Button';
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

// ─── 1. BASIC TABLE ───
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

const taskColumns: ColumnDef<Task, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Title' },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const p = row.getValue('priority') as string;
      return <Badge variant={p === 'high' ? 'destructive' : p === 'medium' ? 'secondary' : 'outline'}>{p}</Badge>;
    },
  },
  { accessorKey: 'status', header: 'Status' },
];

// ─── 2. EMPLOYEES ───
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

const employeeColumns: ColumnDef<Employee, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
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
    header: 'Department',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('department')}</Badge>,
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
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
    header: 'Joined',
    cell: ({ row }) =>
      new Date(row.getValue('joinDate') as string).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
  },
  {
    accessorKey: 'performance',
    header: 'Performance',
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

// ─── 3. USERS ───
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

const userColumns: ColumnDef<User, unknown>[] = [
  getSelectionColumn<User>(),
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${name}`} />
            <AvatarFallback className="text-xs">
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
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
    header: 'Role',
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[row.getValue('role') as User['role']]}`}
      >
        {row.getValue('role')}
      </span>
    ),
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
    cell: () => (
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
            <Trash2 className="mr-2 h-4 w-4" /> Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    ),
  },
];

// ─── 4. INVOICES ───
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

const statusConfig: Record<
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
    header: 'Invoice',
    cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'client',
    header: 'Client',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.getValue('client')}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('category')}</Badge>,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <div className="font-mono font-semibold">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
          row.getValue('amount'),
        )}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.getValue('status') as Invoice['status'];
      return (
        <Badge variant={statusConfig[s].variant} className="gap-1 capitalize">
          {statusConfig[s].icon} {s}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
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
    cell: () => (
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
            <Eye className="mr-2 h-4 w-4" /> View
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

// ─── ISOLATED TABLE COMPONENTS ───
// Each table in its own component so Zustand updates only re-render the affected table

const InvoicesTable = () => {
  const table = useDataTable('invoices', {
    data: invoices,
    columns: invoiceColumns,
    selection: {
      actions: (
        <Button variant="outline" size="sm" className="h-7">
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export selected
        </Button>
      ),
    },
    sorting: { initial: [{ id: 'amount', desc: true }] },
    pagination: { pageSizeOptions: [8, 16], itemLabel: 'invoices' },
    search: { placeholder: 'Search invoices...' },
    toolbar: {
      actions: (
        <>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        </>
      ),
    },
    empty: {
      icon: CreditCard,
      title: 'No invoices match',
      description: 'Try adjusting your filters.',
      action: (
        <Button variant="outline" size="sm">
          Clear filters
        </Button>
      ),
    },
  });
  return <DataTable table={table} />;
};

// ─── APP ───
export const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        <Section
          title="6. Full Featured"
          description="Everything: selection, sorting, search, column settings with pin/visibility, row density, pagination, row actions, empty state."
        >
          <InvoicesTable />
        </Section>
      </div>
    </div>
  );
};
