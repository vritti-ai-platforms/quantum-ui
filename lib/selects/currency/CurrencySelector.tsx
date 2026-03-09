import { forwardRef } from 'react';
import { Select } from '../../components/Select/Select';
import type { SelectOption, SelectValue } from '../../components/Select/types';
import { CURRENCIES } from './currencies';

export interface CurrencySelectorProps {
  value?: SelectValue;
  onChange?: (value: SelectValue) => void;
  onOptionSelect?: (option: SelectOption | null) => void;
  onBlur?: () => void;
  name?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
}

// Pre-configured Select for currency selection with local searchable options
export const CurrencySelector = forwardRef<HTMLButtonElement, CurrencySelectorProps>(
  ({ label = 'Currency', placeholder = 'Select currency', ...props }, ref) => (
    <Select
      ref={ref}
      label={label}
      placeholder={placeholder}
      searchable
      options={CURRENCIES}
      {...props}
    />
  ),
);
CurrencySelector.displayName = 'CurrencySelector';
