import { Loader2 } from 'lucide-react';
import type React from 'react';
import { Fragment, forwardRef } from 'react';
import { PopoverTrigger } from '../../../../../shadcn/shadcnPopover';
import {
  SingleSelectClear,
  SingleSelectContent,
  SingleSelectEmpty,
  SingleSelectGroup,
  SingleSelectGroupLabel,
  SingleSelectList,
  SingleSelectRoot,
  SingleSelectRow,
  SingleSelectSearch,
  SingleSelectTrigger,
} from '../../../../../shadcn/shadcnSingleSelect';
import { cn } from '../../../../../shadcn/utils';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../../Field';
import { useSingleSelect } from '../../hooks/useSingleSelect';
import type { AsyncSelectState, SelectGroup, SelectOption, SelectValue } from '../../types';

export interface SingleSelectAnchorProps {
  selectedOption: SelectOption | undefined;
  open: boolean;
  disabled: boolean;
}

export interface SingleSelectOptionRenderProps {
  option: SelectOption;
  selected: boolean;
  onSelect: () => void;
}

export type SingleSelectLabelTransformContext = 'trigger' | 'option';

export interface SingleSelectProps {
  label?: string;
  description?: React.ReactNode;
  error?: string;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  value?: SelectValue;
  onChange?: (value: SelectValue) => void;
  onOptionSelect?: (option: SelectOption | null) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  defaultValue?: SelectValue;
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  asyncState?: AsyncSelectState;
  // Custom trigger -- replaces the default SingleSelectTrigger
  anchor?: (props: SingleSelectAnchorProps) => React.ReactElement;
  // Custom option row renderer -- replaces the default SingleSelectRow
  renderOption?: (props: SingleSelectOptionRenderProps) => React.ReactNode;
  // Transforms how labels are displayed in trigger and option rows
  transformLabel?: (label: string, option: SelectOption, context: SingleSelectLabelTransformContext) => string;
  // Transforms how description is displayed in option rows
  transformDescription?: (description: string, option: SelectOption) => string;
  // Content rendered below the option list
  footer?: React.ReactNode;
  // Custom className for the popover content panel
  contentClassName?: string;
  // Called when the popover open state changes
  onOpenChange?: (open: boolean) => void;
}

// Single-value form field wrapper built on Popover primitives
export const SingleSelect = forwardRef<HTMLButtonElement, SingleSelectProps>(
  (
    {
      label,
      description,
      error,
      placeholder = 'Select an option',
      options,
      groups,
      value: controlledValue,
      onChange,
      onOptionSelect,
      onBlur,
      name,
      disabled = false,
      required,
      className,
      id,
      defaultValue,
      searchable = false,
      searchPlaceholder = 'Search...',
      clearable = false,
      asyncState,
      anchor,
      renderOption,
      transformLabel,
      transformDescription,
      footer,
      contentClassName,
      onOpenChange,
    },
    ref,
  ) => {
    const state = useSingleSelect({
      options: options ?? [],
      groups,
      value: controlledValue,
      onChange,
      onOptionSelect,
      defaultValue,
      remoteSearch: !!asyncState,
    });

    // Notifies parent (Select.tsx) of open state changes to gate async queries; clears async search on close
    function handleOpenChange(o: boolean) {
      state.setOpen(o);
      onOpenChange?.(o);
      if (!o) asyncState?.setSearchQuery('');
    }

    function handleSelectOption(value: SelectValue) {
      state.selectOption(value);
      handleOpenChange(false);
    }

    function handleClearSelection() {
      state.clearSelection();
      handleOpenChange(false);
    }

    // Resolve search binding -- async delegates to parent, static uses local state
    const searchValue = asyncState ? asyncState.searchQuery : state.searchQuery;
    const setSearchValue = asyncState ? asyncState.setSearchQuery : state.setSearchQuery;
    const showSearch = !!asyncState || searchable;

    // Renders a single option row
    function renderRow(option: SelectOption) {
      if (renderOption) {
        return (
          <Fragment key={String(option.value)}>
            {renderOption({
              option,
              selected: state.selectedValue === option.value,
              onSelect: () => handleSelectOption(option.value),
            })}
          </Fragment>
        );
      }
      return (
        <SingleSelectRow
          key={String(option.value)}
          name={transformLabel ? transformLabel(option.label, option, 'option') : option.label}
          description={
            option.description
              ? transformDescription
                ? transformDescription(option.description, option)
                : option.description
              : undefined
          }
          selected={state.selectedValue === option.value}
          onSelect={() => {
            handleSelectOption(option.value);
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
        return <SingleSelectEmpty />;
      }

      if (!state.grouped) {
        return state.filteredOptions.map(renderRow);
      }

      return (
        <>
          {state.grouped.ungrouped.map(renderRow)}
          {state.grouped.entries.map((entry) => (
            <SingleSelectGroup key={entry.name}>
              <SingleSelectGroupLabel>{entry.name}</SingleSelectGroupLabel>
              {entry.options.map(renderRow)}
            </SingleSelectGroup>
          ))}
        </>
      );
    }

    // Shared popover content used by both anchor and default paths
    function renderContent() {
      return (
        <SingleSelectContent className={contentClassName}>
          {showSearch && (
            <SingleSelectSearch value={searchValue} onValueChange={setSearchValue} placeholder={searchPlaceholder} />
          )}

          <SingleSelectList id={state.listboxId}>
            {renderOptions()}
            {asyncState?.hasMore && <div ref={asyncState.sentinelRef} className="h-1" />}
            {asyncState?.loadingMore && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading more...</span>
              </div>
            )}
          </SingleSelectList>

          {clearable && <SingleSelectClear onClear={handleClearSelection} disabled={!state.selectedValue} />}
          {footer}
        </SingleSelectContent>
      );
    }

    // Custom anchor path -- skip Field wrapper and use PopoverTrigger asChild
    if (anchor) {
      return (
        <Field>
          {label && <FieldLabel>{label}</FieldLabel>}
          <SingleSelectRoot open={state.open} onOpenChange={handleOpenChange} disabled={disabled}>
            <PopoverTrigger asChild>
              {anchor({ selectedOption: state.selectedOption, open: state.open, disabled })}
            </PopoverTrigger>
            {renderContent()}
          </SingleSelectRoot>
          {name && state.selectedValue && <input type="hidden" name={name} value={String(state.selectedValue)} />}
          {description && !error && <FieldDescription>{description}</FieldDescription>}
          {error && <FieldError>{error}</FieldError>}
        </Field>
      );
    }

    // Default path -- Field wrapper with SingleSelectTrigger
    return (
      <Field>
        {label && <FieldLabel>{label}</FieldLabel>}

        <SingleSelectRoot open={state.open} onOpenChange={handleOpenChange} disabled={disabled}>
          <SingleSelectTrigger
            ref={ref}
            id={id}
            open={state.open}
            listboxId={state.listboxId}
            aria-invalid={!!error}
            aria-required={required}
            disabled={disabled}
            onBlur={onBlur}
            className={cn('w-full', className)}
          >
            <span className="flex flex-1 items-center overflow-hidden">
              {state.selectedOption ? (
                <span className="truncate">
                  {transformLabel
                    ? transformLabel(state.selectedOption.label, state.selectedOption, 'trigger')
                    : state.selectedOption.label}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
          </SingleSelectTrigger>
          {renderContent()}
        </SingleSelectRoot>

        {name && state.selectedValue && <input type="hidden" name={name} value={String(state.selectedValue)} />}

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

SingleSelect.displayName = 'SingleSelect';
