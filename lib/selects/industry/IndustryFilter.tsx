import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type IndustryFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for industry filtering with async search
export const IndustryFilter = Object.assign(
  forwardRef<HTMLButtonElement, IndustryFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="industryId"
      label="Industry"
      placeholder="Select industry"
      optionsEndpoint="select-api/industries"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'IndustryFilter', defaultLabel: 'Industry' },
);
