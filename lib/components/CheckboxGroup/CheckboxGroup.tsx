import React, { useCallback } from 'react';
import { Checkbox as ShadcnCheckbox } from '../../../shadcn/shadcnCheckbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '../../../shadcn/shadcnField';
import { cn } from '../../../shadcn/utils';

export interface CheckboxOption {
  /** The value associated with this option */
  value: string;
  /** Label displayed next to the checkbox */
  label: React.ReactNode;
  /** Optional description displayed below the label */
  description?: React.ReactNode;
  /** Whether this individual option is disabled */
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** Array of checkbox options to render */
  options: CheckboxOption[];
  /** Controlled value — array of selected option values */
  value?: string[];
  /** Callback fired when the selection changes */
  onValueChange?: (value: string[]) => void;
  /** Default selected values for uncontrolled mode */
  defaultValue?: string[];
  /** Group label rendered as a fieldset legend */
  label?: React.ReactNode;
  /** Description displayed below the label */
  description?: React.ReactNode;
  /** Error message displayed below the group */
  error?: string;
  /** Layout direction of the checkbox options */
  orientation?: 'vertical' | 'horizontal';
  /** Number of grid columns — overrides orientation layout */
  columns?: number;
  /** Whether all checkboxes in the group are disabled */
  disabled?: boolean;
  /** Additional CSS classes for the fieldset wrapper */
  className?: string;
  /** Field name consumed by Form.tsx Controller — not used directly */
  name?: string;
  /** Blur handler wired by Form.tsx Controller */
  onBlur?: () => void;
}

// CheckboxGroup component for multi-select with Field system integration
export const CheckboxGroup = React.forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  (
    {
      options,
      value: controlledValue,
      onValueChange,
      defaultValue,
      label,
      description,
      error,
      orientation = 'vertical',
      columns,
      disabled,
      className,
      name: _name,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const groupId = React.useId();
    const hasError = !!error;

    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue ?? []);
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    // Toggle a value in/out of the selection array
    const handleToggle = useCallback(
      (optionValue: string, checked: boolean) => {
        const next = checked ? [...currentValue, optionValue] : currentValue.filter((v) => v !== optionValue);

        if (!isControlled) {
          setInternalValue(next);
        }
        onValueChange?.(next);
      },
      [currentValue, isControlled, onValueChange],
    );

    // Render a single checkbox option with label and optional description
    const renderItem = (option: CheckboxOption) => {
      const itemId = `${groupId}-${option.value}`;
      const isItemDisabled = disabled || option.disabled;

      return (
        <Field key={option.value} orientation="horizontal" data-disabled={isItemDisabled || undefined}>
          <ShadcnCheckbox
            checked={currentValue.includes(option.value)}
            onCheckedChange={(checked) => handleToggle(option.value, checked === true)}
            disabled={isItemDisabled}
            id={itemId}
            onBlur={onBlur}
          />
          <FieldContent>
            <FieldLabel htmlFor={itemId} className="font-normal cursor-pointer">
              {option.label}
            </FieldLabel>
            {option.description && <FieldDescription>{option.description}</FieldDescription>}
          </FieldContent>
        </Field>
      );
    };

    // Compute layout classes based on columns or orientation
    const groupClassName = cn(
      columns ? `grid gap-3` : orientation === 'horizontal' ? 'flex flex-row flex-wrap gap-4' : 'flex flex-col gap-3',
    );

    // Dynamic grid-cols style when columns prop is provided
    const groupStyle = columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined;

    return (
      <FieldSet ref={ref} data-invalid={hasError || undefined} className={className} {...props}>
        {label && <FieldLegend>{label}</FieldLegend>}
        {description && !error && <FieldDescription>{description}</FieldDescription>}
        <div className={groupClassName} style={groupStyle}>
          {options.map(renderItem)}
        </div>
        {error && <FieldError>{error}</FieldError>}
      </FieldSet>
    );
  },
);

CheckboxGroup.displayName = 'CheckboxGroup';
