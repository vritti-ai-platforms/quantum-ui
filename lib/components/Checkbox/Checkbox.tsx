import React from 'react';
import { Checkbox as ShadcnCheckbox } from '../../../shadcn/shadcnCheckbox';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof ShadcnCheckbox> {
  /**
   * Label for the checkbox
   */
  label?: React.ReactNode;

  /**
   * Helper text or description to display below the checkbox
   */
  description?: React.ReactNode;

  /**
   * Error message to display below the checkbox
   */
  error?: string;
}

// Checkbox component with Field system integration
export const Checkbox = React.forwardRef<React.ElementRef<typeof ShadcnCheckbox>, CheckboxProps>(
  ({ label, description, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const hasError = !!error;

    // If no label or description, just return the base checkbox
    if (!label && !description && !error) {
      return <ShadcnCheckbox {...props} ref={ref} id={fieldId} />;
    }

    return (
      <Field orientation="horizontal" data-disabled={props.disabled} data-invalid={hasError}>
        <ShadcnCheckbox
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

Checkbox.displayName = 'Checkbox';
