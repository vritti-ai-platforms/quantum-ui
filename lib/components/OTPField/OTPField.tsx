import React from 'react';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../shadcn/shadcnInputOTP';
import { cn } from '../../../shadcn/utils';
import { withDisabledTip } from '../../utils/disabledTip';
import { lockedTip, PermissionLockIcon, usePermission } from '../PermissionGate';

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

  /** Permission code gating this field: hidden when not granted, disabled with a lock + upsell tip when locked */
  permission?: string;
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
      disabled: disabledProp,
      required,
      className,
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

    return (
      <Field data-disabled={disabled}>
        {label && (
          <FieldLabel htmlFor={fieldId} className={cn(locked && 'items-center gap-1.5')}>
            {locked && <PermissionLockIcon reason={reason} className="size-3.5" />}
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FieldLabel>
        )}

        <FieldContent>
          {withDisabledTip(
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
            </InputOTP>,
            locked ? lockedTip(gate) : undefined,
            disabled,
            'flex w-full justify-center',
          )}

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
