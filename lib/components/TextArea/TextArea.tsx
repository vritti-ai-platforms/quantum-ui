import React from 'react';
import { Textarea } from '../../../shadcn/shadcnTextarea';
import { cn } from '../../../shadcn/utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';

export interface TextAreaProps extends React.ComponentProps<'textarea'> {
  label?: string;
  description?: React.ReactNode;
  error?: string;
}

// TextArea molecule - Textarea + Label composition using Field system
export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, description, error, className, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;

    return (
      <Field data-disabled={disabled}>
        {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}

        <Textarea
          ref={ref}
          id={fieldId}
          disabled={disabled}
          className={cn(className)}
          aria-invalid={!!error}
          {...props}
        />

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

TextArea.displayName = 'TextArea';
