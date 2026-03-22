import { forwardRef } from 'react';
import { Select, type SelectProps, type SelectSingleProps } from '../../components/Select/Select';
import { CURRENCIES } from './currencies';

export interface CurrencySelectorProps extends Omit<SelectSingleProps, 'optionsEndpoint'> {}

// Pre-configured Select for currency selection with local searchable options
export const CurrencySelector = forwardRef<HTMLButtonElement, CurrencySelectorProps>(
  ({ label = 'Currency', placeholder = 'Select currency', searchable = true, options, ...props }, ref) => (
    <Select
      ref={ref}
      {...({
        label,
        placeholder,
        searchable,
        options: options ?? CURRENCIES,
        ...props,
      } as SelectProps)}
    />
  ),
);
CurrencySelector.displayName = 'CurrencySelector';
