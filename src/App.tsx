import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../lib/components/Button';
import { DatePicker } from '../lib/components/DatePicker';
import { DateRangePicker } from '../lib/components/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import { DateTimeRangePicker } from '../lib/components/DateTimeRangePicker';
import type { DateTimeRange } from '../lib/components/DateTimeRangePicker';
import { DateTimePicker } from '../lib/components/DateTimePicker';
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
        <SelectFilter
          name="status"
          label="Status"
          options={statusOptions}
          onChange={(v) => setSingleResult(v ?? undefined)}
        />
        {singleResult && <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(singleResult, null, 2)}</pre>}
      </div>

      {/* Example B — Standalone multi SelectFilter */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">B. Standalone multi</p>
        <SelectFilter
          name="category"
          label="Category"
          multiple
          options={categoryOptions}
          onChange={(v) => setMultiResult(v ?? undefined)}
        />
        {multiResult && <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(multiResult, null, 2)}</pre>}
      </div>

      {/* Example C — Inside Form (React Hook Form) */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">C. Inside Form (React Hook Form)</p>
        <Form form={form} onSubmit={(data) => setSubmitted(data)} className="flex items-end gap-3">
          <SelectFilter name="statusFilter" label="Status" options={statusOptions} />
          <Button type="submit">Apply</Button>
        </Form>
        {submitted && <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(submitted, null, 2)}</pre>}
      </div>
    </div>
  );
};

// ─── DATE PICKER EXAMPLES ───
type DateFormValues = {
  appointmentDate?: string;
};

const DatePickerSection = () => {
  const [standaloneValue, setStandaloneValue] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState<DateFormValues | undefined>();
  const form = useForm<DateFormValues>({
    defaultValues: {
      appointmentDate: undefined,
    },
  });

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">A. Standalone</p>
        <DatePicker
          label="Appointment Date"
          placeholder="Select date"
          value={standaloneValue}
          onValueChange={setStandaloneValue}
        />
        {standaloneValue && <pre className="rounded-md bg-muted p-3 text-xs">{standaloneValue}</pre>}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">B. Inside Form (React Hook Form)</p>
        <Form form={form} onSubmit={(data) => setSubmitted(data)} className="flex items-end gap-3">
          <DatePicker
            name="appointmentDate"
            label="Appointment Date"
            placeholder="Select date"
            displayFormat="MMMM d, yyyy"
          />
          <Button type="submit">Submit</Button>
        </Form>
        {submitted && <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(submitted, null, 2)}</pre>}
      </div>
    </div>
  );
};

// ─── DATE RANGE PICKER EXAMPLES ───

const DateRangePickerSection = () => {
  const [standaloneValue, setStandaloneValue] = useState<DateRange | undefined>();

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">A. Standalone (uncontrolled)</p>
        <DateRangePicker
          label="Date Range"
          description="Select a start and end date"
          placeholder="Select date range"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">B. Standalone controlled — shows selected range</p>
        <DateRangePicker
          label="Stay Duration"
          placeholder="Select stay dates"
          value={standaloneValue}
          onValueChange={setStandaloneValue}
        />
        {standaloneValue && (
          <pre className="rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(
              {
                from: standaloneValue.from?.toISOString(),
                to: standaloneValue.to?.toISOString(),
              },
              null,
              2,
            )}
          </pre>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">C. Single month view</p>
        <DateRangePicker
          label="Sprint Window"
          placeholder="Select sprint dates"
          numberOfMonths={1}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">D. Error state</p>
        <DateRangePicker
          label="Report Period"
          placeholder="Select report period"
          error="Date range is required"
        />
      </div>
    </div>
  );
};

// ─── DATE TIME RANGE PICKER EXAMPLES ───

const DateTimeRangePickerSection = () => {
  const [value, setValue] = useState<DateTimeRange | undefined>();

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">A. Standalone controlled</p>
        <DateTimeRangePicker
          label="Event Window"
          placeholder="Select event start & end"
          value={value}
          onValueChange={setValue}
        />
        {value && <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(value, null, 2)}</pre>}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">B. Single month view</p>
        <DateTimeRangePicker
          label="Sprint Window"
          placeholder="Select sprint start & end"
          numberOfMonths={1}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">C. Error state</p>
        <DateTimeRangePicker
          label="Report Period"
          placeholder="Select report period"
          error="Date time range is required"
        />
      </div>
    </div>
  );
};

// ─── DATE TIME PICKER EXAMPLES ───
type DateTimeFormValues = {
  expectedDelivery?: string;
};

const DateTimePickerSection = () => {
  const [standaloneValue, setStandaloneValue] = useState<string | undefined>('2026-05-10T04:30:00.000Z');
  const [submitted, setSubmitted] = useState<DateTimeFormValues | undefined>();
  const form = useForm<DateTimeFormValues>({
    defaultValues: {
      expectedDelivery: '2026-05-10T04:30:00.000Z',
    },
  });

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">A. Standalone</p>
        <DateTimePicker
          label="Expected Delivery"
          placeholder="Select date and time"
          value={standaloneValue}
          onValueChange={setStandaloneValue}
        />
        {standaloneValue && <pre className="rounded-md bg-muted p-3 text-xs">{standaloneValue}</pre>}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">B. Inside Form (React Hook Form)</p>
        <Form form={form} onSubmit={(data) => setSubmitted(data)} className="flex items-end gap-3">
          <DateTimePicker name="expectedDelivery" label="Expected Delivery" />
          <Button type="submit">Submit</Button>
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
      {result && <pre className="rounded-md bg-muted p-3 text-xs">{result}</pre>}
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
          <Section
            title="DateRangePicker"
            description="Standalone DateRangePicker — onValueChange emits a DateRange object with from/to Date values."
          >
            <DateRangePickerSection />
          </Section>
          <Section
            title="DatePicker"
            description="Standalone and Form-integrated DatePicker — value callbacks and submit payload use ISO strings."
          >
            <DatePickerSection />
          </Section>
          <Section
            title="DateTimeRangePicker"
            description="Standalone DateTimeRangePicker — onValueChange emits { from, to } ISO datetime strings."
          >
            <DateTimeRangePickerSection />
          </Section>
          <Section
            title="DateTimePicker"
            description="Standalone and Form-integrated DateTimePicker — value callbacks and submit payload use ISO datetime strings."
          >
            <DateTimePickerSection />
          </Section>
        </div>
      </div>
    </ConfirmProvider>
  );
};
