import React from 'react';
import PhoneInputBase, { type Country, type Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { cn } from '../../../shadcn/utils';

export interface PhoneFieldProps {
  /**
   * Field name for react-hook-form integration (used by Form component)
   */
  name?: string;

  /**
   * Phone number value in E.164 format (e.g., +14155552671)
   */
  value?: Value;

  /**
   * Callback when phone number changes
   */
  onChange?: (value: Value | undefined) => void;

  /**
   * Default country code (e.g., 'US', 'IN', 'GB')
   */
  defaultCountry?: Country;

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
   * CSS class name for styling
   */
  className?: string;

  /**
   * Placeholder text for the input
   */
  placeholder?: string;
}

// PhoneField component - specialized input for international phone numbers with Field system
export const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
  (
    {
      name: _name,
      value,
      onChange = () => {},
      defaultCountry = 'IN',
      label,
      description,
      error,
      disabled,
      className,
      placeholder,
    },
    _ref,
  ) => {
    const fieldId = React.useId();
    const hasError = !!error;

    return (
      <Field data-disabled={disabled}>
        {label && <FieldLabel>{label}</FieldLabel>}

        <FieldContent>
          <PhoneInputBase
            international
            defaultCountry={defaultCountry}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            aria-describedby={description || error ? `${fieldId}-description ${fieldId}-error` : undefined}
            aria-invalid={hasError}
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 text-sm shadow-xs transition-[color,box-shadow]',
              'placeholder:text-muted-foreground',
              'focus-within:outline-none focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[1px]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              hasError && 'border-destructive focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40',
              className,
            )}
            numberInputProps={{
              className: cn(
                'flex-1 bg-transparent outline-none',
                'placeholder:text-muted-foreground',
                'disabled:cursor-not-allowed',
              ),
            }}
            countrySelectProps={{
              className: cn(
                'mr-2 bg-transparent border-none outline-none',
                'focus:ring-0',
                'disabled:cursor-not-allowed',
              ),
            }}
          />

          {description && <FieldDescription id={`${fieldId}-description`}>{description}</FieldDescription>}

          {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
        </FieldContent>
      </Field>
    );
  },
);

PhoneField.displayName = 'PhoneField';
