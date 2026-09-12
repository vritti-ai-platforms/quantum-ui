import React from 'react';
import { Field, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { Switch as ShadcnSwitch } from '../../../shadcn/shadcnSwitch';
import { withDisabledTip } from '../../utils/disabledTip';
import { lockedTip, PermissionLockIcon, usePermission } from '../PermissionGate';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof ShadcnSwitch> {
  label?: React.ReactNode;

  description: React.ReactNode;

  error?: string;

  disabledTip?: string;

  permission?: string;
}

// Switch for toggling on/off; label + description on the left with the toggle pinned right (description required)
export const Switch = React.forwardRef<React.ElementRef<typeof ShadcnSwitch>, SwitchProps>(
  ({ label, description, error, disabledTip, permission, id, size = 'lg', ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const hasError = !!error;
    const { granted, locked, reason, unlockPlans } = usePermission(permission);

    // render = role: the role doesn't grant this action, so the control doesn't exist for this user
    if (!granted) {
      return null;
    }

    // enable = role ∧ plan ∧ BU: granted but locked renders disabled with the upsell as its tooltip
    const isDisabled = props.disabled || locked;
    const tip = locked ? lockedTip({ reason, unlockPlans }) : disabledTip;

    return (
      <Field data-disabled={isDisabled} data-invalid={hasError}>
        {label && (
          <FieldLabel htmlFor={fieldId} className="flex cursor-pointer items-center gap-1.5">
            {locked && <PermissionLockIcon reason={reason} className="size-3.5" />}
            {label}
          </FieldLabel>
        )}
        <div className="flex min-h-9 items-center gap-3">
          {description && (
            <label
              htmlFor={fieldId}
              id={`${fieldId}-description`}
              className="flex-1 cursor-pointer text-sm leading-snug text-muted-foreground"
            >
              {description}
            </label>
          )}
          {withDisabledTip(
            <ShadcnSwitch
              {...props}
              ref={ref}
              id={fieldId}
              size={size}
              disabled={isDisabled}
              aria-describedby={description || error ? `${fieldId}-description ${fieldId}-error` : undefined}
              aria-invalid={hasError}
            />,
            tip,
            isDisabled,
          )}
        </div>
        {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
      </Field>
    );
  },
);

Switch.displayName = 'Switch';

export type CompactSwitchProps = React.ComponentProps<typeof ShadcnSwitch> & {
  disabledTip?: string;
  permission?: string;
};

// Bare compact switch with no Field wrapper, defaults to sm size for dense layouts like table/matrix cells
export const CompactSwitch: React.FC<CompactSwitchProps> = ({ size = 'sm', disabledTip, permission, ...props }) => {
  const { granted, locked, reason, unlockPlans } = usePermission(permission);
  if (!granted) return null;

  // No adornment slot here, so a locked switch reads as disabled with the upsell on hover
  const isDisabled = props.disabled || locked;
  const tip = locked ? lockedTip({ reason, unlockPlans }) : disabledTip;
  return withDisabledTip(<ShadcnSwitch size={size} {...props} disabled={isDisabled} />, tip, isDisabled);
};

CompactSwitch.displayName = 'CompactSwitch';
