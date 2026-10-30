import React from 'react';
import PhoneInputBase, { type Country, type Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { cn } from '../../../shadcn/utils';
import { withDisabledTip } from '../../utils/disabledTip';
import { lockedTip, PermissionLockIcon, usePermission } from '../PermissionGate';

export interface PhoneFieldProps {
  name?: string;

  value?: Value;

  onChange?: (value: Value | undefined) => void;

  onCountryChange?: (country: Country | undefined) => void;

  defaultCountry?: Country;

  label?: string;

  description?: React.ReactNode;

  error?: string;

  disabled?: boolean;

  className?: string;

  placeholder?: string;

  /** Permission code gating this field: hidden when not granted, disabled with a lock + upsell tip when locked */
  permission?: string;
}

// PhoneField component - specialized input for international phone numbers with Field system
export const PhoneField = React.forwardRef<HTMLInputElement, PhoneFieldProps>(
  (
    {
      name: _name,
      value,
      onChange = () => {},
      onCountryChange,
      defaultCountry = 'IN',
      label,
      description,
      error,
      disabled: disabledProp,
      className,
      placeholder,
      permission,
    },
    _ref,
  ) => {
    const fieldId = React.useId();
    const hasError = !!error;
    const gate = usePermission(permission);
    const { granted, locked, reason } = gate;

    // render = role: the role doesn't grant this field, so it doesn't exist for this user
    if (!granted) {
      return null;
    }

    // enable = role ∧ plan ∧ BU: granted but locked renders disabled with the upsell as its tooltip
    const disabled = disabledProp || locked;
    const phoneInputStyle = {
      '--PhoneInputCountryFlag-backgroundColor--loading': 'transparent',
      '--PhoneInputCountryFlag-borderColor': 'transparent',
      '--PhoneInputCountryFlag-borderWidth': 0,
    } as React.CSSProperties;

    return (
      <Field data-disabled={disabled}>
        {label && (
          <FieldLabel className={cn(locked && 'items-center gap-1.5')}>
            {locked && <PermissionLockIcon reason={reason} className="size-3.5" />}
            {label}
          </FieldLabel>
        )}

        <FieldContent>
          {withDisabledTip(
            <PhoneInputBase
              international
              defaultCountry={defaultCountry}
              value={value}
              onChange={onChange}
              onCountryChange={onCountryChange}
              disabled={disabled}
              placeholder={placeholder}
              aria-describedby={description || error ? `${fieldId}-description ${fieldId}-error` : undefined}
              aria-invalid={hasError}
              style={phoneInputStyle}
              className={cn(
                'flex h-9 w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-1 text-sm shadow-xs transition-[color,box-shadow]',
                'placeholder:text-muted-foreground',
                'focus-within:outline-none focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[1px]',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                hasError && 'border-destructive focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40',
                className,
              )}
              numberInputProps={{
                className: cn('flex-1 bg-transparent outline-none', 'placeholder:text-muted-foreground'),
              }}
              countrySelectProps={{
                className: cn('mr-2 bg-transparent border-none outline-none', 'focus:ring-0'),
              }}
            />,
            locked ? lockedTip(gate) : undefined,
            disabled,
            'block w-full',
          )}

          {description && <FieldDescription id={`${fieldId}-description`}>{description}</FieldDescription>}

          {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
        </FieldContent>
      </Field>
    );
  },
);

PhoneField.displayName = 'PhoneField';
