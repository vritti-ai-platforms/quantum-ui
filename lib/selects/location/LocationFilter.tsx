import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type LocationFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

export const LocationFilter = Object.assign(
  forwardRef<HTMLButtonElement, LocationFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="locationId"
      label="Location"
      placeholder="Select location"
      optionsEndpoint="commerce-api/locations/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'LocationFilter', defaultLabel: 'Location' },
);
