import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the date picker',
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
    value: {
      control: 'date',
      description: 'Selected date',
    },
    onValueChange: {
      action: 'date-changed',
      description: 'Callback when date changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic stories
export const Default: Story = {
  args: {
    placeholder: 'Select date',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Date of birth',
    placeholder: 'Select date',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Date of birth',
    description: 'Please select your date of birth',
    placeholder: 'Select date',
  },
};

export const WithError: Story = {
  args: {
    label: 'Date of birth',
    error: 'This field is required',
    placeholder: 'Select date',
  },
};

export const WithSelectedDate: Story = {
  args: {
    label: 'Date of birth',
    value: new Date('1990-01-15'),
    placeholder: 'Select date',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    label: 'Appointment date',
    placeholder: 'Choose a date',
  },
};

// Controlled example
export const Controlled: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    return (
      <div className="flex flex-col gap-4">
        <DatePicker label="Controlled Date Picker" value={date} onValueChange={setDate} placeholder="Select date" />
        {date && <p className="text-sm text-muted-foreground">Selected: {date.toLocaleDateString()}</p>}
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
    <div className="flex flex-col gap-6 w-80">
      <DatePicker label="Default" placeholder="Select date" />
      <DatePicker label="With Description" description="This is a helper text" placeholder="Select date" />
      <DatePicker label="With Error" error="This field is required" placeholder="Select date" />
      <DatePicker label="With Selected Date" value={new Date('2024-01-15')} placeholder="Select date" />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
