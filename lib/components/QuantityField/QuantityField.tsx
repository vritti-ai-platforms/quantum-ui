import { ChevronDown } from 'lucide-react';
import React from 'react';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { Spinner } from '../../../shadcn/shadcnSpinner';
import { cn } from '../../../shadcn/utils';
import { formatNumber } from '../../utils/format';
import { getLocale } from '../../utils/locale';
import { Select, type SelectOption, type SelectValue } from '../Select';
import { fromPrimaryQty, type QuantityUnit, resolveQuantityMessage, toPrimaryQty } from './quantity';

export interface QuantityFieldProps {
  name?: string;
  units: QuantityUnit[];
  primaryUnitId: string;
  defaultUnitId?: string;
  value?: number | null;
  onChange?: (primaryQty: number | null | undefined) => void;
  onBlur?: () => void;
  nullable?: boolean;
  label?: string;
  description?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  className?: string;
}

const AMOUNT_PATTERN = /^-?\d*\.?\d*$/;

// Formats a number for the field's hint and messages in the user's locale
function formatAmount(value: number): string {
  return String(formatNumber(value, { localeTag: getLocale() ?? 'en-US' }).primary);
}

// Quantity input typed in any of an item's units, starting in the default unit; the value is the amount in the primary
// unit, null when emptied where nullable, and quantities named in its error are shown in the unit being entered
export const QuantityField = React.forwardRef<HTMLInputElement, QuantityFieldProps>(
  (
    {
      units,
      primaryUnitId,
      defaultUnitId,
      value,
      onChange,
      onBlur,
      nullable,
      label,
      description,
      placeholder,
      error,
      disabled,
      required,
      loading,
      className,
    },
    ref,
  ) => {
    const fieldId = React.useId();
    const [pickedUnitId, setPickedUnitId] = React.useState<string>();
    const [text, setText] = React.useState('');
    // The primary quantity and unit the text stands for; a value matching both came from this field
    const shown = React.useRef<{ qty: number | undefined; unitId: string } | null>(null);

    const unit =
      units.find((option) => option.id === pickedUnitId) ??
      units.find((option) => option.id === defaultUnitId) ??
      units.find((option) => option.id === primaryUnitId);
    const primaryUnit = units.find((option) => option.id === primaryUnitId);
    const isDisabled = !!disabled || !!loading || !unit;
    const options = React.useMemo<SelectOption[]>(
      () => units.map((option) => ({ value: option.id, label: option.symbol, description: option.name })),
      [units],
    );

    // A value set from outside (reset, setValue, edit defaults) or a unit arriving late rewrites the text
    React.useEffect(() => {
      if (!unit) return;
      const qty = value ?? undefined;
      if (shown.current && shown.current.qty === qty && shown.current.unitId === unit.id) return;
      shown.current = { qty, unitId: unit.id };
      setText(fromPrimaryQty(qty, unit));
    }, [value, unit]);

    // Records what the text now stands for and reports the primary quantity when it changed
    const emit = (nextText: string, nextUnit: QuantityUnit) => {
      const qty = toPrimaryQty(nextText, nextUnit);
      const previous = shown.current?.qty;
      shown.current = { qty, unitId: nextUnit.id };
      if (qty !== previous) onChange?.(qty === undefined && nullable ? null : qty);
    };

    // Keeps the typed amount when it reads as a number and reports it in the primary unit
    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!AMOUNT_PATTERN.test(event.target.value)) return;
      setText(event.target.value);
      if (unit) emit(event.target.value, unit);
    };

    // Reads the typed amount in the picked unit instead
    const handleUnitChange = (next: SelectValue) => {
      const nextUnit = units.find((option) => option.id === next);
      if (!nextUnit) return;
      setPickedUnitId(nextUnit.id);
      emit(text, nextUnit);
    };

    const showHint = !!unit && !!primaryUnit && unit.id !== primaryUnit.id && value != null;
    const message =
      error && unit && primaryUnit ? resolveQuantityMessage(error, unit, primaryUnit, formatAmount) : error;
    const describedBy =
      [
        showHint && `${fieldId}-hint`,
        description && !message && `${fieldId}-description`,
        message && `${fieldId}-error`,
      ]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
      <Field data-disabled={isDisabled}>
        {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
        <FieldContent>
          <div
            className={cn(
              'flex h-9 w-full items-stretch rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] dark:bg-input/30',
              'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50',
              isDisabled && 'cursor-not-allowed opacity-50',
              message && 'border-destructive focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40',
              className,
            )}
          >
            <input
              ref={ref}
              id={fieldId}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={text}
              onChange={handleTextChange}
              onBlur={onBlur}
              disabled={isDisabled}
              required={required}
              placeholder={placeholder}
              aria-invalid={!!message}
              aria-busy={loading || undefined}
              aria-describedby={describedBy}
              className="min-w-0 flex-1 bg-transparent px-3 py-1 text-sm tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
            <div className="flex w-28 shrink-0 items-stretch border-l border-input">
              <Select
                options={options}
                value={unit?.id ?? null}
                onChange={handleUnitChange}
                disabled={isDisabled}
                clearable={false}
                label=""
                contentClassName="min-w-40"
                anchor={({ selectedOption, open, disabled: anchorDisabled }) => (
                  <button
                    type="button"
                    disabled={anchorDisabled}
                    aria-label="Unit"
                    aria-expanded={open}
                    className="flex h-full w-full items-center justify-between gap-1 rounded-r-md px-3 text-sm font-medium text-foreground outline-none hover:bg-accent/50 focus-visible:bg-accent/50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Spinner className="size-3.5 text-muted-foreground" />
                    ) : (
                      <span className="truncate">{selectedOption?.label ?? unit?.symbol ?? '—'}</span>
                    )}
                    <ChevronDown
                      className={cn(
                        'size-3.5 shrink-0 text-muted-foreground transition-transform',
                        open && 'rotate-180',
                      )}
                    />
                  </button>
                )}
              />
            </div>
          </div>
          {showHint && (
            <p id={`${fieldId}-hint`} aria-live="polite" className="text-xs tabular-nums text-muted-foreground">
              = {formatAmount(value)} {primaryUnit.symbol}
            </p>
          )}
          {description && !message && <FieldDescription id={`${fieldId}-description`}>{description}</FieldDescription>}
          {message && <FieldError id={`${fieldId}-error`}>{message}</FieldError>}
        </FieldContent>
      </Field>
    );
  },
);
QuantityField.displayName = 'QuantityField';
