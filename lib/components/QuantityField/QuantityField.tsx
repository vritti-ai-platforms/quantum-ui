import { ChevronDown, Ruler } from 'lucide-react';
import React from 'react';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../../../shadcn/shadcnField';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { Spinner } from '../../../shadcn/shadcnSpinner';
import { cn } from '../../../shadcn/utils';
import { formatNumber } from '../../utils/format';
import { getLocale } from '../../utils/locale';
import { Button } from '../Button';
import { BoundAfterValue, boundWords, isOutOfBounds, NumberFieldLabelRow } from '../Field/numberConstraints';
import { Select, type SelectOption, type SelectValue } from '../Select';
import {
  breakDownQty,
  entryUnits,
  fromPrimaryQty,
  partsOfQty,
  type QuantityUnit,
  resolveQuantityMessage,
  sumParts,
  takesDecimals,
  unitSize,
} from './quantity';

export interface QuantityFieldProps {
  name?: string;
  units: QuantityUnit[];
  primaryUnitId: string;
  // The unit the field reads in until another is picked — usually the item's display unit
  defaultUnitId?: string;
  // The unit the field reads in, when the caller owns it (a PO line in the supplier's unit)
  anchorUnitId?: string;
  onAnchorUnitChange?: (unitId: string) => void;
  // The only units it may read in (a supplier's selling units); the rest are still entered through the breakdown. Every
  // unit without it
  anchorUnitIds?: string[];
  // Whether the primary unit (and its family units, L or kg) takes decimals; packs are entered in whole numbers
  allowDecimal?: boolean;
  // Read through every pack between the anchor and the primary unit (9 box + 5 strip + 2 tab) instead of the anchor and
  // the primary units left over (9 box + 52 tab) — the item's own setting
  cascade?: boolean;
  // Table-cell density: tighter padding and the breakdown without "+" ("9 box 5 strip 2 tab")
  compact?: boolean;
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
  // The bounds the quantity keeps, in the primary unit; read in words right after the value, in the unit the field reads
  // in ("of 4", "min 2", "2 to 4"). The form's schema enforces them
  min?: number;
  max?: number;
  // Above zero, and never zero; shown as rule chips on the label row, with "Int" while the unit the field reads in takes
  // whole numbers only
  positive?: boolean;
  nonZero?: boolean;
}

const WHOLE_PATTERN = /^\d*$/;
const DECIMAL_PATTERN = /^\d*\.?\d{0,3}$/;
const DIGIT_KEY = /^\d$/;

// Formats a number for the field's reading and messages in the user's locale
function formatAmount(value: number): string {
  return String(formatNumber(value, { localeTag: getLocale() ?? 'en-US' }).primary);
}

// Quantity of an item in any mix of its units. While the quantity reads as a whole number of its anchor unit (or is
// empty) it is typed straight into the field, in that unit; once it breaks down through smaller units ("9 box + 5 strip
// + 2 tab") the field shows that reading, and clicking it — or arrow down in the input — opens a panel with one input
// per unit. The unit at the end changes the unit it reads in. An item with a single unit is a plain input. The value is
// the sum in the primary unit, null when emptied where nullable
export const QuantityField = React.forwardRef<HTMLElement, QuantityFieldProps>(
  (
    {
      units,
      primaryUnitId,
      defaultUnitId,
      anchorUnitId,
      onAnchorUnitChange,
      anchorUnitIds,
      allowDecimal = false,
      cascade = false,
      compact,
      value,
      onChange,
      onBlur,
      nullable,
      label,
      description,
      placeholder = 'Qty',
      error,
      disabled,
      required,
      loading,
      className,
      min,
      max,
      positive,
      nonZero,
    },
    ref,
  ) => {
    const fieldId = React.useId();
    const [pickedUnitId, setPickedUnitId] = React.useState<string>();
    const [parts, setParts] = React.useState<Record<string, string>>({});
    const [open, setOpen] = React.useState(false);
    // The primary quantity the typed parts stand for; a value matching it came from this field
    const shown = React.useRef<{ qty: number | undefined } | null>(null);
    const focusTarget = React.useRef<HTMLButtonElement | HTMLInputElement | null>(null);
    const fieldBox = React.useRef<HTMLDivElement>(null);
    const panel = React.useRef<HTMLDivElement>(null);
    const rowInputs = React.useRef(new Map<string, HTMLInputElement>());
    React.useImperativeHandle(ref, () => focusTarget.current as HTMLElement);

    const primaryUnit = units.find((unit) => unit.id === primaryUnitId);
    const anchorUnits = React.useMemo(
      () => (anchorUnitIds ? units.filter((unit) => anchorUnitIds.includes(unit.id)) : units),
      [units, anchorUnitIds],
    );
    const anchor =
      anchorUnits.find((unit) => unit.id === (anchorUnitId ?? pickedUnitId)) ??
      anchorUnits.find((unit) => unit.id === defaultUnitId) ??
      anchorUnits.find((unit) => unit.id === primaryUnitId) ??
      anchorUnits[0];
    const singleUnit = units.length === 1 && !!primaryUnit;
    const isDisabled = !!disabled || !!loading || !anchor;
    // The units it may read in, largest first like the panel's rows
    const options = React.useMemo<SelectOption[]>(
      () =>
        [...anchorUnits]
          .sort((a, b) => unitSize(b).cmp(unitSize(a)))
          .map((unit) => ({ value: unit.id, label: unit.symbol, description: unit.name })),
      [anchorUnits],
    );
    // The panel's rows, largest first: the packs, the primary unit, and the anchor when it is a family unit (L, kg)
    const ladder = React.useMemo(() => entryUnits(units, primaryUnitId, anchor?.id), [units, primaryUnitId, anchor]);

    // A value set from outside (reset, setValue, edit defaults) or units arriving late re-enter it as its breakdown
    React.useEffect(() => {
      if (!primaryUnit || !anchor) return;
      const qty = value ?? undefined;
      if (shown.current && shown.current.qty === qty) return;
      shown.current = { qty };
      setParts(partsOfQty(qty, units, anchor.id, primaryUnit.id, cascade));
    }, [value, units, anchor, primaryUnit, cascade]);

    // Keeps the typed parts and reports their sum in the primary unit when it changed
    const commit = (next: Record<string, string>) => {
      setParts(next);
      const qty = sumParts(next, units);
      const previous = shown.current?.qty;
      shown.current = { qty };
      if (qty !== previous) onChange?.(qty === undefined && nullable ? null : qty);
    };

    // Takes a unit's typed amount when it reads as one: whole packs, decimals only where the primary unit allows them
    const enter = (unit: QuantityUnit, text: string) => {
      const pattern = takesDecimals(unit, primaryUnitId, allowDecimal) ? DECIMAL_PATTERN : WHOLE_PATTERN;
      if (!pattern.test(text)) return;
      commit({ ...parts, [unit.id]: text });
    };

    // Reads the quantity in the picked unit instead
    const handleAnchorChange = (next: SelectValue) => {
      const unit = units.find((option) => option.id === next);
      if (!unit) return;
      setPickedUnitId(unit.id);
      onAnchorUnitChange?.(unit.id);
    };

    // Puts the cursor at the end of a unit's row in the panel
    const focusRow = (unitId: string | undefined) => {
      const input = unitId ? rowInputs.current.get(unitId) : undefined;
      if (!input) return;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    };

    // Leaving the typed amount for the unit picker or the panel is still entering the quantity: the panel closing reports
    // the blur instead
    const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const next = event.relatedTarget;
      if (next && (fieldBox.current?.contains(next) || panel.current?.contains(next))) return;
      onBlur?.();
    };

    const handleOpenChange = (next: boolean) => {
      setOpen(next);
      if (!next) onBlur?.();
    };

    // A digit typed on the reading opens the panel with it in the anchor unit's row; arrow down just opens it
    const handleReadingKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!anchor) return;
      if (DIGIT_KEY.test(event.key)) {
        event.preventDefault();
        const typed = Object.values(parts).filter((amount) => amount !== '' && Number(amount) !== 0).length;
        if (typed <= 1) commit({ [anchor.id]: event.key });
        setOpen(true);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
      }
    };

    // Enter and the arrows move between the rows; Enter on the last row closes the panel
    const handleRowKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key !== 'Enter' && event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      const next = ladder[index + (event.key === 'ArrowUp' ? -1 : 1)];
      if (next) focusRow(next.id);
      else if (event.key === 'Enter') handleOpenChange(false);
    };

    const total = sumParts(parts, units);
    const pieces =
      total === undefined || !anchor || !primaryUnit
        ? []
        : breakDownQty(total, units, anchor.id, primaryUnit.id, cascade);
    const shownPieces = pieces.filter((piece) => !piece.amount.isZero());
    const reading =
      total === undefined || !anchor
        ? null
        : shownPieces.length === 0
          ? `0 ${anchor.symbol}`
          : shownPieces
              .map((piece) => `${formatAmount(piece.amount.toNumber())} ${piece.unit.symbol}`)
              .join(compact ? ' ' : ' + ');

    // Whether the quantity reads in the anchor unit alone, so it can be typed straight into the field
    const inAnchorAlone =
      !!anchor && (shownPieces.length === 0 || (shownPieces.length === 1 && shownPieces[0].unit.id === anchor.id));
    // What the field's own input shows: the anchor amount as typed while it is the only part, else the total re-read in
    // the anchor unit (after the unit is changed, or a value arrives from outside)
    const typedOnly = !!anchor && Object.keys(parts).every((unitId) => unitId === anchor.id || !parts[unitId]);
    const anchorText = !anchor ? '' : typedOnly ? (parts[anchor.id] ?? '') : fromPrimaryQty(total, anchor);

    // Takes the quantity typed straight into the field as the whole of it, in the anchor unit
    const enterInAnchor = (text: string) => {
      if (!anchor) return;
      const pattern = takesDecimals(anchor, primaryUnitId, allowDecimal) ? DECIMAL_PATTERN : WHOLE_PATTERN;
      if (!pattern.test(text)) return;
      commit({ [anchor.id]: text });
    };

    // Arrow down in the input opens the panel, to enter the quantity through several units
    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      setOpen(true);
    };

    // A bound as it reads after the value: the bare amount while it is a whole amount of the anchor unit, named beside the
    // value by the unit picker, else the anchor unit and the smaller ones it breaks down through, each with its symbol
    const boundReading = (qty: number) => {
      if (!anchor || !primaryUnit) return formatAmount(qty);
      const boundPieces = breakDownQty(qty, units, anchor.id, primaryUnit.id, cascade).filter(
        (piece) => !piece.amount.isZero(),
      );
      if (boundPieces.length === 0) return formatAmount(0);
      if (boundPieces.length === 1 && boundPieces[0].unit.id === anchor.id) {
        return formatAmount(boundPieces[0].amount.toNumber());
      }
      return boundPieces.map((piece) => `${formatAmount(piece.amount.toNumber())} ${piece.unit.symbol}`).join(' + ');
    };
    const bound = boundWords(
      min === undefined ? undefined : boundReading(min),
      max === undefined ? undefined : boundReading(max),
    );
    const outOfBounds = isOutOfBounds(total, min, max);
    // Whether the unit the field reads in takes whole numbers only, the Int rule on the label row
    const wholeOnly = anchor ? !takesDecimals(anchor, primaryUnitId, allowDecimal) : !allowDecimal;
    const inputBound = (text: string) =>
      bound ? (
        <BoundAfterValue
          text={text || placeholder}
          bound={bound}
          outOfBounds={outOfBounds}
          className={cn('text-sm tabular-nums', compact ? 'pl-2.5' : 'pl-3')}
        />
      ) : null;

    const message =
      error && anchor && primaryUnit ? resolveQuantityMessage(error, anchor, primaryUnit, formatAmount) : error;
    const describedBy =
      [description && !message && `${fieldId}-description`, message && `${fieldId}-error`].filter(Boolean).join(' ') ||
      undefined;
    const boxClass = cn(
      'relative flex h-9 w-full items-stretch rounded-md border border-input shadow-xs transition-[color,box-shadow] bg-input/30',
      'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50',
      open && 'border-ring ring-1 ring-ring/50',
      isDisabled && 'cursor-not-allowed opacity-50',
      message &&
        'border-destructive ring-destructive/20 dark:ring-destructive/40 focus-within:border-destructive focus-within:ring-destructive/20 dark:focus-within:ring-destructive/40',
      className,
    );

    return (
      <Field data-disabled={isDisabled}>
        {label && (
          <NumberFieldLabelRow integer={wholeOnly} positive={positive} nonZero={nonZero}>
            <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
          </NumberFieldLabelRow>
        )}
        <FieldContent>
          {singleUnit ? (
            <div className={boxClass}>
              <input
                ref={(node) => {
                  focusTarget.current = node;
                }}
                id={fieldId}
                type="text"
                inputMode={allowDecimal ? 'decimal' : 'numeric'}
                autoComplete="off"
                value={parts[primaryUnit.id] ?? ''}
                onChange={(event) => enter(primaryUnit, event.target.value)}
                onBlur={onBlur}
                disabled={isDisabled}
                required={required}
                placeholder={placeholder}
                aria-invalid={!!message}
                aria-describedby={describedBy}
                className={cn(
                  'min-w-0 flex-1 bg-transparent py-1 text-sm tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
                  compact ? 'px-2.5' : 'px-3',
                )}
              />
              {inputBound(parts[primaryUnit.id] ?? '')}
              <span
                className={cn(
                  'flex shrink-0 items-center rounded-r-md border-l border-input bg-muted/60 text-sm font-medium text-muted-foreground',
                  compact ? 'px-2' : 'px-3',
                )}
              >
                {primaryUnit.symbol}
              </span>
            </div>
          ) : (
            <Popover open={open} onOpenChange={handleOpenChange}>
              <PopoverAnchor asChild>
                <div ref={fieldBox} className={boxClass}>
                  {inAnchorAlone && anchor ? (
                    <input
                      ref={(node) => {
                        focusTarget.current = node;
                      }}
                      id={fieldId}
                      type="text"
                      inputMode={takesDecimals(anchor, primaryUnitId, allowDecimal) ? 'decimal' : 'numeric'}
                      autoComplete="off"
                      value={anchorText}
                      onChange={(event) => enterInAnchor(event.target.value)}
                      onKeyDown={handleInputKeyDown}
                      onBlur={handleInputBlur}
                      disabled={isDisabled}
                      required={required}
                      placeholder={placeholder}
                      aria-invalid={!!message}
                      aria-busy={loading || undefined}
                      aria-describedby={describedBy}
                      className={cn(
                        'min-w-0 flex-1 rounded-l-md bg-transparent py-1 text-sm tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
                        compact ? 'px-2.5' : 'px-3',
                      )}
                    />
                  ) : null}
                  {inAnchorAlone && anchor ? inputBound(anchorText) : null}
                  {inAnchorAlone && anchor ? (
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={isDisabled}
                        aria-label="Enter the quantity by unit"
                        title="Enter by unit (or arrow down)"
                        className={cn(
                          'flex shrink-0 items-center text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground disabled:cursor-not-allowed',
                          compact ? 'px-1.5' : 'px-2',
                          open && 'text-foreground',
                        )}
                      >
                        <Ruler className="size-3.5" />
                      </button>
                    </PopoverTrigger>
                  ) : (
                    <PopoverTrigger asChild>
                      <button
                        ref={(node) => {
                          focusTarget.current = node;
                        }}
                        id={fieldId}
                        type="button"
                        disabled={isDisabled}
                        title={reading ?? undefined}
                        onKeyDown={handleReadingKeyDown}
                        aria-invalid={!!message}
                        aria-busy={loading || undefined}
                        aria-describedby={describedBy}
                        className={cn(
                          'flex min-w-0 flex-1 items-center rounded-l-md text-left text-sm tabular-nums outline-none disabled:cursor-not-allowed',
                          compact ? 'px-2.5' : 'px-3',
                        )}
                      >
                        <span className={cn('min-w-0 truncate', !reading && 'text-muted-foreground')}>
                          {reading ?? placeholder}
                        </span>
                        {bound && (
                          <span
                            aria-hidden
                            className={cn(
                              'ml-1.5 shrink-0 text-xs text-muted-foreground',
                              outOfBounds && 'text-destructive',
                            )}
                          >
                            {bound}
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                  )}
                  <div className="flex shrink-0 items-stretch border-l border-input">
                    <Select
                      options={options}
                      value={anchor?.id ?? null}
                      onChange={handleAnchorChange}
                      disabled={isDisabled}
                      clearable={false}
                      label=""
                      contentClassName="min-w-40"
                      anchor={({ selectedOption, open: unitsOpen, disabled: anchorDisabled }) => (
                        <button
                          type="button"
                          disabled={anchorDisabled}
                          aria-label="Read the quantity in"
                          aria-expanded={unitsOpen}
                          className={cn(
                            'flex h-full items-center gap-1 rounded-r-md text-sm font-medium text-foreground outline-none hover:bg-accent/50 focus-visible:bg-accent/50 disabled:cursor-not-allowed',
                            compact ? 'px-2' : 'px-3',
                          )}
                        >
                          {loading ? (
                            <Spinner className="size-3.5 text-muted-foreground" />
                          ) : (
                            <span className="truncate">{selectedOption?.label ?? anchor?.symbol ?? '—'}</span>
                          )}
                          <ChevronDown
                            className={cn(
                              'size-3.5 shrink-0 text-muted-foreground transition-transform',
                              unitsOpen && 'rotate-180',
                            )}
                          />
                        </button>
                      )}
                    />
                  </div>
                </div>
              </PopoverAnchor>
              <PopoverContent
                ref={panel}
                align="start"
                className="w-72 p-3"
                aria-label="Quantity by unit"
                onOpenAutoFocus={(event) => {
                  event.preventDefault();
                  focusRow(anchor?.id);
                }}
              >
                <p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Quantity by unit
                </p>
                <div className="flex flex-col gap-1.5">
                  {ladder.map((unit, index) => {
                    const decimal = takesDecimals(unit, primaryUnitId, allowDecimal);
                    const size = unitSize(unit);
                    return (
                      <label key={unit.id} className="flex items-center gap-2">
                        <span className="w-14 truncate text-sm font-medium">{unit.symbol}</span>
                        <input
                          ref={(node) => {
                            if (node) rowInputs.current.set(unit.id, node);
                            else rowInputs.current.delete(unit.id);
                          }}
                          type="text"
                          inputMode={decimal ? 'decimal' : 'numeric'}
                          autoComplete="off"
                          value={parts[unit.id] ?? ''}
                          placeholder="0"
                          onChange={(event) => enter(unit, event.target.value)}
                          onKeyDown={(event) => handleRowKeyDown(event, index)}
                          className="h-8 min-w-0 flex-1 rounded-md border border-input px-2 text-sm tabular-nums shadow-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 bg-input/30"
                        />
                        <span className="w-20 shrink-0 truncate text-right text-xs text-muted-foreground tabular-nums">
                          {unit.id === primaryUnitId || !primaryUnit
                            ? ''
                            : `×${formatAmount(size.toNumber())} ${primaryUnit.symbol}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between border-t pt-2.5">
                  <span className="text-sm tabular-nums">
                    <span className="text-muted-foreground">=</span>{' '}
                    <span className="font-medium">
                      {total === undefined || !primaryUnit ? '—' : `${formatAmount(total)} ${primaryUnit.symbol}`}
                    </span>
                  </span>
                  <div className="flex gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        commit({});
                        focusRow(anchor?.id);
                      }}
                    >
                      Clear
                    </Button>
                    <Button type="button" size="xs" onClick={() => handleOpenChange(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          {description && !message && <FieldDescription id={`${fieldId}-description`}>{description}</FieldDescription>}
          {message && <FieldError id={`${fieldId}-error`}>{message}</FieldError>}
        </FieldContent>
      </Field>
    );
  },
);
QuantityField.displayName = 'QuantityField';
