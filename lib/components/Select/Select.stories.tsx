import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { type PermissionGateFn, PermissionGateProvider } from '../PermissionGate';
import { Select } from './Select';
import type { SelectOption, SelectValue } from './types';

const fruits: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'mango', label: 'Mango', description: 'Seasonal' },
];

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text', description: 'Label for the field' },
    placeholder: { control: 'text', description: 'Placeholder shown when nothing is selected' },
    disabled: { control: 'boolean', description: 'Whether the field is disabled' },
    searchable: { control: 'boolean', description: 'Shows a search input in the popover' },
    permission: { control: 'text', description: 'Permission code gating the field' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = React.useState<SelectValue>(null);
    return (
      <div className="w-80">
        <Select
          {...args}
          label="Fruit"
          options={fruits}
          value={value}
          onChange={(next: SelectValue) => setValue(next)}
        />
      </div>
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = React.useState<SelectValue[]>([]);
    return (
      <div className="w-80">
        <Select
          multiple
          searchable
          label="Fruits"
          options={fruits}
          value={value}
          onChange={(next: SelectValue[]) => setValue(next)}
        />
      </div>
    );
  },
};

// Story-only gate: one code per state so each field below shows a different permission outcome
const storyGate: PermissionGateFn = (code) => {
  const hidden = code === 'demo.hidden';
  const reason = code === 'demo.plan-locked' ? 'PLAN' : code === 'demo.workspace-locked' ? 'WORKSPACE' : null;
  return {
    granted: !hidden,
    locked: reason !== null,
    reason,
    unlockPlans: reason === 'PLAN' ? ['Pro', 'Enterprise'] : [],
    missingServices: [],
    available: !hidden && reason === null,
    featureName: null,
    workspaceLabel: null,
    workspaceScope: reason === 'WORKSPACE' ? 'SITE' : null,
  };
};

// Permission gating: not granted renders nothing, locked renders disabled with a lock icon and upsell tooltip
export const WithPermission: Story = {
  render: () => (
    <PermissionGateProvider value={storyGate}>
      <div className="flex w-80 flex-col gap-4">
        <Select label="Granted" options={fruits} permission="demo.granted" />
        <Select label="Plan locked" options={fruits} value="apple" permission="demo.plan-locked" />
        <Select label="Workspace locked (multi)" multiple options={fruits} permission="demo.workspace-locked" />
        <Select label="Not granted (never rendered)" options={fruits} permission="demo.hidden" />
      </div>
    </PermissionGateProvider>
  ),
};
