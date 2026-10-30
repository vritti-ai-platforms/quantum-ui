import React from 'react';
import { Checkbox as ShadcnCheckbox } from '../../../shadcn/shadcnCheckbox';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { cn } from '../../../shadcn/utils';
import { withDisabledTip } from '../../utils/disabledTip';
import { lockedTip, PermissionLockIcon, usePermission } from '../PermissionGate';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof ShadcnCheckbox> {
  label?: React.ReactNode;

  description?: React.ReactNode;

  error?: string;

  disabledTip?: string;

  /** Permission code gating this field: hidden when not granted, disabled with a lock + upsell tip when locked */
  permission?: string;
}

// Checkbox component with Field system integration
export const Checkbox = React.forwardRef<React.ElementRef<typeof ShadcnCheckbox>, CheckboxProps>(
  ({ label, description, error, disabledTip, permission, id, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const hasError = !!error;
    const gate = usePermission(permission);
    const { granted, locked, reason } = gate;

    // render = role: the role doesn't grant this field, so it doesn't exist for this user
    if (!granted) {
      return null;
    }

    // enable = role ∧ plan ∧ BU: granted but locked renders disabled with the upsell as its tooltip
    const isDisabled = props.disabled || locked;
    const tip = locked ? lockedTip(gate) : disabledTip;

    // If no label or description, just return the base checkbox
    if (!label && !description && !error) {
      return withDisabledTip(
        <ShadcnCheckbox {...props} ref={ref} id={fieldId} disabled={isDisabled} />,
        tip,
        isDisabled,
      );
    }

    return (
      <Field orientation="horizontal" data-disabled={isDisabled} data-invalid={hasError}>
        {withDisabledTip(
          <ShadcnCheckbox
            {...props}
            ref={ref}
            id={fieldId}
            disabled={isDisabled}
            aria-describedby={description || error ? `${fieldId}-description ${fieldId}-error` : undefined}
            aria-invalid={hasError}
          />,
          tip,
          isDisabled,
        )}
        <FieldContent>
          {label && (
            <FieldLabel
              htmlFor={fieldId}
              className={cn('font-normal cursor-pointer', locked && 'items-center gap-1.5')}
            >
              {locked && <PermissionLockIcon reason={reason} className="size-3.5" />}
              {label}
            </FieldLabel>
          )}

          {description && <FieldDescription id={`${fieldId}-description`}>{description}</FieldDescription>}

          {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
        </FieldContent>
      </Field>
    );
  },
);

Checkbox.displayName = 'Checkbox';
