import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type SiteGroupFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for site group filtering with async search
export const SiteGroupFilter = Object.assign(
  forwardRef<HTMLButtonElement, SiteGroupFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="siteGroupId"
      label="Site Group"
      placeholder="Select site group"
      optionsEndpoint="select-api/site-groups"
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      {...props}
    />
  )),
  { displayName: 'SiteGroupFilter', defaultLabel: 'Site Group', defaultName: 'siteGroupId' },
);
