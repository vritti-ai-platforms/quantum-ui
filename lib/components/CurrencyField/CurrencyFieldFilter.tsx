import { BanknoteIcon, ChevronDownIcon, X } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { cn } from '../../../shadcn/utils';
import type { FilterCondition, FilterCurrencyValue } from '../../types/table-filter';
import { getCurrencyExponent, resolveCurrency } from '../../utils/currency';
import Decimal from '../../utils/decimal';
import { formatCurrency } from '../../utils/format';
import { Button } from '../Button';
import { CONTEXT_ANCHOR_CLASS, ContextAnchorText, type FilterMode } from '../Select/contextAnchor';
import { CurrencyField } from './CurrencyField';

const AMOUNT_PATTERN = /^(\d+\.?\d*|\.\d+)$/;

// The condition a CurrencyFieldFilter emits — always a `{ currency, value }` pair holding a major-unit amount string
export type CurrencyFilterCondition = FilterCondition & { value: FilterCurrencyValue };

interface CurrencyFieldFilterBaseProps {
  name: string;
  label: string;
  /** Locks the currency, passed through to CurrencyField */
  currencyCode?: string;
  /** The currencies that can be picked when the currency is not locked, passed through to CurrencyField */
  currencies?: string[];
  /** `filter` (default) is an applied filter chip; `context` is a DataTable context-bar selector — label and amount in
   * a quiet outlined trigger. */
  mode?: FilterMode;
  /** Shown in the context trigger while no amount is applied */
  placeholder?: string;
  className?: string;
}

// `clearable` (independent of `mode`, default `true`) decides whether the filter can be empty: a non-clearable one
// always holds an amount, so `value` is required and `onChange` never receives `null`. `value` is the applied condition,
// its `value` a `{ currency, value }` pair holding a major-unit amount string.
export type CurrencyFieldFilterProps = CurrencyFieldFilterBaseProps &
  (
    | { clearable?: true; value?: FilterCondition | null; onChange?: (value: CurrencyFilterCondition | null) => void }
    | { clearable: false; value: FilterCondition; onChange?: (value: CurrencyFilterCondition) => void }
  );

// Reads a stored currency amount from a filter value, ignoring anything else
function parseCurrencyValue(value: unknown): FilterCurrencyValue | undefined {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const { currency, value: amount } = value as Partial<FilterCurrencyValue>;
  if (typeof currency !== 'string' || typeof amount !== 'string') return undefined;
  return { currency, value: amount };
}

// The currency a fresh draft starts in: the locked one, else the applied one, else the workspace's, else the first allowed
function draftCurrency(
  applied: FilterCurrencyValue | undefined,
  currencyCode: string | undefined,
  currencies: string[] | undefined,
): string {
  if (currencyCode) return currencyCode;
  const allowed = (code: string | null | undefined): code is string =>
    !!code && (!currencies || currencies.length === 0 || currencies.includes(code));
  const appliedCurrency = applied?.currency;
  if (allowed(appliedCurrency)) return appliedCurrency;
  const workspaceCurrency = resolveCurrency();
  if (allowed(workspaceCurrency)) return workspaceCurrency;
  return currencies?.[0] ?? 'USD';
}

// The draft amount as a positive major-unit string at the currency's precision, or undefined when it can't be applied
function normalizeAmount(draft: FilterCurrencyValue): string | undefined {
  const amount = draft.value.trim();
  if (!AMOUNT_PATTERN.test(amount)) return undefined;
  const decimal = new Decimal(amount);
  if (!decimal.isFinite() || decimal.lte(0)) return undefined;
  return decimal.toFixed(getCurrencyExponent(draft.currency));
}

// Compact filter chip holding one money amount in a currency, entered through a CurrencyField in its popover
export const CurrencyFieldFilter: React.FC<CurrencyFieldFilterProps> = ({
  name,
  label,
  value,
  onChange: onChangeProp,
  currencyCode,
  currencies,
  mode = 'filter',
  clearable = true,
  placeholder,
  className,
}) => {
  const popoverId = useId();
  const [open, setOpen] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  // null is only sent from the clear actions, which render only when clearable
  const onChange = onChangeProp as ((value: CurrencyFilterCondition | null) => void) | undefined;

  const applied = parseCurrencyValue(value?.value);
  const appliedCurrency = applied?.currency;
  const appliedAmount = applied?.value;
  const currencyKey = currencies?.join(',');

  const [draft, setDraft] = useState<FilterCurrencyValue>(() => ({
    currency: draftCurrency(applied, currencyCode, currencies),
    value: applied?.value ?? '',
  }));

  // Sync the draft when the external value changes while the popover is closed
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the applied pair and the joined currency list, not on object identities
  useEffect(() => {
    if (open) return;
    setDraft({ currency: draftCurrency(applied, currencyCode, currencies), value: appliedAmount ?? '' });
  }, [open, appliedCurrency, appliedAmount, currencyCode, currencyKey]);

  const normalized = normalizeAmount(draft);

  // Commits the draft amount to the parent; an empty or non-positive amount is never applied
  const handleApply = useCallback(() => {
    if (normalized === undefined) return;
    onChange?.({ field: name, operator: 'equals', value: { currency: draft.currency, value: normalized } });
    setOpen(false);
  }, [draft.currency, name, normalized, onChange]);

  // Clears the filter condition
  const handleClear = useCallback(() => {
    onChange?.(null);
    setOpen(false);
  }, [onChange]);

  // Clears inline from the chip without opening the popover
  const handleInlineClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
    },
    [onChange],
  );

  // Enter in the amount input applies; keys from the currency picker's search are left alone
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLFieldSetElement>) => {
      if (e.key !== 'Enter' || e.target !== amountRef.current) return;
      e.preventDefault();
      handleApply();
    },
    [handleApply],
  );

  // Focuses the amount input on open instead of the first focusable element, the currency picker
  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
    amountRef.current?.focus();
  }, []);

  if (!name) {
    return (
      <span className="inline-flex items-center rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
        CurrencyFieldFilter: missing required `name` prop
      </span>
    );
  }

  const hasValue = applied != null;
  const isContext = mode === 'context';
  const canClear = clearable && hasValue;
  const valueText = applied ? formatCurrency(applied).primary : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-controls={popoverId}
          aria-expanded={open}
          className={cn(
            isContext
              ? CONTEXT_ANCHOR_CLASS
              : 'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            !isContext &&
              (hasValue
                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground'),
            className,
          )}
        >
          <BanknoteIcon className={cn('size-3.5 shrink-0', isContext ? 'text-muted-foreground' : 'opacity-70')} />
          {isContext ? (
            <ContextAnchorText label={label} value={valueText} placeholder={placeholder} />
          ) : (
            <span className="truncate">
              {label}
              {valueText != null && <>: {valueText}</>}
            </span>
          )}
          {canClear ? (
            <X className="size-3.5 shrink-0 opacity-70 hover:opacity-100" onClick={handleInlineClear} />
          ) : (
            <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent id={popoverId} className="w-72 p-0" align="start" onOpenAutoFocus={handleOpenAutoFocus}>
        <fieldset aria-label={label} className="min-w-0 space-y-3 p-4" onKeyDown={handleKeyDown}>
          <CurrencyField
            ref={amountRef}
            name={name}
            label={label}
            value={draft}
            onChange={setDraft}
            currencyCode={currencyCode}
            currencies={currencies}
            defaultCurrencyCode={draft.currency}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
          <div className="flex items-center justify-end gap-2">
            {clearable && (
              <Button variant="ghost" size="sm" onClick={handleClear} disabled={!hasValue}>
                Clear
              </Button>
            )}
            <Button size="sm" onClick={handleApply} disabled={normalized === undefined}>
              Apply
            </Button>
          </div>
        </fieldset>
      </PopoverContent>
    </Popover>
  );
};

CurrencyFieldFilter.displayName = 'CurrencyFieldFilter';
