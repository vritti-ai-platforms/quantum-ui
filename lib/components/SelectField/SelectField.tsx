import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shadcn/shadcnSelect';
import { cn } from '../../../shadcn/utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';

/**
 * Option type for SelectField
 */
export interface SelectOption {
  /**
   * The value to be submitted when this option is selected
   */
  value: string;

  /**
   * The display label for the option
   */
  label: string;

  /**
   * Whether this option is disabled
   */
  disabled?: boolean;
}

/**
 * Props for the SelectField component
 */
export interface SelectFieldProps {
  /**
   * Label for the field
   */
  label?: string;

  /**
   * Helper text to display below the field
   */
  description?: React.ReactNode;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;

  /**
   * Array of options to display in the select
   */
  options: SelectOption[];

  /**
   * The controlled value of the select
   */
  value?: string;

  /**
   * Callback when the value changes (compatible with react-hook-form)
   */
  onChange?: (value: string) => void;

  /**
   * Callback when the select loses focus (compatible with react-hook-form)
   */
  onBlur?: () => void;

  /**
   * Name attribute for form integration
   */
  name?: string;

  /**
   * Whether the select is disabled
   */
  disabled?: boolean;

  /**
   * Whether the select is required
   */
  required?: boolean;

  /**
   * Additional CSS classes for the trigger element
   */
  className?: string;

  /**
   * ID for the select trigger element
   */
  id?: string;

  /**
   * Default value for uncontrolled usage
   */
  defaultValue?: string;
}

/**
 * SelectField component - A form field wrapper for Radix Select primitive
 *
 * Integrates with the Field system and provides a consistent API
 * compatible with react-hook-form.
 *
 * @example
 * ```tsx
 * <SelectField
 *   label="Country"
 *   placeholder="Select a country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *     { value: 'ca', label: 'Canada' },
 *   ]}
 *   value={value}
 *   onChange={setValue}
 *   error={errors.country?.message}
 * />
 * ```
 */
export const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  (
    {
      label,
      description,
      error,
      placeholder = 'Select an option',
      options,
      value,
      onChange,
      onBlur,
      name,
      disabled = false,
      required,
      className,
      id,
      defaultValue,
    },
    ref,
  ) => {
    return (
      <Field>
        {label && <FieldLabel>{label}</FieldLabel>}

        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          name={name}
          defaultValue={defaultValue}
          required={required}
        >
          <SelectTrigger ref={ref} id={id} onBlur={onBlur} aria-invalid={!!error} className={cn('w-full', className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

SelectField.displayName = 'SelectField';
