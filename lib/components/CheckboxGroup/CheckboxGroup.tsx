import { CheckCheck, X } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
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
import { Button } from '../Button';

export interface CheckboxOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  defaultValue?: string[];
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  columns?: number;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
  name?: string;
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
      clearable = false,
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

    // Commit a new selection array through the shared controlled/uncontrolled path
    const commitValue = useCallback(
      (next: string[]) => {
        if (!isControlled) {
          setInternalValue(next);
        }
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    // Toggle a value in/out of the selection array
    const handleToggle = useCallback(
      (optionValue: string, checked: boolean) => {
        const next = checked ? [...currentValue, optionValue] : currentValue.filter((v) => v !== optionValue);
        commitValue(next);
      },
      [currentValue, commitValue],
    );

    // Values of every option that can be selected (excludes individually disabled options)
    const selectableValues = useMemo(
      () => options.filter((option) => !option.disabled).map((option) => option.value),
      [options],
    );

    // Header action state: all selectable already chosen / nothing chosen
    const allSelected = selectableValues.length > 0 && selectableValues.every((v) => currentValue.includes(v));
    const noneSelected = currentValue.length === 0;

    // Select every non-disabled option's value
    const handleSelectAll = useCallback(() => {
      commitValue(selectableValues);
    }, [commitValue, selectableValues]);

    // Empty the selection
    const handleClear = useCallback(() => {
      commitValue([]);
    }, [commitValue]);

    // Inline "Select all" / "Clear" actions shown when clearable and the group is not disabled
    const showActions = clearable && !disabled;
    const headerActions = showActions ? (
      <div className="-mr-1 flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          disabled={allSelected}
          className="h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <CheckCheck className="size-3.5" />
          Select all
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={noneSelected}
          className="h-7 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
          Clear
        </Button>
      </div>
    ) : null;

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
        {label ? (
          <div className="flex items-center justify-between gap-4">
            <FieldLegend variant="label">{label}</FieldLegend>
            {headerActions}
          </div>
        ) : (
          headerActions && <div className="flex justify-end">{headerActions}</div>
        )}
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
