import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../Button';
import { Form } from '../Form/Form';
import { DateTimePicker } from './DateTimePicker';

const meta: Meta<typeof DateTimePicker> = {
  title: 'Components/DateTimePicker',
  component: DateTimePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'ISO datetime string value (e.g. 2026-05-10T04:30:00.000Z)',
    },
    displayFormat: {
      control: 'text',
      description: 'date-fns format used for anchor display',
    },
    onValueChange: {
      action: 'datetime-changed',
      description: 'Emits ISO datetime string (UTC, Z)',
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
    label: 'Expected Delivery',
    placeholder: 'Select date and time',
  },
};

export const WithInitialValue: Story = {
  args: {
    label: 'Expected Delivery',
    value: '2026-05-10T04:30:00.000Z',
  },
};

export const CustomDisplayFormat: Story = {
  args: {
    label: 'Expected Delivery',
    value: '2026-05-10T04:30:00.000Z',
    displayFormat: 'dd MMM yyyy, hh:mm a',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Expected Delivery',
    value: '2026-05-10T04:30:00.000Z',
    disabled: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState<string | undefined>('2026-05-10T04:30:00.000Z');
    return (
      <div className="w-[360px] space-y-3">
        <DateTimePicker label="Controlled DateTimePicker" value={value} onValueChange={setValue} />
        <pre className="rounded-md bg-muted p-2 text-xs">{JSON.stringify({ value }, null, 2)}</pre>
      </div>
    );
  },
};

type DateTimeFormValues = {
  expectedDelivery?: string;
};

export const InForm: Story = {
  render: () => {
    const form = useForm<DateTimeFormValues>({
      defaultValues: {
        expectedDelivery: '2026-05-10T04:30:00.000Z',
      },
    });
    const [submitted, setSubmitted] = React.useState<DateTimeFormValues | null>(null);

    return (
      <div className="w-[380px] space-y-4">
        <Form form={form} onSubmit={(data) => setSubmitted(data)}>
          <DateTimePicker name="expectedDelivery" label="Expected Delivery" />
          <Button type="submit">Submit</Button>
        </Form>
        {submitted && <pre className="rounded-md bg-muted p-2 text-xs">{JSON.stringify(submitted, null, 2)}</pre>}
      </div>
    );
  },
};
