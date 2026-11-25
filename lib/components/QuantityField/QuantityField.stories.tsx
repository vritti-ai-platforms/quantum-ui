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

export const ReadInBoxes: Story = { args: { value: 952, anchorUnitId: 'box' } };

export const Cascading: Story = { args: { value: 952, anchorUnitId: 'box', cascade: true } };

// Read only in strips and boxes, as a supplier sells them; tablets are still typed through the breakdown
export const SupplierUnitsOnly: Story = { args: { value: 950, anchorUnitIds: ['strip', 'box'] } };

export const Compact: Story = {
  render: (args) => (
    <div className="w-60">
      <QuantityField {...args} label={undefined} compact cascade value={952} defaultUnitId="box" />
    </div>
  ),
};

export const SingleUnit: Story = { args: { units: [units[0]], defaultUnitId: 'tab', value: 30 } };

export const DecimalPrimary: Story = {
  args: {
    units: [
      { id: 'ml', name: 'Millilitre', symbol: 'ml', primaryUomQty: 1, uomQty: 1, isPack: false },
      { id: 'l', name: 'Litre', symbol: 'L', primaryUomQty: 1000, uomQty: 1, isPack: false },
      { id: 'bottle', name: 'Bottle of 100 ml', symbol: 'bottle', primaryUomQty: 100, uomQty: 1 },
    ],
    primaryUnitId: 'ml',
    defaultUnitId: 'bottle',
    allowDecimal: true,
    value: 250.5,
  },
};

// The rules on the label row and the bound in words right after the value, read in the unit the field reads in
export const Bounds: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col gap-4">
      <QuantityField {...args} label="Max" value={30} max={40} positive nonZero />
      <QuantityField {...args} label="Over max" value={50} max={40} positive nonZero />
      <QuantityField {...args} label="Min" value={30} min={20} />
      <QuantityField {...args} label="Range" value={30} min={20} max={40} />
      <QuantityField {...args} label="Max across packs" anchorUnitId="box" max={120} positive />
    </div>
  ),
};
