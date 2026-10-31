import { ChevronDownIcon, Loader2, X } from 'lucide-react';
import type React from 'react';
import { forwardRef, useState } from 'react';
import {
  MultiSelectActions,
  MultiSelectContent,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectGroupLabel,
  MultiSelectList,
  MultiSelectRoot,
  MultiSelectRow,
  MultiSelectSearch,
} from '../../../../../shadcn/shadcnMultiSelect';
import { PopoverTrigger } from '../../../../../shadcn/shadcnPopover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../shadcn/shadcnSelect';
import { cn } from '../../../../../shadcn/utils';
import { CONTEXT_ANCHOR_CLASS, ContextAnchorText, type FilterMode } from '../../contextAnchor';
import { useMultiSelect } from '../../hooks/useMultiSelect';
import type { AsyncSelectState, SelectGroup, SelectOption, SelectValue as SelectValueType } from '../../types';

export interface MultiSelectFilterOperator {
  value: string;
  label: string;
}

const DEFAULT_MULTI_OPERATORS: MultiSelectFilterOperator[] = [
  { value: 'isAnyOf', label: 'is any of' },
  { value: 'isNotAnyOf', label: 'is not any of' },
];

export interface MultiSelectFilterProps {
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  value?: SelectValueType[];
  onChange?: (values: SelectValueType[]) => void;
  operator?: string;
  onOperatorChange?: (operator: string) => void;
  operators?: MultiSelectFilterOperator[];
  onBlur?: () => void;
  name: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  defaultValue?: SelectValueType[];
  /** Caps how many options can be selected; picking past it drops the selected option rendered highest in the list */
  maxSelected?: number;
  /** Whether the selection can be cleared (inline and from the popover footer) — independent of `mode`. Defaults to `true`. */
  clearable?: boolean;
  searchPlaceholder?: string;
  asyncState?: AsyncSelectState;
  onOpenChange?: (open: boolean) => void;
  transformLabel?: (label: string, option: SelectOption, context: 'option') => string;
  transformDescription?: (description: string, option: SelectOption) => string;
  /** `filter` (default) is an applied filter chip; `context` is a DataTable context-bar selector — label and a summary
   * of the selection in a quiet outlined trigger, no operator choice, no inline clear. */
  mode?: FilterMode;
}

// Compact multi-select filter trigger with count-based label display
export const MultiSelectFilter = forwardRef<HTMLButtonElement, MultiSelectFilterProps>(
  (
    {
      label,
      placeholder,
      options,
      groups,
      value: controlledValue,
      onChange,
      operator: controlledOperator,
      onOperatorChange,
      operators = DEFAULT_MULTI_OPERATORS,
      mode = 'filter',
      onBlur,
      name,
      disabled = false,
      required,
      className,
      id,
      defaultValue,
      maxSelected,
      clearable = true,
      searchPlaceholder = 'Search...',
      asyncState,
      onOpenChange,
      transformLabel,
      transformDescription,
    },
    ref,
  ) => {
    const [internalOperator, setInternalOperator] = useState(operators[0]?.value ?? 'isAnyOf');
    const activeOperator = controlledOperator ?? internalOperator;

    function handleOperatorChange(value: string) {
      setInternalOperator(value);
      onOperatorChange?.(value);
    }

    const state = useMultiSelect({
      options: options ?? [],
      groups,
      value: controlledValue,
      onChange,
      defaultValue,
      remoteSearch: !!asyncState,
      maxSelected,
    });

    // Resolve search binding -- async delegates to parent, filter always shows search
    const searchValue = asyncState ? asyncState.searchQuery : state.searchQuery;
    const setSearchValue = asyncState ? asyncState.setSearchQuery : state.setSearchQuery;

    function handleOpenChange(open: boolean) {
      state.setOpen(open);
      onOpenChange?.(open);
      if (!open) asyncState?.setSearchQuery('');
    }

    // Renders a single option row
    function renderRow(option: SelectOption) {
      const optionLabel = transformLabel ? transformLabel(option.label, option, 'option') : option.label;
      const optionDescription = option.description
        ? transformDescription
          ? transformDescription(option.description, option)
          : option.description
        : undefined;

      return (
        <MultiSelectRow
          key={String(option.value)}
          name={optionLabel}
          description={optionDescription}
          checked={state.selectedSet.has(option.value)}
          onToggle={() => {
            state.toggleOption(option.value);
          }}
          disabled={option.disabled}
        />
      );
    }

    // Renders the option list content (flat or grouped)
    function renderOptions() {
      if (asyncState?.loading) {
        return (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        );
      }

      if (state.filteredOptions.length === 0) {
        return <MultiSelectEmpty />;
      }

      if (!state.grouped) {
        return state.filteredOptions.map(renderRow);
      }

      return (
        <>
          {state.grouped.ungrouped.map(renderRow)}
          {state.grouped.entries.map((entry) => (
            <MultiSelectGroup key={entry.name}>
              <MultiSelectGroupLabel>{entry.name}</MultiSelectGroupLabel>
              {entry.options.map(renderRow)}
            </MultiSelectGroup>
          ))}
        </>
      );
    }

    if (!name) {
      return (
        <span className="inline-flex items-center rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive">
          Select: missing required `name` prop
        </span>
      );
    }

    const hasValues = state.selectedValues.length > 0;
    const isContext = mode === 'context';

    const operatorLabel = operators.find((o) => o.value === activeOperator)?.label ?? activeOperator;
    const triggerText = hasValues
      ? `${label}: ${operatorLabel} ${state.selectedValues.length} selected`
      : (label ?? placeholder);
    // The context trigger's value: the one option's label, a count for more, nothing (so the placeholder shows) for none
    const contextValue =
      state.selectedValues.length === 1 && state.selectedOptions.length === 1
        ? state.selectedOptions[0].label
        : hasValues
          ? `${state.selectedValues.length} selected`
          : undefined;

    // Clears inline from the chip without opening the popover
    function handleInlineClear(e: React.MouseEvent) {
      e.stopPropagation();
      state.clearAll();
    }

    return (
      <>
        <MultiSelectRoot open={state.open} onOpenChange={handleOpenChange} disabled={disabled}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              id={id}
              type="button"
              role="combobox"
              aria-expanded={state.open}
              aria-haspopup="listbox"
              aria-controls={state.listboxId}
              aria-required={required}
              disabled={disabled}
              onBlur={onBlur}
              className={cn(
                isContext
                  ? CONTEXT_ANCHOR_CLASS
                  : 'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                !isContext &&
                  (hasValues
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                    : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground'),
                className,
              )}
            >
              {isContext ? (
                <ContextAnchorText label={label} value={contextValue} placeholder={placeholder ?? 'All'} />
              ) : (
                <span className="truncate">{triggerText}</span>
              )}
              {hasValues && clearable ? (
                <X className="size-3.5 shrink-0 opacity-70 hover:opacity-100" onClick={handleInlineClear} />
              ) : (
                <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
              )}
            </button>
          </PopoverTrigger>

          <MultiSelectContent className="min-w-[250px]">
            {label && (
              <div className="flex items-center gap-1.5 border-b bg-muted/30 px-3 h-[42px] shrink-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                {!isContext && (
                  <Select value={activeOperator} onValueChange={handleOperatorChange}>
                    <SelectTrigger className="h-auto w-auto gap-1 rounded-none border-0 !bg-transparent p-0 shadow-none text-sm font-medium text-foreground hover:!bg-transparent focus-visible:ring-0 data-[state=open]:!bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            <MultiSelectSearch value={searchValue} onValueChange={setSearchValue} placeholder={searchPlaceholder} />

            <MultiSelectList id={state.listboxId}>
              {renderOptions()}
              {asyncState?.hasMore && <div ref={asyncState.sentinelRef} className="h-1" />}
              {asyncState?.loadingMore && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Loading more...</span>
                </div>
              )}
            </MultiSelectList>

            {(maxSelected === undefined || clearable) && (
              <MultiSelectActions
                onSelectAll={maxSelected === undefined ? state.selectAll : undefined}
                onClear={clearable ? state.clearAll : undefined}
                disabled={disabled}
              />
            )}
          </MultiSelectContent>
        </MultiSelectRoot>

        {name && state.selectedValues.map((v) => <input key={String(v)} type="hidden" name={name} value={String(v)} />)}
      </>
    );
  },
);

MultiSelectFilter.displayName = 'MultiSelectFilter';
