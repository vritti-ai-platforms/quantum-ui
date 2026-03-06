import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../lib/components/Button';
import { Form } from '../lib/components/Form/Form';
import { SelectFilter } from '../lib/components/Select/SelectFilter';
import type { FilterResult } from '../lib/components/Select/types';
import { ConfirmProvider } from '../lib/context/ConfirmContext';
import { useConfirm } from '../lib/hooks/useConfirm';

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

// ─── SELECT FILTER EXAMPLES ───

const statusOptions = [
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
];

const categoryOptions = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'smb', label: 'SMB' },
  { value: 'startup', label: 'Startup' },
];

const SelectFilterSection = () => {
  const [singleResult, setSingleResult] = useState<FilterResult | undefined>();
  const [multiResult, setMultiResult] = useState<FilterResult | undefined>();
  const [submitted, setSubmitted] = useState<{ statusFilter: FilterResult } | undefined>();

  const form = useForm<{ statusFilter: FilterResult }>();

  return (
    <div className="space-y-10">
      {/* Example A — Standalone single SelectFilter */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">A. Standalone single</p>
        <SelectFilter field="status" label="Status" options={statusOptions} onChange={setSingleResult} />
        {singleResult && <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(singleResult, null, 2)}</pre>}
      </div>

      {/* Example B — Standalone multi SelectFilter */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">B. Standalone multi</p>
        <SelectFilter field="category" label="Category" multiple options={categoryOptions} onChange={setMultiResult} />
        {multiResult && <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(multiResult, null, 2)}</pre>}
      </div>

      {/* Example C — Inside Form (React Hook Form) */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">C. Inside Form (React Hook Form)</p>
        <Form form={form} onSubmit={(data) => setSubmitted(data)} className="flex items-end gap-3">
          <SelectFilter name="statusFilter" field="status" label="Status" options={statusOptions} />
          <Button type="submit">Apply</Button>
        </Form>
        {submitted && <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(submitted, null, 2)}</pre>}
      </div>
    </div>
  );
};

// ─── CONFIRM EXAMPLES ───

const ConfirmSection = () => {
  const confirm = useConfirm();
  const [result, setResult] = useState<string | undefined>();

  // A. No args — all defaults
  const handleDefault = async () => {
    const confirmed = await confirm();
    setResult(`A → ${confirmed ? 'confirmed' : 'cancelled'}`);
  };

  // B. Custom title only
  const handleCustomTitle = async () => {
    const confirmed = await confirm({ title: 'Remove this member?' });
    setResult(`B → ${confirmed ? 'confirmed' : 'cancelled'}`);
  };

  // C. Destructive with description
  const handleDestructive = async () => {
    const confirmed = await confirm({
      title: 'Delete deployment?',
      description: 'This action cannot be undone. All associated data will be permanently removed.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    setResult(`C → ${confirmed ? 'confirmed' : 'cancelled'}`);
  };

  // D. Custom labels (non-destructive)
  const handleCustomLabels = async () => {
    const confirmed = await confirm({
      title: 'Save changes?',
      description: 'Your unsaved changes will be lost if you leave.',
      confirmLabel: 'Save & Continue',
      cancelLabel: 'Discard',
    });
    setResult(`D → ${confirmed ? 'confirmed' : 'cancelled'}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleDefault}>
          A. Default (no args)
        </Button>
        <Button variant="outline" onClick={handleCustomTitle}>
          B. Custom title
        </Button>
        <Button variant="destructive" onClick={handleDestructive}>
          C. Destructive
        </Button>
        <Button variant="outline" onClick={handleCustomLabels}>
          D. Custom labels
        </Button>
      </div>
      {result && (
        <pre className="rounded-md bg-muted p-3 text-xs">{result}</pre>
      )}
    </div>
  );
};

// ─── APP ───
export const App = () => {
  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
          <Section
            title="useConfirm"
            description="Imperative Promise-based confirm dialog — await confirm(options) returns true/false."
          >
            <ConfirmSection />
          </Section>
          <Section
            title="SelectFilter"
            description="Standalone (single/multi) and Form-integrated examples — onChange emits FilterResult."
          >
            <SelectFilterSection />
          </Section>
        </div>
      </div>
    </ConfirmProvider>
  );
};
