import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';
import { CURRENCIES } from './currencies';

export type CurrencySelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for currency selection with local searchable options
export const CurrencySelector = forwardRef<HTMLButtonElement, CurrencySelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Currency"
    placeholder="Select currency"
    searchable
    options={CURRENCIES}
    {...props}
  />
));
CurrencySelector.displayName = 'CurrencySelector';
