import React from 'react';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../shadcn/shadcnInputOTP';
import { cn } from '../../../shadcn/utils';

export interface OTPFieldProps {
  /**
   * Field name for react-hook-form integration (used by Form component)
   */
  name?: string;

  /**
   * OTP value
   */
  value?: string;

  /**
   * Callback when OTP changes
   */
  onChange?: (value: string) => void;

  /**
   * Number of OTP digits
   * @default 6
   */
  length?: number;

  /**
   * Label for the field
   */
  label?: string;

  /**
   * Helper text or description to display below the field
   */
  description?: React.ReactNode;

  /**
   * Error message to display below the field
   */
  error?: string;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * CSS class name for styling
   */
  className?: string;
}

// OTPField component - specialized input for one-time passwords with Field system
export const OTPField = React.forwardRef<HTMLInputElement, OTPFieldProps>(
  ({ name: _name, value = '', onChange = () => {}, length = 6, label, description, error, disabled, required, className }, _ref) => {
    const fieldId = React.useId();
    const hasError = !!error;

    return (
      <Field data-disabled={disabled}>
        {label && (
          <FieldLabel htmlFor={fieldId}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FieldLabel>
        )}

        <FieldContent>
          <InputOTP
            maxLength={length}
            value={value}
            onChange={onChange}
            disabled={disabled}
            containerClassName={cn('justify-center', className)}
            aria-describedby={description || error ? `${fieldId}-description ${fieldId}-error` : undefined}
            aria-invalid={hasError}
          >
            <InputOTPGroup>
              {Array.from({ length }, (_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className={cn(
                    hasError &&
                      'border-destructive focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40',
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {description && (
            <FieldDescription id={`${fieldId}-description`} className="text-center">
              {description}
            </FieldDescription>
          )}

          {error && (
            <FieldError id={`${fieldId}-error`} className="text-center">
              {error}
            </FieldError>
          )}
        </FieldContent>
      </Field>
    );
  },
);

OTPField.displayName = 'OTPField';
