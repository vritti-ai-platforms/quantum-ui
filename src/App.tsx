import { type ColumnDef } from '@tanstack/react-table';
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
} from 'lucide-react';
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

// ─── TABLE COMPONENTS ───

// Full featured — all options enabled
const InvoicesTable = () => {
  const table = useDataTable({
    data: invoices,
    columns: invoiceColumns,
    slug: 'invoices',
  });

  return (
    <DataTable
      table={table}
      search={{ placeholder: 'Search invoices...' }}
      pagination={{ itemLabel: 'invoices' }}
      selection={{
        actions: (
          <Button variant="outline" size="sm" className="h-7">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export selected
          </Button>
        ),
      }}
      toolbar={{
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
      }}
      empty={{
        icon: CreditCard,
        title: 'No invoices match',
        description: 'Try adjusting your filters.',
        action: (
          <Button variant="outline" size="sm">
            Clear filters
          </Button>
        ),
      }}
    />
  );
};

// ─── APP ───
export const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        <Section
          title="5. Full Featured"
          description="Everything: selection, sorting, search, column settings with pin/visibility, row density, pagination, row actions, empty state."
        >
          <InvoicesTable />
        </Section>
      </div>
    </div>
  );
};
