import React from 'react';
import { Input } from '../../../shadcn/shadcnInput';
import { cn } from '../../../shadcn/utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';

export interface TextFieldProps extends React.ComponentProps<'input'> {
  /**
   * Label for the field
   */
  label?: string;

  /**
   * Helper text to display below the field
   */
  description?: React.ReactNode;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Element to display at the start of the input (e.g., icon)
   */
  startAdornment?: React.ReactNode;

  /**
   * Element to display at the end of the input (e.g., icon button)
   */
  endAdornment?: React.ReactNode;
}

// TextField molecule - Input + Label composition using Field system
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, description, error, className, id, disabled, startAdornment, endAdornment, ...props }, ref) => {
    return (
      <Field data-disabled={disabled}>
        {label && <FieldLabel>{label}</FieldLabel>}

        <div className="relative">
          {startAdornment && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{startAdornment}</div>
          )}
          <Input
            aria-invalid={!!error}
            ref={ref}
            disabled={disabled}
            className={cn(className, startAdornment && 'pl-10', endAdornment && 'pr-10')}
            id={id}
            {...props}
          />
          {endAdornment && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>}
        </div>

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

TextField.displayName = 'TextField';
