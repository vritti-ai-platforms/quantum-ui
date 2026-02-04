import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { Button } from '../Button';
import { Form } from '../Form';
import { Switch } from './Switch';

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

// ============================================================================
// Basic Usage (Bare Switch)
// ============================================================================

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

// ============================================================================
// With Manual Label (Old Pattern - Still Supported)
// ============================================================================

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
        <Switch size="sm" />
        <span className="text-xs text-muted-foreground">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Switch size="default" />
        <span className="text-xs text-muted-foreground">Default</span>
      </div>
    </div>
  ),
};

// ============================================================================
// Field System Integration (New Pattern)
// ============================================================================

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

// ============================================================================
// Form Integration
// ============================================================================

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
