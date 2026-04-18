import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../Button';
import { Form } from '../Form/Form';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'ISO date string value (YYYY-MM-DD)',
    },
    displayFormat: {
      control: 'text',
      description: 'date-fns format used for anchor display',
    },
    disableInput: {
      control: 'boolean',
      description: 'Hide/show manual DD/MM/YYYY editor in popover',
    },
    onValueChange: {
      action: 'date-changed',
      description: 'Emits ISO date string (YYYY-MM-DD) or undefined',
    },
    calendarProps: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Due date',
    placeholder: 'Select date',
  },
};

export const WithInitialValue: Story = {
  args: {
    label: 'Invoice date',
    value: '2026-04-18',
  },
};

export const ManualEntryEnabled: Story = {
  args: {
    label: 'Expected delivery',
    disableInput: false,
    value: '2026-04-18',
  },
};

export const CustomDisplayFormat: Story = {
  args: {
    label: 'Custom display',
    value: '2026-04-18',
    displayFormat: 'EEEE, MMM d, yyyy',
    disableInput: false,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | undefined>('2026-04-18');
    return (
      <div className="w-[340px] space-y-3">
        <DatePicker label="Controlled DatePicker" value={value} onValueChange={setValue} disableInput={false} />
        <pre className="rounded-md bg-muted p-2 text-xs">{JSON.stringify({ value }, null, 2)}</pre>
      </div>
    );
  },
};

type DateFormValues = {
  invoiceDate?: string;
};

export const InForm: Story = {
  render: () => {
    const form = useForm<DateFormValues>({
      defaultValues: {
        invoiceDate: '2026-04-18',
      },
    });
    const [submitted, setSubmitted] = React.useState<DateFormValues | null>(null);

    return (
      <div className="w-[360px] space-y-4">
        <Form form={form} onSubmit={(data) => setSubmitted(data)}>
          <DatePicker name="invoiceDate" label="Invoice Date" disableInput={false} />
          <Button type="submit">Submit</Button>
        </Form>
        {submitted && <pre className="rounded-md bg-muted p-2 text-xs">{JSON.stringify(submitted, null, 2)}</pre>}
      </div>
    );
  },
};
