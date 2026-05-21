import React from 'react';
import { Field, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { Switch as ShadcnSwitch } from '../../../shadcn/shadcnSwitch';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof ShadcnSwitch> {
  /**
   * Label for the switch
   */
  label?: React.ReactNode;

  /**
   * Helper text or description displayed beside the toggle — required for field layout
   */
  description: React.ReactNode;

  /**
   * Error message to display below the switch
   */
  error?: string;
}

/**
 * Switch component for toggling between two states (on/off).
 *
 * Description is required and sits beside the toggle, keeping the label pinned
 * to the top so it aligns with adjacent TextField labels in a form row.
 *
 * @example
 * ```tsx
 * // With Field system (form usage)
 * <Switch
 *   label="Enable notifications"
 *   description="Receive email updates about your account"
 * />
 *
 * // In a Form component
 * <Form form={form} onSubmit={handleSubmit}>
 *   <Switch
 *     name="marketing"
 *     label="Marketing emails"
 *     description="Receive promotional content"
 *   />
 * </Form>
 * ```
 */
export const Switch = React.forwardRef<React.ElementRef<typeof ShadcnSwitch>, SwitchProps>(
  ({ label, description, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const hasError = !!error;

    return (
      <Field data-disabled={props.disabled} data-invalid={hasError}>
        {label && (
          <FieldLabel htmlFor={fieldId} className="font-normal cursor-pointer">
            {label}
          </FieldLabel>
        )}

        <div className="flex min-h-9 items-center justify-between gap-3">
          <p id={`${fieldId}-description`} className="text-sm text-muted-foreground leading-normal">{description}</p>
          <ShadcnSwitch
            {...props}
            ref={ref}
            id={fieldId}
            aria-describedby={description || error ? `${fieldId}-description ${fieldId}-error` : undefined}
            aria-invalid={hasError}
          />
        </div>

        {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
      </Field>
    );
  },
);

Switch.displayName = 'Switch';
