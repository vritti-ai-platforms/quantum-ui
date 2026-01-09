import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { isValidPhoneNumber, PhoneField, type PhoneValue } from './index';

const meta: Meta<typeof PhoneField> = {
  title: 'Components/PhoneField',
  component: PhoneField,
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
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    defaultCountry: {
      control: { type: 'select' },
      options: ['US', 'IN', 'GB', 'DE', 'FR', 'AU', 'CA', 'JP'],
      description: 'Default country code',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PhoneField>;

// Basic stories
export const Default: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue>();
    return <PhoneField label="Phone Number" value={phone} onChange={(value) => setPhone(value)} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue | undefined>('+14155552671' as PhoneValue);
    return <PhoneField label="Phone Number" value={phone} onChange={(value) => setPhone(value)} />;
  },
};

export const WithHelperText: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue>();
    return (
      <PhoneField
        label="Phone Number"
        value={phone}
        onChange={(value) => setPhone(value)}
        description="Enter your phone number with country code"
      />
    );
  },
};

// Different default countries
export const DefaultCountryUS: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue>();
    return (
      <PhoneField
        label="US Phone Number"
        value={phone}
        onChange={(value) => setPhone(value)}
        defaultCountry="US"
        description="Default: United States"
      />
    );
  },
};

export const DefaultCountryIndia: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue>();
    return (
      <PhoneField
        label="Indian Phone Number"
        value={phone}
        onChange={(value) => setPhone(value)}
        defaultCountry="IN"
        description="Default: India"
      />
    );
  },
};

export const DefaultCountryUK: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue>();
    return (
      <PhoneField
        label="UK Phone Number"
        value={phone}
        onChange={(value) => setPhone(value)}
        defaultCountry="GB"
        description="Default: United Kingdom"
      />
    );
  },
};

export const DefaultCountryGermany: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue>();
    return (
      <PhoneField
        label="German Phone Number"
        value={phone}
        onChange={(value) => setPhone(value)}
        defaultCountry="DE"
        description="Default: Germany"
      />
    );
  },
};

// State variants
export const ErrorState: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue | undefined>('+1234' as PhoneValue);
    return (
      <PhoneField
        label="Phone Number"
        value={phone}
        onChange={(value) => setPhone(value)}
        error="Please enter a valid phone number"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue | undefined>('+14155552671' as PhoneValue);
    return (
      <PhoneField
        label="Phone Number"
        value={phone}
        onChange={(value) => setPhone(value)}
        disabled={true}
        description="This field is disabled"
      />
    );
  },
};

// Interactive validation example
export const WithValidation: Story = {
  render: () => {
    const [phone, setPhone] = React.useState<PhoneValue>();
    const [touched, setTouched] = React.useState(false);

    const isValid = phone ? isValidPhoneNumber(phone) : null;
    const showError = touched && phone && !isValid;
    const showSuccess = touched && phone && isValid;

    return (
      <div className="w-80">
        <PhoneField
          label="Phone Number"
          value={phone}
          onChange={(value) => {
            setPhone(value);
            if (!touched) setTouched(true);
          }}
          error={showError ? 'Invalid phone number' : undefined}
          description={
            showError ? undefined : showSuccess ? '✓ Valid phone number' : 'Enter a valid international phone number'
          }
        />

        {phone && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-xs space-y-1">
            <p>
              <strong>Value:</strong> {phone}
            </p>
            <p>
              <strong>Valid:</strong> {isValid ? '✓ Yes' : '✗ No'}
            </p>
            <p>
              <strong>Format:</strong> E.164
            </p>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};

// Multiple countries showcase
export const AllCountries: Story = {
  render: () => {
    const [phoneUS, setPhoneUS] = React.useState<PhoneValue>();
    const [phoneIN, setPhoneIN] = React.useState<PhoneValue>();
    const [phoneGB, setPhoneGB] = React.useState<PhoneValue>();
    const [phoneDE, setPhoneDE] = React.useState<PhoneValue>();

    return (
      <div className="w-80 space-y-4">
        <PhoneField label="United States" value={phoneUS} onChange={(value) => setPhoneUS(value)} defaultCountry="US" />
        <PhoneField label="India" value={phoneIN} onChange={(value) => setPhoneIN(value)} defaultCountry="IN" />
        <PhoneField
          label="United Kingdom"
          value={phoneGB}
          onChange={(value) => setPhoneGB(value)}
          defaultCountry="GB"
        />
        <PhoneField label="Germany" value={phoneDE} onChange={(value) => setPhoneDE(value)} defaultCountry="DE" />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};

// Form example
export const ContactForm: Story = {
  render: () => {
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState<PhoneValue>();

    return (
      <div className="w-96 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
          />
        </div>

        <PhoneField
          label="Phone Number"
          value={phone}
          onChange={(value) => setPhone(value)}
          description="We'll never share your phone number"
        />

        <button className="w-full h-9 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Submit</button>
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};

// All states showcase
export const AllStates: Story = {
  render: () => {
    const [phoneNormal, setPhoneNormal] = React.useState<PhoneValue | undefined>();
    const [phoneValid, setPhoneValid] = React.useState<PhoneValue | undefined>('+14155552671' as PhoneValue);
    const [phoneInvalid, setPhoneInvalid] = React.useState<PhoneValue | undefined>('+1234' as PhoneValue);
    const [phoneDisabled, setPhoneDisabled] = React.useState<PhoneValue | undefined>('+14155552671' as PhoneValue);

    return (
      <div className="w-80 space-y-4">
        <PhoneField label="Normal State" value={phoneNormal} onChange={(value) => setPhoneNormal(value)} />

        <PhoneField
          label="Valid Phone"
          value={phoneValid}
          onChange={(value) => setPhoneValid(value)}
          description="✓ This phone number is valid"
        />

        <PhoneField
          label="Invalid Phone"
          value={phoneInvalid}
          onChange={(value) => setPhoneInvalid(value)}
          error="Please enter a valid phone number"
        />

        <PhoneField
          label="Disabled State"
          value={phoneDisabled}
          onChange={(value) => setPhoneDisabled(value)}
          disabled={true}
          description="This field is disabled"
        />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};
