import type { Meta, StoryObj } from '@storybook/react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Search,
  User,
  X,
} from 'lucide-react';
import React from 'react';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the field',
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
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'Input type',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic stories
export const Default: Story = {
  render: () => <TextField label="Email Address" placeholder="Enter your email" />,
};

export const WithValue: Story = {
  render: () => <TextField label="Email Address" placeholder="Enter your email" defaultValue="john.doe@example.com" />,
};

export const PasswordInput: Story = {
  render: () => <TextField label="Password" placeholder="Enter your password" type="password" />,
};

export const WithDescription: Story = {
  render: () => (
    <TextField
      label="Username"
      placeholder="Choose a username"
      description="Username must be at least 3 characters long"
    />
  ),
};

// State variants
export const ErrorState: Story = {
  render: () => (
    <TextField
      label="Email Address"
      placeholder="Enter your email"
      defaultValue="invalid-email"
      error="Please enter a valid email address"
    />
  ),
};

export const SuccessState: Story = {
  render: () => (
    <TextField
      label="Email Address"
      placeholder="Enter your email"
      defaultValue="john.doe@example.com"
      className="border-green-500 focus-visible:ring-green-200"
      description="Email address is valid"
    />
  ),
};

export const WarningState: Story = {
  render: () => (
    <TextField
      label="Password"
      placeholder="Enter your password"
      type="password"
      defaultValue="weak"
      className="border-yellow-500 focus-visible:ring-yellow-200"
      description="Consider using a stronger password"
    />
  ),
};

// Size variants (using className for styling)
export const Small: Story = {
  render: () => <TextField label="Small Input" placeholder="Small size" className="h-8 text-sm" />,
};

export const Medium: Story = {
  render: () => <TextField label="Medium Input" placeholder="Medium size (default)" />,
};

export const Large: Story = {
  render: () => <TextField label="Large Input" placeholder="Large size" className="h-12 text-lg" />,
};

// Different input types
export const Password: Story = {
  render: () => <TextField label="Password" placeholder="Enter your password" type="password" />,
};

export const Email: Story = {
  render: () => <TextField label="Email Address" placeholder="Enter your email" type="email" />,
};

export const Number: Story = {
  render: () => <TextField label="Age" placeholder="Enter your age" type="number" min={0} max={120} />,
};

export const SearchField: Story = {
  render: () => <TextField label="Search" placeholder="Search for anything..." type="search" />,
};

export const Tel: Story = {
  render: () => <TextField label="Phone Number" placeholder="+1 (555) 000-0000" type="tel" />,
};

export const URL: Story = {
  render: () => <TextField label="Website" placeholder="https://example.com" type="url" />,
};

// State examples
export const Disabled: Story = {
  render: () => (
    <TextField
      label="Disabled Field"
      placeholder="This field is disabled"
      defaultValue="Cannot edit this"
      disabled={true}
    />
  ),
};

export const ReadOnly: Story = {
  render: () => <TextField label="Read Only Field" defaultValue="This is read only" readOnly={true} />,
};

// Form example
export const LoginForm: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <TextField label="Email Address" placeholder="Enter your email" type="email" />
      <TextField label="Password" placeholder="Enter your password" type="password" />
      <TextField
        label="Confirm Password"
        placeholder="Confirm your password"
        type="password"
        error="Passwords do not match"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const ContactForm: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <TextField label="First Name" placeholder="John" />
        <TextField label="Last Name" placeholder="Doe" />
      </div>
      <TextField label="Email Address" placeholder="john.doe@example.com" type="email" />
      <TextField label="Phone Number" placeholder="+1 (555) 000-0000" type="tel" />
      <TextField label="Company" placeholder="Acme Corp" />
      <TextField
        label="Website"
        placeholder="https://example.com"
        type="url"
        description="Optional: Include your company website"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <TextField label="Small Size" placeholder="Small input field" className="h-8 text-sm" />
      <TextField label="Medium Size (Default)" placeholder="Medium input field" />
      <TextField label="Large Size" placeholder="Large input field" className="h-12 text-lg" />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <TextField label="Normal State" placeholder="Normal input" />
      <TextField
        label="Success State"
        placeholder="Success input"
        defaultValue="Valid input"
        className="border-green-500 focus-visible:ring-green-200"
        description="This input is valid"
      />
      <TextField
        label="Warning State"
        placeholder="Warning input"
        defaultValue="Potentially problematic input"
        className="border-yellow-500 focus-visible:ring-yellow-200"
        description="Please double-check this input"
      />
      <TextField
        label="Error State"
        placeholder="Error input"
        defaultValue="Invalid input"
        error="This input contains errors"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

// Adornment examples
export const WithStartAdornment: Story = {
  render: () => (
    <TextField
      label="Email Address"
      placeholder="Enter your email"
      type="email"
      startAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
    />
  ),
};

export const WithEndAdornment: Story = {
  render: () => (
    <TextField
      label="Email Address"
      placeholder="Enter your email"
      type="email"
      defaultValue="john.doe@example.com"
      endAdornment={<CheckCircle className="h-4 w-4 text-green-500" />}
    />
  ),
};

export const WithBothAdornments: Story = {
  render: () => (
    <TextField
      label="Search Users"
      placeholder="Search..."
      type="search"
      startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
      endAdornment={<X className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />}
    />
  ),
};

export const AdornmentExamples: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <TextField
        label="Email Address"
        placeholder="Enter your email"
        type="email"
        startAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
      />
      <TextField
        label="Password"
        placeholder="Enter your password"
        type="password"
        startAdornment={<Lock className="h-4 w-4 text-muted-foreground" />}
      />
      <TextField
        label="Search"
        placeholder="Search..."
        type="search"
        startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
      />
      <TextField
        label="Username"
        placeholder="Enter username"
        startAdornment={<User className="h-4 w-4 text-muted-foreground" />}
      />
      <TextField
        label="Phone Number"
        placeholder="+1 (555) 000-0000"
        type="tel"
        startAdornment={<Phone className="h-4 w-4 text-muted-foreground" />}
      />
      <TextField
        label="Date"
        placeholder="Select date"
        type="date"
        startAdornment={<Calendar className="h-4 w-4 text-muted-foreground" />}
      />
      <TextField
        label="Amount"
        placeholder="0.00"
        type="number"
        startAdornment={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const ValidationWithAdornments: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <TextField
        label="Valid Email"
        placeholder="Enter your email"
        type="email"
        defaultValue="john.doe@example.com"
        startAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
        endAdornment={<CheckCircle className="h-4 w-4 text-green-500" />}
        description="Email is valid"
      />
      <TextField
        label="Invalid Email"
        placeholder="Enter your email"
        type="email"
        defaultValue="invalid-email"
        error="Please enter a valid email address"
        startAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
        endAdornment={<AlertCircle className="h-4 w-4 text-destructive" />}
      />
      <TextField
        label="Loading State"
        placeholder="Processing..."
        startAdornment={<User className="h-4 w-4 text-muted-foreground" />}
        endAdornment={<Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />}
        description="Checking username availability..."
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const InteractiveAdornments: Story = {
  render: () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState('');

    return (
      <div className="w-96 space-y-4">
        <TextField
          label="Password"
          placeholder="Enter your password"
          type={showPassword ? 'text' : 'password'}
          defaultValue="mySecretPassword"
          startAdornment={<Lock className="h-4 w-4 text-muted-foreground" />}
          endAdornment={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              )}
            </button>
          }
        />
        <TextField
          label="Search"
          placeholder="Type to search..."
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          startAdornment={<Search className="h-4 w-4 text-muted-foreground" />}
          endAdornment={
            searchValue && (
              <button type="button" onClick={() => setSearchValue('')} className="focus:outline-none">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )
          }
        />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};
