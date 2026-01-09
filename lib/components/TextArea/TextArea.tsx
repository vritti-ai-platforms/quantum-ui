import React from 'react';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { Textarea } from '../../../shadcn/shadcnTextarea';
import { cn } from '../../../shadcn/utils';

export interface TextAreaProps extends React.ComponentProps<'textarea'> {
  /**
   * Label for the field
   */
  label?: string;

  /**
   * Helper text or description to display below the field
   */
  description?: React.ReactNode;

  /**
   * Error message to display below the field
   */
  error?: string;
}

// TextArea molecule - Textarea + Label composition with Field system
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const hasError = !!error;

    return (
      <Field>
        {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}

        <FieldContent>
          <Textarea
            ref={ref}
            id={fieldId}
            className={cn(className)}
            aria-describedby={description || error ? `${fieldId}-description ${fieldId}-error` : undefined}
            aria-invalid={hasError}
            {...props}
          />

          {description && <FieldDescription id={`${fieldId}-description`}>{description}</FieldDescription>}

          {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
        </FieldContent>
      </Field>
    );
  },
);

TextArea.displayName = 'TextArea';
