import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { FilterCondition } from '../../types/conditions';
import { Button } from '../Button';
import { Form } from '../Form';
import { Select, SelectFilter, type SelectOption, type SelectValue } from '../Select';
import { Switch } from './Switch';
import { SwitchFilter } from './SwitchFilter';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
      description: 'Size of the switch',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Whether the switch is checked by default',
    },
    label: {
      control: 'text',
      description: 'Label for the switch',
    },
    description: {
      control: 'text',
      description: 'Helper text or description',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Usage (Bare Switch)

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const SmallChecked: Story = {
  args: {
    size: 'sm',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

// With Manual Label (Old Pattern - Still Supported)

export const WithManualLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Switch {...args} id="airplane-mode" />
      <label
        htmlFor="airplane-mode"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Airplane Mode
      </label>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <Switch size="sm" description="Small toggle" />
        <span className="text-xs text-muted-foreground">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch size="default" description="Default toggle" />
        <span className="text-xs text-muted-foreground">Default</span>
      </div>
    </div>
  ),
};

// Field System Integration (New Pattern)

export const WithLabel: Story = {
  args: {
    label: 'Enable notifications',
    defaultChecked: true,
  },
};

export const WithLabelAndDescription: Story = {
  args: {
    label: 'Marketing emails',
    description: 'Receive promotional content and updates',
    defaultChecked: false,
  },
};

export const WithError: Story = {
  args: {
    label: 'Accept terms and conditions',
    description: 'You must accept the terms to continue',
    error: 'You must accept the terms and conditions',
  },
};

export const DisabledWithLabel: Story = {
  args: {
    label: 'Airplane mode',
    description: 'Disable all wireless connections',
    disabled: true,
    defaultChecked: true,
  },
};

export const MultipleWithLabels: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <Switch label="Enable notifications" description="Get notified about updates" defaultChecked />
      <Switch label="Marketing emails" description="Receive promotional content" />
      <Switch label="Security alerts" description="Important security updates" defaultChecked />
    </div>
  ),
};

// Form Integration

export const InForm: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm({
      defaultValues: {
        notifications: true,
        marketing: false,
        terms: false,
      },
    });

    const onSubmit = (data: any) => {
      console.log('Form submitted:', data);
      alert(`Form submitted:\n${JSON.stringify(data, null, 2)}`);
    };

    return (
      <div className="w-96">
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
            <Switch name="notifications" label="Enable notifications" description="Receive email notifications" />

            <Switch name="marketing" label="Marketing emails" description="Receive promotional content" />

            <Switch name="terms" label="Accept terms and conditions" description="You must accept to continue" />

            <Button type="submit" className="w-full mt-4">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    );
  },
};

export const InFormWithValidation: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm({
      defaultValues: {
        terms: false,
        privacy: false,
      },
      mode: 'onChange',
    });

    const onSubmit = (data: any) => {
      console.log('Form submitted:', data);
      alert(`Form submitted:\n${JSON.stringify(data, null, 2)}`);
    };

    // Watch for changes to show validation
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const termsValue = form.watch('terms');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const privacyValue = form.watch('privacy');

    return (
      <div className="w-96">
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
            <Switch
              name="terms"
              label="Accept terms and conditions"
              description="You must accept the terms to continue"
              error={!termsValue ? 'You must accept the terms and conditions' : undefined}
            />

            <Switch
              name="privacy"
              label="Accept privacy policy"
              description="You must accept the privacy policy"
              error={!privacyValue ? 'You must accept the privacy policy' : undefined}
            />

            <Button type="submit" className="w-full mt-4" disabled={!termsValue || !privacyValue}>
              Submit
            </Button>
          </div>
        </Form>
      </div>
    );
  },
};

// SwitchFilter — boolean filter control

const items: SelectOption[] = [
  { value: 'paracetamol', label: 'Paracetamol 500mg' },
  { value: 'ibuprofen', label: 'Ibuprofen 400mg' },
  { value: 'cetirizine', label: 'Cetirizine 10mg' },
];

const stockStatuses: SelectOption[] = [
  { value: 'IN_STOCK', label: 'In stock' },
  { value: 'LOW', label: 'Low' },
  { value: 'OUT', label: 'Out of stock' },
];

export const FilterContextMode: Story = {
  render: () => {
    const [value, setValue] = useState<FilterCondition | null>(null);
    return (
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <SwitchFilter name="inStockOnly" label="In stock only" mode="context" value={value} onChange={setValue} />
          <SwitchFilter
            name="blocked"
            label="Blocked"
            mode="context"
            disabled
            disabledTip="Blocked items are hidden at this site"
          />
          <SwitchFilter name="loading" label="Loading" mode="context" loading />
        </div>
        <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>
      </div>
    );
  },
};

export const FilterContextModeInSelectHeader: Story = {
  render: () => {
    const [item, setItem] = useState<SelectValue>(null);
    const [stockStatus, setStockStatus] = useState<string[]>([]);
    const [inStockOnly, setInStockOnly] = useState<FilterCondition | null>(null);
    return (
      <div className="w-96">
        <Select
          label="Inventory Item"
          placeholder="Select inventory item"
          searchable
          options={items}
          value={item}
          onChange={(next: SelectValue) => setItem(next)}
          header={
            <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
              <SelectFilter
                name="stockStatus"
                label="Status"
                placeholder="All"
                multiple
                mode="context"
                options={stockStatuses}
                value={stockStatus}
                onChange={(result) => setStockStatus(result ? [result.value].flat().map(String) : [])}
              />
              <SwitchFilter
                name="inStockOnly"
                label="In stock only"
                mode="context"
                value={inStockOnly}
                onChange={setInStockOnly}
              />
            </div>
          }
        />
      </div>
    );
  },
};

export const FilterMode: Story = {
  render: () => {
    const [value, setValue] = useState<FilterCondition | null>({ field: 'active', operator: 'equals', value: 'true' });
    return (
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <SwitchFilter name="active" label="Active only" value={value} onChange={setValue} />
          <SwitchFilter name="archived" label="Archived" disabled disabledTip="Archived records are not filterable" />
        </div>
        <code className="text-xs text-muted-foreground">{JSON.stringify(value)}</code>
      </div>
    );
  },
};
