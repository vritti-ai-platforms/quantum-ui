import { ChevronDown } from 'lucide-react';
import React from 'react';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../shadcn/shadcnTooltip';
import { cn } from '../../../shadcn/utils';
import { CurrencySelector } from '../../selects/currency/CurrencySelector';
import { type CurrencyValue, getCurrencyExponent } from '../../utils/currency';

export interface CurrencyFieldProps {
  name?: string;

  value?: CurrencyValue;

  onChange?: (value: CurrencyValue) => void;

  currencyCode?: string;

  defaultCurrencyCode?: string;

  label?: React.ReactNode;

  description?: React.ReactNode;

  error?: React.ReactNode;

  disabled?: boolean;

  disabledTip?: string;

  placeholder?: string;

  className?: string;

  required?: boolean;
}

// Truncates an amount string to at most `decimals` fractional digits
function truncateDecimals(amount: string, decimals: number): string {
  if (amount === '') return amount;
  if (!Number.isFinite(Number(amount))) return amount;
  const [whole, fraction] = amount.split('.');
  if (decimals === 0) return whole ?? '';
  if (fraction === undefined) return amount;
  if (fraction.length <= decimals) return amount;
  return `${whole}.${fraction.slice(0, decimals)}`;
}

// Returns the `step` attribute for an input given a currency exponent
function stepForDecimals(decimals: number): string {
  if (decimals <= 0) return '1';
  return `0.${'0'.repeat(decimals - 1)}1`;
}

// Currency-aware money input combining a currency selector with an exponent-aware amount input
export const CurrencyField = React.forwardRef<HTMLInputElement, CurrencyFieldProps>(
  (
    {
      name: _name,
      value,
      onChange,
      currencyCode,
      defaultCurrencyCode = 'USD',
      label,
      description,
      error,
      disabled,
      disabledTip,
      placeholder,
      className,
      required,
    },
    ref,
  ) => {
    const fieldId = React.useId();
    const hasError = !!error;
    const isLocked = !!currencyCode;

    const initialCurrency = value?.currency ?? currencyCode ?? defaultCurrencyCode ?? 'USD';
    const [currency, setCurrency] = React.useState<string>(initialCurrency);
    const [amount, setAmount] = React.useState<string>(value?.value ?? '');

    // Sync with external controlled value changes
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally omitting internal state to avoid feedback loops
    React.useEffect(() => {
      if (value?.currency !== undefined && value.currency !== currency) {
        setCurrency(value.currency);
      }
      if (value?.value !== undefined && value.value !== amount) {
        setAmount(value.value);
      }
    }, [value?.currency, value?.value]);

    // If currencyCode prop changes while locked, reflect it
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally omitting internal state to avoid feedback loops
    React.useEffect(() => {
      if (currencyCode && currencyCode !== currency) {
        setCurrency(currencyCode);
      }
    }, [currencyCode]);

    const decimals = getCurrencyExponent(currency);
    const step = stepForDecimals(decimals);

    const emit = React.useCallback(
      (nextCurrency: string, nextAmount: string) => {
        onChange?.({ currency: nextCurrency, value: nextAmount });
      },
      [onChange],
    );

    const handleCurrencyChange = React.useCallback(
      (nextValue: string | number | boolean) => {
        const nextCurrency = String(nextValue);
        const nextDecimals = getCurrencyExponent(nextCurrency);
        const truncated = truncateDecimals(amount, nextDecimals);
        setCurrency(nextCurrency);
        if (truncated !== amount) setAmount(truncated);
        emit(nextCurrency, truncated);
      },
      [amount, emit],
    );

    const handleAmountChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        // Allow empty, digits, and a single decimal separator; cap fractional digits
        if (raw === '') {
          setAmount('');
          emit(currency, '');
          return;
        }
        // Strict numeric pattern -- reject anything else silently
        if (!/^\d*\.?\d*$/.test(raw)) return;
        const truncated = truncateDecimals(raw, decimals);
        setAmount(truncated);
        emit(currency, truncated);
      },
      [currency, decimals, emit],
    );

    const handleAmountBlur = React.useCallback(() => {
      if (amount === '' || amount === '.') return;
      const parsed = Number(amount);
      if (!Number.isFinite(parsed)) return;
      const snapped = parsed.toFixed(decimals);
      if (snapped !== amount) {
        setAmount(snapped);
        emit(currency, snapped);
      }
    }, [amount, currency, decimals, emit]);

    const field = (
      <Field data-disabled={disabled}>
        {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}

        <FieldContent>
          <div
            className={cn(
              'flex h-9 w-full items-stretch rounded-md border border-input bg-transparent dark:bg-input/30 shadow-xs transition-[color,box-shadow]',
              'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[1px]',
              disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              hasError && 'border-destructive focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40',
              className,
            )}
          >
            {isLocked ? (
              <span
                role="img"
                aria-label={`Currency ${currency}`}
                className="flex items-center justify-center border-r border-input px-3 text-sm font-medium text-muted-foreground select-none"
              >
                {currency}
              </span>
            ) : (
              <div className="flex items-center border-r border-input">
                <CurrencySelector
                  value={currency}
                  onChange={handleCurrencyChange}
                  disabled={disabled}
                  clearable={false}
                  label=""
                  contentClassName="min-w-[280px] w-auto"
                  anchor={({ selectedOption, open, disabled: anchorDisabled }) => (
                    <button
                      type="button"
                      disabled={anchorDisabled}
                      aria-label="Select currency"
                      aria-expanded={open}
                      className={cn(
                        'flex h-full items-center gap-1 px-3 text-sm font-medium text-foreground outline-none',
                        'hover:bg-accent/50 focus-visible:bg-accent/50',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                      )}
                    >
                      <span>{selectedOption ? String(selectedOption.value) : currency}</span>
                      <ChevronDown
                        className={cn('size-3.5 text-muted-foreground transition-transform', open && 'rotate-180')}
                      />
                    </button>
                  )}
                />
              </div>
            )}

            <input
              ref={ref}
              id={fieldId}
              type="text"
              inputMode="decimal"
              pattern="^[0-9]*\.?[0-9]*$"
              step={step}
              value={amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              disabled={disabled}
              required={required}
              placeholder={placeholder}
              aria-invalid={hasError}
              aria-describedby={description || error ? `${fieldId}-description ${fieldId}-error` : undefined}
              className={cn(
                'flex-1 min-w-0 bg-transparent px-3 py-1 text-sm outline-none',
                'placeholder:text-muted-foreground',
                'disabled:cursor-not-allowed',
              )}
            />
          </div>

          {description && !error && <FieldDescription id={`${fieldId}-description`}>{description}</FieldDescription>}
          {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
        </FieldContent>
      </Field>
    );

    if (!disabledTip || !disabled) {
      return field;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          {/* Disabled inputs don't emit hover/focus events, so the trigger lives on a wrapper. */}
          <TooltipTrigger asChild>
            <span className="inline-flex w-full cursor-not-allowed">{field}</span>
          </TooltipTrigger>
          <TooltipContent>{disabledTip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

CurrencyField.displayName = 'CurrencyField';
