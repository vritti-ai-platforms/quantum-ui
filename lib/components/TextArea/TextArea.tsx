import React from 'react';
import { Textarea } from '../../../shadcn/shadcnTextarea';
import { cn } from '../../../shadcn/utils';
import { withDisabledTip } from '../../utils/disabledTip';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { lockedTip, PermissionLockIcon, usePermission } from '../PermissionGate';

export interface TextAreaProps extends React.ComponentProps<'textarea'> {
  label?: string;
  description?: React.ReactNode;
  error?: string;
  /** Permission code gating this field: hidden when not granted, disabled with a lock + upsell tip when locked */
  permission?: string;
}

// TextArea molecule - Textarea + Label composition using Field system
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, description, error, className, id, disabled: disabledProp, permission, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
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
          </FieldLabel>
        )}

        {withDisabledTip(
          <Textarea
            ref={ref}
            id={fieldId}
            disabled={disabled}
            className={cn(className)}
            aria-invalid={!!error}
            {...props}
          />,
          locked ? lockedTip(gate) : undefined,
          disabled,
          'block w-full',
        )}

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

TextArea.displayName = 'TextArea';
