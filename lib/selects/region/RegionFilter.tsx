import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type RegionFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for region filtering with async search
export const RegionFilter = Object.assign(
  forwardRef<HTMLButtonElement, RegionFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="regionId"
      label="Region"
      placeholder="Select region"
      optionsEndpoint="select-api/regions"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'RegionFilter', defaultLabel: 'Region', defaultName: 'regionId' },
);
