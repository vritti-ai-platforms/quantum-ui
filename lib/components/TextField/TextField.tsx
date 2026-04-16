import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
    const isNumberType = props.type === 'number';
    const normalizedType = isNumberType ? 'text' : props.type;
    const normalizedInputMode = props.inputMode ?? (isNumberType ? 'decimal' : undefined);
    const normalizedPattern = props.pattern ?? (isNumberType ? '^[0-9]*\\.?[0-9]*$' : undefined);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const assignRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const setInputNumericValue = React.useCallback(
      (delta: 1 | -1) => {
        if (!isNumberType || disabled) return;
        const input = inputRef.current;
        if (!input) return;

        const parsedStep = Number(props.step);
        const step = Number.isFinite(parsedStep) && parsedStep > 0 ? parsedStep : 1;
        const parsedMin = Number(props.min);
        const min = Number.isFinite(parsedMin) ? parsedMin : undefined;
        const parsedMax = Number(props.max);
        const max = Number.isFinite(parsedMax) ? parsedMax : undefined;
        const current = Number(input.value);
        const baseValue = Number.isFinite(current) ? current : min ?? 0;

        let next = baseValue + delta * step;
        if (typeof min === 'number') next = Math.max(min, next);
        if (typeof max === 'number') next = Math.min(max, next);

        const stepString = String(step);
        const decimals = stepString.includes('.') ? stepString.split('.')[1]?.length ?? 0 : 0;
        const nextValue = decimals > 0 ? next.toFixed(decimals) : String(Math.round(next));

        const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        valueSetter?.call(input, nextValue);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      },
      [isNumberType, disabled, props.min, props.max, props.step],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        props.onKeyDown?.(event);
        if (event.defaultPrevented || !isNumberType || disabled) return;
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setInputNumericValue(1);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          setInputNumericValue(-1);
        }
      },
      [props, isNumberType, disabled, setInputNumericValue],
    );

    const hasMin = props.min !== undefined && props.min !== null && String(props.min) !== '';
    const hasMax = props.max !== undefined && props.max !== null && String(props.max) !== '';
    const autoConstraintText = hasMin && hasMax ? `Range: ${props.min} - ${props.max}` : hasMax ? `Max: ${props.max}` : hasMin ? `Min: ${props.min}` : '';
    const combinedEndAdornment = (
      <>
        {autoConstraintText ? <span className="text-xs text-muted-foreground whitespace-nowrap">{autoConstraintText}</span> : null}
        {endAdornment}
      </>
    );

    return (
      <Field data-disabled={disabled}>
        {label && <FieldLabel>{label}</FieldLabel>}

        <div className="relative">
          {startAdornment && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{startAdornment}</div>
          )}
          <Input
            aria-invalid={!!error}
            ref={assignRef}
            disabled={disabled}
            className={cn(
              className,
              startAdornment && 'pl-10',
              isNumberType && (endAdornment || autoConstraintText) && 'pr-36',
              isNumberType && !endAdornment && !autoConstraintText && 'pr-12',
              !isNumberType && (endAdornment || autoConstraintText) && 'pr-10',
            )}
            id={id}
            {...props}
            type={normalizedType}
            inputMode={normalizedInputMode}
            pattern={normalizedPattern}
            onKeyDown={handleKeyDown}
          />
          {isNumberType && (
            <div className="absolute inset-y-0 right-2 z-20 flex items-center">
              <div className="flex h-7 w-4 flex-col overflow-hidden rounded-sm border border-border bg-background">
                <button
                  type="button"
                  tabIndex={-1}
                  className="flex h-1/2 items-center justify-center border-b border-border text-muted-foreground hover:bg-accent disabled:opacity-50"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setInputNumericValue(1)}
                  disabled={disabled}
                  aria-label="Increase value"
                >
                  <ChevronUp className="size-2.5" />
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  className="flex h-1/2 items-center justify-center text-muted-foreground hover:bg-accent disabled:opacity-50"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setInputNumericValue(-1)}
                  disabled={disabled}
                  aria-label="Decrease value"
                >
                  <ChevronDown className="size-2.5" />
                </button>
              </div>
            </div>
          )}
          {(endAdornment || autoConstraintText) && (
            <div
              className={cn(
                'absolute inset-y-0 flex items-center gap-2',
                isNumberType ? 'right-8 pr-2 z-10' : 'right-0 pr-3',
              )}
            >
              {combinedEndAdornment}
            </div>
          )}
        </div>

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

TextField.displayName = 'TextField';
