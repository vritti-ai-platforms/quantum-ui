import { ChevronDown } from 'lucide-react';
import { type SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/shadcnPopover';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import type { Option, SingleFilterProps } from '../types';
import { ComboboxList } from './ComboboxList';
import { MenuFooter } from './MenuFooter';
import { OptionsLoader } from './OptionsLoader';

/**
 * SingleFilter - Chip/badge variant of SingleSelect
 *
 * Compact appearance showing selection inline as "Label = Value".
 * Uses variant styling based on selection state.
 *
 * @internal This component is for internal use within SingleSelect
 */
export const SingleFilter = ({
  optionsApiEndPoint,
  label,
  value,
  onChange,
  searchDb,
  handleOpen,
  handleClose,
  handleScroll,
  state,
  disableClear = false,
  fullWidth = false,
  disabled = false,
  loading = false,
  getValue,
}: SingleFilterProps) => {
  const { open, loadingInitialInternalOptions, internalOptions, internalOptionsMap, loadingInternalOptions, search } =
    state;

  const [localSearch, setLocalSearch] = useState(search || '');
  const wrapperRef = useRef<HTMLSpanElement>(null);

  // Force re-render on mount to ensure Popover positioning works
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, []);

  // Handle search changes
  const handleSearchChange = useCallback(
    (searchValue: string) => {
      setLocalSearch(searchValue);
      if (optionsApiEndPoint) {
        searchDb(searchValue);
      }
    },
    [optionsApiEndPoint, searchDb],
  );

  // Check if value is valid (exists in options map)
  const validValue = value !== null && value !== undefined && !!internalOptionsMap[String(value)];
  const selectedOption = validValue ? internalOptionsMap[String(value)] : null;

  // Handle option selection
  const handleSelect = useCallback(
    (option: Option) => {
      const newValue = getValue ? getValue(option) : option.value;
      onChange(newValue);
      handleClose({ currentTarget: {}, target: {} } as SyntheticEvent, 'selectOption');
    },
    [onChange, getValue, handleClose],
  );

  // Handle clear
  const handleClear = useCallback(() => {
    onChange(null);
    handleClose({ currentTarget: {}, target: {} } as SyntheticEvent, 'clear');
  }, [onChange, handleClose]);

  // Handle escape key
  const handleEscape = useCallback(() => {
    handleClose({ currentTarget: {}, target: {} } as SyntheticEvent, 'escape');
  }, [handleClose]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!open) {
      setLocalSearch('');
    }
  }, [open]);

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(isOpen) => {
        if (disabled) return;

        const syntheticEvent = {
          currentTarget: {},
          target: {},
        } as SyntheticEvent;

        if (isOpen) {
          handleOpen(syntheticEvent);
        } else {
          handleClose(syntheticEvent, 'blur');
        }
      }}
    >
      <PopoverTrigger asChild disabled={disabled}>
        <span ref={wrapperRef} style={{ display: fullWidth ? 'block' : 'inline-block' }}>
          <Button
            variant={validValue ? 'default' : 'outline'}
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn('justify-between', fullWidth ? 'w-full' : '')}
            disabled={disabled || loading || loadingInitialInternalOptions}
          >
            {selectedOption ? `${label} = ${selectedOption.label}` : label}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </span>
      </PopoverTrigger>

      <PopoverContent className="w-[250px] p-0" align="start">
        <ComboboxList
          searchValue={localSearch}
          onSearchChange={handleSearchChange}
          options={internalOptions}
          selectedValue={value}
          onSelect={handleSelect}
          onScroll={handleScroll}
          loading={loadingInternalOptions}
          shouldFilter={!optionsApiEndPoint}
          getValue={getValue}
          onEscape={handleEscape}
        />

        {loadingInternalOptions ? (
          <OptionsLoader isSearch={!!search} />
        ) : (
          !disableClear && selectedOption && <MenuFooter onClick={handleClear} />
        )}
      </PopoverContent>
    </Popover>
  );
};

SingleFilter.displayName = 'SingleFilter';
