import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TimePicker } from './TimePicker';
import { TimePickerPanel } from './TimePickerPanel';

const meta: Meta<typeof TimePicker> = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    use12Hour: { control: 'boolean' },
    hourStep: { control: 'number' },
    minuteStep: { control: 'number' },
    disabled: { control: 'boolean' },
    onChange: { action: 'time-changed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Select time',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Start Time',
    placeholder: 'Select time',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Start Time',
    description: 'Select your preferred time',
    placeholder: 'Select time',
  },
};

export const WithError: Story = {
  args: {
    label: 'Start Time',
    error: 'This field is required',
    placeholder: 'Select time',
  },
};

export const With24Hour: Story = {
  args: {
    label: 'Time (24h)',
    use12Hour: false,
    placeholder: 'Select time',
  },
};

export const WithPreselectedTime: Story = {
  args: {
    label: 'Meeting Time',
    value: new Date(2025, 0, 1, 14, 30),
  },
};

export const MinuteStep15: Story = {
  args: {
    label: 'Quarter Hours',
    minuteStep: 15,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    value: new Date(2025, 0, 1, 9, 0),
  },
};

// Controlled example
export const Controlled: Story = {
  render: () => {
    const [time, setTime] = React.useState<Date | undefined>(undefined);
    return (
      <div className="flex flex-col gap-4">
        <TimePicker label="Controlled TimePicker" value={time} onChange={setTime} />
        {time && (
          <p className="text-sm text-muted-foreground">
            Selected: {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
          </p>
        )}
      </div>
    );
  },
};

// All states
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <TimePicker label="Default (12h)" />
      <TimePicker label="24 Hour" use12Hour={false} />
      <TimePicker label="15min Steps" minuteStep={15} />
      <TimePicker label="With Description" description="Choose a time slot" />
      <TimePicker label="With Error" error="Invalid time" />
      <TimePicker label="Disabled" disabled />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Standalone panel
export const PanelOnly: Story = {
  render: () => {
    const [time, setTime] = React.useState<Date>(new Date());
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-sm text-muted-foreground">TimePickerPanel (standalone, no popover):</p>
        <div className="border border-border rounded-md">
          <TimePickerPanel value={time} onValueChange={setTime} />
        </div>
        <p className="text-sm text-muted-foreground">
          {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
        </p>
      </div>
    );
  },
};

// Panel with 24h mode
export const Panel24Hour: Story = {
  render: () => {
    const [time, setTime] = React.useState<Date>(new Date());
    return (
      <div className="flex flex-col gap-4 items-center">
        <p className="text-sm text-muted-foreground">24h Panel:</p>
        <div className="border border-border rounded-md">
          <TimePickerPanel value={time} onValueChange={setTime} use12Hour={false} />
        </div>
      </div>
    );
  },
};
