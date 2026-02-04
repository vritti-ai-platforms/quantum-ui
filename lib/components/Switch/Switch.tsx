import React from 'react';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { Switch as ShadcnSwitch } from '../../../shadcn/shadcnSwitch';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof ShadcnSwitch> {
  /**
   * Label for the switch
   */
  label?: React.ReactNode;

  /**
   * Helper text or description to display below the switch
   */
  description?: React.ReactNode;

  /**
   * Error message to display below the switch
   */
  error?: string;
}

/**
 * Switch component for toggling between two states (on/off).
 *
 * Can be used as a bare component or with label, description, and error support
 * for form integration.
 *
 * @example
 * ```tsx
 * // Bare usage
 * <Switch />
 * <Switch size="sm" />
 * <Switch defaultChecked />
 * <Switch disabled />
 *
 * // With Field system (form usage)
 * <Switch
 *   label="Enable notifications"
 *   description="Receive email updates"
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

    // If no label or description, just return the base switch
    if (!label && !description && !error) {
      return <ShadcnSwitch {...props} ref={ref} id={fieldId} />;
    }

    return (
      <Field orientation="horizontal" data-disabled={props.disabled} data-invalid={hasError}>
        <ShadcnSwitch
          {...props}
          ref={ref}
          id={fieldId}
          aria-describedby={description || error ? `${fieldId}-description ${fieldId}-error` : undefined}
          aria-invalid={hasError}
        />
        <FieldContent>
          {label && (
            <FieldLabel htmlFor={fieldId} className="font-normal cursor-pointer">
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

Switch.displayName = 'Switch';
