import React from 'react';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../shadcn/shadcnInputOTP';
import { cn } from '../../../shadcn/utils';

export interface OTPFieldProps {
  name?: string;

  value?: string;

  onChange?: (value: string) => void;

  length?: number;

  label?: string;

  description?: React.ReactNode;

  error?: string;

  disabled?: boolean;

  required?: boolean;

  className?: string;
}

// OTPField component - specialized input for one-time passwords with Field system
export const OTPField = React.forwardRef<HTMLInputElement, OTPFieldProps>(
  (
    {
      name: _name,
      value = '',
      onChange = () => {},
      length = 6,
      label,
      description,
      error,
      disabled,
      required,
      className,
    },
    _ref,
  ) => {
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
              {Array.from({ length }, (_, idx) => idx).map((position) => (
                <InputOTPSlot
                  key={position}
                  index={position}
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
