import * as React from 'react';
import {
  Select as ShadcnSelect,
  SelectContent as ShadcnSelectContent,
  SelectItem as ShadcnSelectItem,
  SelectTrigger as ShadcnSelectTrigger,
  SelectValue as ShadcnSelectValue,
} from '../../../../../shadcn/shadcnSelect';
import { cn } from '../../../../../shadcn/utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../../Field';
import type { SelectOption } from '../../types';

export interface SingleSelectProps {
  label?: string;
  description?: React.ReactNode;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  defaultValue?: string;
}

// Single-value form field wrapper for Radix Select primitive
export const SingleSelect = React.forwardRef<HTMLButtonElement, SingleSelectProps>(
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

        <ShadcnSelect
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          name={name}
          defaultValue={defaultValue}
          required={required}
        >
          <ShadcnSelectTrigger
            ref={ref}
            id={id}
            onBlur={onBlur}
            aria-invalid={!!error}
            className={cn('w-full', className)}
          >
            <ShadcnSelectValue placeholder={placeholder} />
          </ShadcnSelectTrigger>

          <ShadcnSelectContent>
            {options.map((option) => (
              <ShadcnSelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </ShadcnSelectItem>
            ))}
          </ShadcnSelectContent>
        </ShadcnSelect>

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

SingleSelect.displayName = 'SingleSelect';
