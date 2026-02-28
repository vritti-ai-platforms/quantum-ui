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
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../lib/components/Badge';
import { Button } from '../lib/components/Button';
import { DataTable } from '../lib/components/DataTable/DataTable';
import { useDataTable } from '../lib/components/DataTable/hooks/useDataTable';
import { getSelectionColumn } from '../lib/components/DataTable/utils';
import { Dialog } from '../lib/components/Dialog';
import { TextField } from '../lib/components/TextField';
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

const clients = [
  'Acme Corp', 'Globex Inc', 'Stark Industries', 'Wayne Enterprises', 'Umbrella Corp',
  'Cyberdyne Systems', 'Pied Piper', 'Hooli', 'Initech', 'Wonka Industries',
  'Dunder Mifflin', 'Bluth Company', 'Sterling Cooper', 'Prestige Worldwide', 'Massive Dynamic',
  'Weyland-Yutani', 'Soylent Corp', 'Tyrell Corp', 'Los Pollos', 'Oscorp',
  'Aperture Science', 'Vault-Tec', 'Abstergo Industries', 'Mishima Zaibatsu', 'Shinra Electric',
  'Capsule Corp', 'LexCorp', 'Gekko & Co', 'Virtucon', 'Nakatomi Trading',
  'Rekall Inc', 'Omni Consumer', 'Brawndo Corp', 'Oceanic Airlines', 'Dharma Initiative',
  'InGen', 'Cyberdine Labs', 'Ellingson Mineral', 'Zorg Industries', 'Axiom Corp',
];
const statuses: Invoice['status'][] = ['paid', 'overdue', 'pending', 'draft'];
const categories = ['Enterprise', 'SMB', 'Startup'];

const invoices: Invoice[] = Array.from({ length: 200 }, (_, i) => {
  const client = clients[i % clients.length];
  const slug = client.toLowerCase().replace(/[^a-z]+/g, '');
  return {
    id: `INV-${String(i + 1).padStart(4, '0')}`,
    client,
    email: `billing@${slug}.com`,
    amount: Math.floor(Math.random() * 99000) + 500,
    status: statuses[i % statuses.length],
    dueDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    category: categories[i % categories.length],
  };
});

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
      enableSearch={{ placeholder: 'Search invoices...' }}
      selectActions={(rows) => (
        <Button variant="outline" size="sm" className="h-7" onClick={() => console.log('Export', rows.map((r) => r.original.id))}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export {rows.length} selected
        </Button>
      )}
      toolbarActions={{
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
      emptyStateConfig={{
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

// ─── DIALOG EXAMPLE ───
const DialogExample = () => {
  const [controlled, setControlled] = useState(false);

  return (
    <div className="space-y-6">
      {/* Trigger-based dialog */}
      <div className="flex flex-wrap gap-4">
        <Dialog
          trigger={<Button>Edit Profile</Button>}
          title="Edit Profile"
          description="Make changes to your profile here. Click save when you're done."
          footer={
            <>
              <Button variant="outline">Cancel</Button>
              <Button>Save changes</Button>
            </>
          }
        >
          <div className="space-y-4 py-4">
            <TextField label="Name" placeholder="Enter your name" />
            <TextField label="Email" placeholder="Enter your email" />
          </div>
        </Dialog>

        {/* Controlled dialog */}
        <Button variant="outline" onClick={() => setControlled(true)}>
          Confirm Action (controlled)
        </Button>
        <Dialog
          open={controlled}
          onOpenChange={setControlled}
          title="Are you sure?"
          description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
          footer={
            <>
              <Button variant="outline" onClick={() => setControlled(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setControlled(false)}>
                Delete account
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
};

// ─── APP ───
export const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        <Section title="Dialog" description="Trigger-based and controlled dialog examples.">
          <DialogExample />
        </Section>

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
