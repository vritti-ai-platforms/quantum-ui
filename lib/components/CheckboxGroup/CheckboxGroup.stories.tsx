import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CheckboxGroup, type CheckboxOption } from './CheckboxGroup';

const options: CheckboxOption[] = [
  { value: 'email', label: 'Email', description: 'Order updates and receipts' },
  { value: 'sms', label: 'SMS', description: 'Time-sensitive alerts' },
  { value: 'push', label: 'Push notifications' },
  { value: 'whatsapp', label: 'WhatsApp', disabled: true },
];

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of the options',
    },
    columns: {
      control: 'number',
      description: 'Number of grid columns (overrides orientation)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the entire group',
    },
    clearable: {
      control: 'boolean',
      description: 'Show inline Select all / Clear actions in the header',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Notification channels',
    options,
    defaultValue: ['email'],
  },
};

export const Clearable: Story = {
  args: {
    label: 'Notification channels',
    description: 'Pick how you want to be notified.',
    options,
    defaultValue: ['email'],
    clearable: true,
  },
};

export const ClearableNoLabel: Story = {
  args: {
    options,
    clearable: true,
  },
};

// Demonstrates clearable in fully controlled mode
export const ClearableControlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>(['sms']);
    return (
      <div className="flex flex-col gap-4">
        <CheckboxGroup {...args} value={value} onValueChange={setValue} />
        <p className="text-xs text-muted-foreground">Selected: {value.join(', ') || '(none)'}</p>
      </div>
    );
  },
  args: {
    label: 'Notification channels',
    options,
    clearable: true,
  },
};
