import { forwardRef } from 'react';
import { SelectFilter } from '../../components/Select/SelectFilter';
import type { FilterResult, SelectValue } from '../../components/Select/types';
import { CURRENCIES } from './currencies';

export interface CurrencyFilterProps {
  field?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: FilterResult | SelectValue;
  onChange?: (result: FilterResult | null | undefined) => void;
  operator?: string;
  onOperatorChange?: (operator: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

// Pre-configured SelectFilter for currency filtering with static local options
export const CurrencyFilter = Object.assign(
  forwardRef<HTMLButtonElement, CurrencyFilterProps>(
    ({ field = 'currency', label = 'Currency', placeholder = 'Select currency', name, ...props }, ref) => (
      <SelectFilter
        ref={ref}
        field={field}
        name={name ?? field}
        label={label}
        placeholder={placeholder}
        options={CURRENCIES}
        multiple={false}
        {...props}
      />
    ),
  ),
  { displayName: 'CurrencyFilter', defaultLabel: 'Currency' },
);
