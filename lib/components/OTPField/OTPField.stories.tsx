import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { OTPField } from './OTPField';

const meta: Meta<typeof OTPField> = {
  title: 'Components/OTPField',
  component: OTPField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    length: {
      control: { type: 'number', min: 4, max: 8 },
      description: 'Number of OTP digits',
      table: {
        defaultValue: { summary: '6' },
      },
    },
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
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OTPField>;

export const Default: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('');
    return <OTPField value={otp} onChange={setOtp} />;
  },
};

export const WithLabel: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('');
    return <OTPField label="Verification Code" value={otp} onChange={setOtp} />;
  },
};

export const WithDescription: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('');
    return (
      <OTPField
        label="Enter OTP"
        value={otp}
        onChange={setOtp}
        description="Enter the 6-digit code sent to your phone"
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('123456');
    return <OTPField label="Verification Code" value={otp} onChange={setOtp} error="Invalid code. Please try again." />;
  },
};

export const Required: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('');
    return <OTPField label="Verification Code" value={otp} onChange={setOtp} required />;
  },
};

export const Disabled: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('123456');
    return <OTPField label="Verification Code" value={otp} onChange={setOtp} disabled />;
  },
};

export const FourDigits: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('');
    return <OTPField label="PIN Code" value={otp} onChange={setOtp} length={4} description="Enter your 4-digit PIN" />;
  },
};

export const EightDigits: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('');
    return (
      <OTPField
        label="Security Code"
        value={otp}
        onChange={setOtp}
        length={8}
        description="Enter the 8-digit security code"
      />
    );
  },
};

export const WithValidation: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('');
    const [touched, setTouched] = React.useState(false);

    const isComplete = otp.length === 6;
    const showError = touched && !isComplete;

    return (
      <div className="w-80">
        <OTPField
          label="Verification Code"
          value={otp}
          onChange={(value) => {
            setOtp(value);
            if (!touched && value.length > 0) setTouched(true);
          }}
          error={showError ? 'Please enter the complete 6-digit code' : undefined}
          description={showError ? undefined : isComplete ? '✓ Code entered' : 'Enter the code sent to your device'}
          required
        />

        {isComplete && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Code entered: <span className="font-mono font-semibold">{otp}</span>
          </div>
        )}
      </div>
    );
  },
};

export const VerificationFlow: Story = {
  render: () => {
    const [otp, setOtp] = React.useState('');
    const [isVerifying, setIsVerifying] = React.useState(false);
    const [isVerified, setIsVerified] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleVerify = React.useCallback(async () => {
      if (otp.length !== 6) return;

      setIsVerifying(true);
      setError('');

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate validation (accept 123456)
      if (otp === '123456') {
        setIsVerified(true);
      } else {
        setError('Invalid code. Please try again.');
      }

      setIsVerifying(false);
    }, [otp]);

    React.useEffect(() => {
      if (otp.length === 6 && !isVerified) {
        handleVerify();
      }
    }, [otp, handleVerify, isVerified]);

    return (
      <div className="w-96 space-y-4">
        <OTPField
          label="Verification Code"
          value={otp}
          onChange={(value) => {
            setOtp(value);
            setError('');
            setIsVerified(false);
          }}
          error={error || undefined}
          description={
            error
              ? undefined
              : isVerifying
                ? 'Verifying...'
                : isVerified
                  ? '✓ Code verified!'
                  : 'Enter the 6-digit code (try: 123456)'
          }
          disabled={isVerifying || isVerified}
          required
        />

        <div className="text-center text-sm">
          <button
            type="button"
            className="text-primary hover:text-primary/80 disabled:opacity-50"
            disabled={isVerifying || isVerified}
          >
            Resend code
          </button>
        </div>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => {
    const [otp1, setOtp1] = React.useState('');
    const [otp2, setOtp2] = React.useState('123456');
    const [otp3, setOtp3] = React.useState('999999');
    const [otp4, setOtp4] = React.useState('123456');

    return (
      <div className="space-y-8 w-96">
        <OTPField label="Default" value={otp1} onChange={setOtp1} description="Enter your verification code" />

        <OTPField label="Filled" value={otp2} onChange={setOtp2} description="✓ Code entered successfully" />

        <OTPField label="Error" value={otp3} onChange={setOtp3} error="Invalid code. Please try again." />

        <OTPField label="Disabled" value={otp4} onChange={setOtp4} disabled description="Field is disabled" />
      </div>
    );
  },
};
