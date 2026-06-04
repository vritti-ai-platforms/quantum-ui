import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import type { DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the date range picker',
    },
    description: {
      control: 'text',
      description: 'Helper text to display below the field',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    onValueChange: {
      action: 'range-changed',
      description: 'Callback when date range changes',
    },
    numberOfMonths: {
      control: 'number',
      description: 'Number of months displayed in the calendar',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic stories
export const Default: Story = {
  args: {
    placeholder: 'Select date range',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Reporting period',
    placeholder: 'Select date range',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Reporting period',
    description: 'Pick a start and end date for the report',
    placeholder: 'Select date range',
  },
};

export const WithError: Story = {
  args: {
    label: 'Reporting period',
    error: 'This field is required',
    placeholder: 'Select date range',
  },
};

export const WithSelectedRange: Story = {
  args: {
    label: 'Reporting period',
    value: { from: new Date('2024-01-15'), to: new Date('2024-02-15') },
    placeholder: 'Select date range',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    label: 'Booking window',
    placeholder: 'Choose a range',
  },
};

// Controlled example
export const Controlled: Story = {
  render: () => {
    const [range, setRange] = React.useState<DateRange | undefined>(undefined);
    return (
      <div className="flex flex-col gap-4">
        <DateRangePicker
          label="Controlled Date Range Picker"
          value={range}
          onValueChange={setRange}
          placeholder="Select date range"
        />
        {range?.from && (
          <p className="text-sm text-muted-foreground">
            Selected: {range.from.toLocaleDateString()}
            {range.to ? ` – ${range.to.toLocaleDateString()}` : ''}
          </p>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};

// Multiple examples
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-96">
      <DateRangePicker label="Default" placeholder="Select date range" />
      <DateRangePicker label="With Description" description="This is a helper text" placeholder="Select date range" />
      <DateRangePicker label="With Error" error="This field is required" placeholder="Select date range" />
      <DateRangePicker
        label="With Selected Range"
        value={{ from: new Date('2024-01-15'), to: new Date('2024-02-15') }}
        placeholder="Select date range"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
