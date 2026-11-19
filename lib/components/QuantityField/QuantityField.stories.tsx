import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QuantityField } from './QuantityField';
import type { QuantityUnit } from './quantity';

const units: QuantityUnit[] = [
  { id: 'tab', name: 'Tablet', symbol: 'tab', primaryUomQty: 1, uomQty: 1 },
  { id: 'strip', name: 'Strip of 10', symbol: 'strip', primaryUomQty: 10, uomQty: 1 },
  { id: 'box', name: 'Box of 100', symbol: 'box', primaryUomQty: 100, uomQty: 1 },
];

const meta: Meta<typeof QuantityField> = {
  title: 'Components/QuantityField',
  component: QuantityField,
  args: { units, primaryUnitId: 'tab', defaultUnitId: 'strip', label: 'Quantity' },
};

export default meta;

type Story = StoryObj<typeof QuantityField>;

export const Default: Story = {};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<number | null | undefined>(25);
    return (
      <div className="flex w-80 flex-col gap-2">
        <QuantityField {...args} value={value} onChange={setValue} />
        <p className="text-sm text-muted-foreground">Stored: {value ?? '—'} tab</p>
      </div>
    );
  },
};

export const WithQuantityError: Story = {
  args: { value: 1200, error: 'Must be at most the reorder point ({{qty:1000}})' },
};

export const Loading: Story = { args: { units: [], loading: true } };

export const Disabled: Story = { args: { value: 30, disabled: true } };
