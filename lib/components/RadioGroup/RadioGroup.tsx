import React from 'react';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '../../../shadcn/shadcnField';
import { ShadcnRadioGroup, ShadcnRadioGroupItem } from '../../../shadcn/shadcnRadioGroup';
import { cn } from '../../../shadcn/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  variant?: 'classic' | 'card';
  disabled?: boolean;
  className?: string;
  name?: string;
}

// RadioGroup component with classic and card variants
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      options,
      value,
      onValueChange,
      defaultValue,
      label,
      description,
      error,
      orientation = 'vertical',
      variant = 'classic',
      disabled,
      className,
      name: _name,
      ...props
    },
    ref,
  ) => {
    const groupId = React.useId();
    const hasError = !!error;

    // Render a classic radio item with label and optional description
    const renderClassicItem = (option: RadioOption) => {
      const itemId = `${groupId}-${option.value}`;
      const isItemDisabled = disabled || option.disabled;

      return (
        <Field key={option.value} orientation="horizontal" data-disabled={isItemDisabled || undefined}>
          <ShadcnRadioGroupItem value={option.value} id={itemId} disabled={isItemDisabled} />
          <FieldContent>
            <FieldLabel htmlFor={itemId} className="font-normal cursor-pointer">
              {option.label}
            </FieldLabel>
            {option.description && <FieldDescription>{option.description}</FieldDescription>}
          </FieldContent>
        </Field>
      );
    };

    // Render a card-style radio item with bordered container
    const renderCardItem = (option: RadioOption) => {
      const itemId = `${groupId}-${option.value}`;
      const isItemDisabled = disabled || option.disabled;

      return (
        <label
          key={option.value}
          htmlFor={itemId}
          className={cn(
            'relative flex cursor-pointer rounded-lg border border-border p-4 transition-colors',
            'hover:bg-muted/50',
            'has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary',
            isItemDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          )}
        >
          <div className="flex items-start gap-3">
            <ShadcnRadioGroupItem value={option.value} id={itemId} disabled={isItemDisabled} className="mt-0.5" />
            <div>
              <FieldLabel htmlFor={itemId} className="cursor-pointer font-medium">
                {option.label}
              </FieldLabel>
              {option.description && <FieldDescription>{option.description}</FieldDescription>}
            </div>
          </div>
        </label>
      );
    };

    const renderItem = variant === 'card' ? renderCardItem : renderClassicItem;

    const groupClassName = cn(
      variant === 'card'
        ? orientation === 'horizontal'
          ? 'grid grid-cols-2 gap-3'
          : 'flex flex-col gap-3'
        : orientation === 'horizontal'
          ? 'flex flex-row flex-wrap gap-4'
          : 'flex flex-col gap-3',
    );

    return (
      <FieldSet data-invalid={hasError || undefined} className={className}>
        {label && <FieldLegend>{label}</FieldLegend>}
        {description && !error && <FieldDescription>{description}</FieldDescription>}
        <ShadcnRadioGroup
          ref={ref}
          value={value}
          onValueChange={onValueChange}
          defaultValue={defaultValue}
          disabled={disabled}
          orientation={orientation}
          className={groupClassName}
          {...props}
        >
          {options.map(renderItem)}
        </ShadcnRadioGroup>
        {error && <FieldError>{error}</FieldError>}
      </FieldSet>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';
