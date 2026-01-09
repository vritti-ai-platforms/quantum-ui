import type { Meta, StoryObj } from '@storybook/react';
import { Lock } from 'lucide-react';
import { PasswordField } from './PasswordField';

const meta: Meta<typeof PasswordField> = {
  title: 'Components/PasswordField',
  component: PasswordField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the password field',
    },
    description: {
      control: 'text',
      description: 'Helper text to display below the field',
    },
    error: {
      control: 'text',
      description: 'Error message to display below the field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    showStrengthIndicator: {
      control: 'boolean',
      description: 'Whether to show password strength indicator',
    },
    toggleAriaLabel: {
      control: 'text',
      description: 'Custom aria-label for the visibility toggle button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic stories
export const Default: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    defaultValue: 'mySecurePassword123!',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    description: 'Password must be at least 8 characters long',
  },
};

// Password strength indicator
export const WithStrengthIndicator: Story = {
  args: {
    label: 'Create Password',
    placeholder: 'Enter your password',
    showStrengthIndicator: true,
    value: '',
  },
};

export const WeakPassword: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    showStrengthIndicator: true,
    value: 'weak',
  },
};

export const FairPassword: Story = {
  args: {
    label: 'Password',
    placeholder: 'password',
    showStrengthIndicator: true,
    value: 'Password',
  },
};

export const StrongPassword: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    showStrengthIndicator: true,
    value: 'MyStr0ng!Pass',
  },
};

// State variants
export const ErrorState: Story = {
  render: () => (
    <PasswordField
      label="Password"
      placeholder="Enter your password"
      defaultValue="weak"
      error="Password is too weak"
    />
  ),
};

export const SuccessState: Story = {
  render: () => (
    <PasswordField
      label="Password"
      placeholder="Enter your password"
      defaultValue="MyStr0ng!Pass"
      className="border-green-500 focus-visible:ring-green-200"
      description="Password is strong"
    />
  ),
};

export const WarningState: Story = {
  render: () => (
    <PasswordField
      label="Password"
      placeholder="Enter your password"
      defaultValue="weak"
      className="border-yellow-500 focus-visible:ring-yellow-200"
      description="Consider using a stronger password"
    />
  ),
};

// Size variants
export const Small: Story = {
  args: {
    label: 'Small Password Field',
    placeholder: 'Small size',
    className: 'h-8 text-sm',
  },
};

export const Medium: Story = {
  args: {
    label: 'Medium Password Field',
    placeholder: 'Medium size (default)',
  },
};

export const Large: Story = {
  args: {
    label: 'Large Password Field',
    placeholder: 'Large size',
    className: 'h-12 text-lg',
  },
};

// State examples
export const Disabled: Story = {
  args: {
    label: 'Disabled Password Field',
    placeholder: 'This field is disabled',
    defaultValue: 'Cannot edit this',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only Password Field',
    defaultValue: 'This is read only',
    readOnly: true,
  },
};

// Form examples
export const SignupForm: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <PasswordField
        label="Create Password"
        placeholder="Enter your password"
        showStrengthIndicator={true}
        value="MyStr0ng!Pass"
        onChange={() => {}}
      />
      <PasswordField
        label="Confirm Password"
        placeholder="Confirm your password"
        value="MyStr0ng!Pass"
        onChange={() => {}}
        className="border-green-500 focus-visible:ring-green-200"
        description="Passwords match"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const SignupFormWithError: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <PasswordField
        label="Create Password"
        placeholder="Enter your password"
        showStrengthIndicator={true}
        value="MyStr0ng!Pass"
        onChange={() => {}}
      />
      <PasswordField
        label="Confirm Password"
        placeholder="Confirm your password"
        value="MyStr0ngPass"
        onChange={() => {}}
        error="Passwords do not match"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const PasswordChangeForm: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <PasswordField label="Current Password" placeholder="Enter your current password" />
      <PasswordField
        label="New Password"
        placeholder="Enter your new password"
        showStrengthIndicator={true}
        value="NewStr0ng!Pass"
        onChange={() => {}}
      />
      <PasswordField
        label="Confirm New Password"
        placeholder="Confirm your new password"
        value="NewStr0ng!Pass"
        onChange={() => {}}
        className="border-green-500 focus-visible:ring-green-200"
        description="Passwords match"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <PasswordField label="Small Size" placeholder="Small password field" className="h-8 text-sm" />
      <PasswordField label="Medium Size (Default)" placeholder="Medium password field" />
      <PasswordField label="Large Size" placeholder="Large password field" className="h-12 text-lg" />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <PasswordField label="Normal State" placeholder="Normal password" />
      <PasswordField
        label="Success State"
        placeholder="Success password"
        defaultValue="MyStr0ng!Pass"
        className="border-green-500 focus-visible:ring-green-200"
        description="Password is strong"
      />
      <PasswordField
        label="Warning State"
        placeholder="Warning password"
        defaultValue="weak"
        className="border-yellow-500 focus-visible:ring-yellow-200"
        description="Consider using a stronger password"
      />
      <PasswordField
        label="Error State"
        placeholder="Error password"
        defaultValue="123"
        error="Password must be at least 8 characters"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const WithStartAdornment: Story = {
  render: () => (
    <PasswordField
      label="Password"
      placeholder="Enter your password"
      startAdornment={<Lock className="h-4 w-4 text-muted-foreground" />}
    />
  ),
};

export const StrengthIndicatorExamples: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <PasswordField
        label="Weak Password"
        placeholder="Enter your password"
        showStrengthIndicator={true}
        value="weak"
        onChange={() => {}}
        description="Add uppercase, numbers, and special characters"
      />
      <PasswordField
        label="Fair Password"
        placeholder="Enter your password"
        showStrengthIndicator={true}
        value="Password123"
        onChange={() => {}}
        description="Add special characters for better security"
      />
      <PasswordField
        label="Strong Password"
        placeholder="Enter your password"
        showStrengthIndicator={true}
        value="MyStr0ng!Pass"
        onChange={() => {}}
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const CustomToggleAriaLabel: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    defaultValue: 'myPassword',
    toggleAriaLabel: 'Toggle password visibility',
  },
};
