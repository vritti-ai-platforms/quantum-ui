import React from 'react';
import { Field, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { Switch as ShadcnSwitch } from '../../../shadcn/shadcnSwitch';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof ShadcnSwitch> {
  label?: React.ReactNode;

  description: React.ReactNode;

  error?: string;
}

// Switch for toggling on/off; label + description stack left with the toggle pinned right (description required)
export const Switch = React.forwardRef<React.ElementRef<typeof ShadcnSwitch>, SwitchProps>(
  ({ label, description, error, id, size = 'lg', ...props }, ref) => {
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const hasError = !!error;

    return (
      <Field data-disabled={props.disabled} data-invalid={hasError}>
        <div className="flex min-h-9 items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            {label && (
              <FieldLabel htmlFor={fieldId} className="font-normal cursor-pointer">
                {label}
              </FieldLabel>
            )}
            <label
              htmlFor={fieldId}
              id={`${fieldId}-description`}
              className="text-sm text-muted-foreground leading-normal cursor-pointer"
            >
              {description}
            </label>
          </div>
          <ShadcnSwitch
            {...props}
            ref={ref}
            id={fieldId}
            size={size}
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

export type CompactSwitchProps = React.ComponentProps<typeof ShadcnSwitch>;

// Bare compact switch with no Field wrapper, defaults to sm size for dense layouts like table/matrix cells
export const CompactSwitch: React.FC<CompactSwitchProps> = ({ size = 'sm', ...props }) => (
  <ShadcnSwitch size={size} {...props} />
);

CompactSwitch.displayName = 'CompactSwitch';
