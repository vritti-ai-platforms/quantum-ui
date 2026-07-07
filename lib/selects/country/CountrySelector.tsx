import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type CountrySelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for country selection with async search
export const CountrySelector = forwardRef<HTMLButtonElement, CountrySelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Country"
    placeholder="Select country"
    searchable
    optionsEndpoint="select-api/countries"
    fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
    {...props}
  />
));
CountrySelector.displayName = 'CountrySelector';
