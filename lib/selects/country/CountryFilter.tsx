import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type CountryFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for country filtering with async search
export const CountryFilter = Object.assign(
  forwardRef<HTMLButtonElement, CountryFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="countryId"
      label="Country"
      placeholder="Select country"
      optionsEndpoint="select-api/countries"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'CountryFilter', defaultLabel: 'Country', defaultName: 'countryId' },
);
