import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import { Input } from '../../../shadcn/shadcnInput';
import { cn } from '../../../shadcn/utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';

export interface TextFieldProps extends React.ComponentProps<'input'> {
  label?: string;
  description?: React.ReactNode;
  error?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  // Blocks negative values and '-'/'e' keys. Combined with `integer`, also blocks `0` and
  // sets min to 1 (so positive+integer means ≥1). For decimal mode, zero is still typeable so
  // the user can start "0.5"; zod is the final gate.
  positive?: boolean;
  // Blocks zero. Combined with `integer`, blocks `0` as the first keystroke. Use independently
  // from `positive` when the field accepts signed-but-not-zero values.
  nonZero?: boolean;
  // Blocks decimal input ('.' and ','); switches inputMode to numeric
  integer?: boolean;
}

// TextField molecule - Input + Label composition using Field system
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      description,
      error,
      className,
      id,
      disabled,
      startAdornment,
      endAdornment,
      positive,
      nonZero,
      integer,
      onChange,
      style,
      ...props
    },
    ref,
  ) => {
    const isNumberType = props.type === 'number';
    const normalizedType = isNumberType ? 'text' : props.type;
    const normalizedInputMode = props.inputMode ?? (isNumberType ? (integer ? 'numeric' : 'decimal') : undefined);
    // Resolve the actual minimum: positive floor takes precedence when both are set, so
    // `positive` always blocks negatives even if a contradictory `min` is passed.
    // For integer mode, `positive` means ≥1 (floor 1). For decimal mode, HTML min stays at 0 so
    // values like 0.3 / 0.5 remain typeable; the form/zod layer rejects plain 0.
    const positiveFloor = positive ? (integer ? 1 : 0) : undefined;
    const propsMinNum = props.min != null && props.min !== '' ? Number(props.min) : undefined;
    const propsMinValid = propsMinNum !== undefined && Number.isFinite(propsMinNum) ? propsMinNum : undefined;
    const effectiveMin =
      positiveFloor !== undefined && propsMinValid !== undefined
        ? Math.max(positiveFloor, propsMinValid)
        : (propsMinValid ?? positiveFloor);
    const inputRef = React.useRef<HTMLInputElement>(null);
    // Tracks the last raw string typed so intermediate states like "-" or "0." survive the
    // round-trip through RHF. Must be state (not a ref) so updates trigger a re-render and
    // React's controlled input doesn't revert the DOM to the canonical number.
    const [rawInput, setRawInput] = React.useState<string>('');
    // Trailing overlay (constraint hint + stepper / end adornment) is measured at runtime so the
    // input reserves exactly its width as right padding — a one-char hint like "+" no longer costs
    // the same as "Range: 0 - 100". Re-measures on content/size changes via ResizeObserver.
    const endOverlayRef = React.useRef<HTMLDivElement>(null);
    const [endPadding, setEndPadding] = React.useState<number | undefined>(undefined);

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
        const parsedMax = Number(props.max);
        const max = Number.isFinite(parsedMax) ? parsedMax : undefined;
        const current = Number(input.value);
        const baseValue = Number.isFinite(current) ? current : (effectiveMin ?? 0);

        let next = baseValue + delta * step;
        if (effectiveMin !== undefined) next = Math.max(effectiveMin, next);
        if (max !== undefined) next = Math.min(max, next);

        const stepString = String(step);
        const decimals = integer || stepString.includes('.') === false ? 0 : (stepString.split('.')[1]?.length ?? 0);
        const nextValue = decimals > 0 ? next.toFixed(decimals) : String(Math.round(next));

        const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        valueSetter?.call(input, nextValue);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      },
      [isNumberType, disabled, effectiveMin, integer, props.max, props.step],
    );

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isNumberType) {
          const raw = event.target.value;
          setRawInput(raw);
          const num = raw === '' ? NaN : Number(raw);
          (onChange as unknown as (v: number) => void)?.(num);
        } else {
          onChange?.(event);
        }
      },
      [isNumberType, onChange],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        props.onKeyDown?.(event);
        if (event.defaultPrevented || !isNumberType || disabled) return;
        if (positive && (event.key === '-' || event.key === 'e')) {
          event.preventDefault();
          return;
        }
        if (integer && (event.key === '.' || event.key === ',' || event.key === 'e')) {
          event.preventDefault();
          return;
        }
        // Block '0' as the first keystroke in integer mode when either `positive` (≥1) or
        // `nonZero` is set. Decimal mode needs '0' to remain typeable so the user can start "0.3".
        if (
          (positive || nonZero) &&
          integer &&
          event.key === '0' &&
          (event.currentTarget.value === '' || event.currentTarget.value === '0')
        ) {
          event.preventDefault();
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setInputNumericValue(1);
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          setInputNumericValue(-1);
        }
      },
      [isNumberType, disabled, positive, nonZero, integer, setInputNumericValue, props.onKeyDown],
    );

    // For number fields, prefer the raw typed string when it represents the same value as
    // the stored number — preserves intermediate states like "0.", "1.50", "-" that would
    // otherwise be lost as React reconciles the controlled input back to the canonical form.
    let displayValue: TextFieldProps['value'] = props.value;
    if (isNumberType && typeof props.value === 'number') {
      if (Number.isNaN(props.value)) {
        displayValue = rawInput;
      } else if (rawInput !== '' && Number(rawInput) === props.value) {
        displayValue = rawInput;
      }
    }

    const hasMin = propsMinValid !== undefined;
    const hasMax = props.max != null && props.max !== '';
    const hints: string[] = [];
    const integerLabel = positive ? '+Int' : 'Int';
    const positiveLabel = '+';
    const nonZeroLabel = '≠0';
    if (integer && nonZero) hints.push(`${integerLabel} ${nonZeroLabel}`);
    else if (integer) hints.push(integerLabel);
    else if (positive && nonZero) hints.push(`${positiveLabel} ${nonZeroLabel}`);
    else if (positive) hints.push(positiveLabel);
    else if (nonZero) hints.push(nonZeroLabel);
    if (hasMin && hasMax) hints.push(`Range: ${propsMinValid} - ${props.max}`);
    else if (hasMax) hints.push(`Max: ${props.max}`);
    else if (hasMin) hints.push(`Min: ${propsMinValid}`);
    const autoConstraintText = hints.join(', ');
    const combinedEndAdornment = (
      <>
        {autoConstraintText ? (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{autoConstraintText}</span>
        ) : null}
        {endAdornment}
      </>
    );

    const hasEndContent = isNumberType || !!endAdornment || !!autoConstraintText;

    React.useLayoutEffect(() => {
      const node = endOverlayRef.current;
      if (!hasEndContent || !node) {
        setEndPadding(undefined);
        return;
      }
      // Reserve the overlay's width plus a small gap so input text never sits under it.
      const measure = () => setEndPadding(node.offsetWidth + 4);
      measure();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, [hasEndContent]);

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
            className={cn(className, startAdornment && 'pl-10')}
            id={id}
            {...props}
            style={{ ...style, paddingRight: endPadding }}
            value={displayValue}
            min={effectiveMin}
            type={normalizedType}
            inputMode={normalizedInputMode}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
          />
          {hasEndContent && (
            <div ref={endOverlayRef} className="absolute inset-y-0 right-0 z-10 flex items-center gap-2 pr-2">
              {(endAdornment || autoConstraintText) && (
                <div className="flex items-center gap-2">{combinedEndAdornment}</div>
              )}
              {isNumberType && (
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
              )}
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
