import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';
import { CURRENCIES } from './currencies';

export type CurrencyFilterProps = Omit<SelectFilterProps, 'options' | 'name'> & { name?: string };

// Pre-configured SelectFilter for currency filtering with static local options
export const CurrencyFilter = Object.assign(
  forwardRef<HTMLButtonElement, CurrencyFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="currency"
      label="Currency"
      placeholder="Select currency"
      options={CURRENCIES}
      {...props}
    />
  )),
  { displayName: 'CurrencyFilter', defaultLabel: 'Currency', defaultName: 'currency' },
);
