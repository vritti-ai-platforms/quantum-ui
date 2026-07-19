import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type SiteFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for site filtering with async search
export const SiteFilter = Object.assign(
  forwardRef<HTMLButtonElement, SiteFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="siteId"
      label="Site"
      placeholder="Select site"
      optionsEndpoint="select-api/sites"
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      {...props}
    />
  )),
  { displayName: 'SiteFilter', defaultLabel: 'Site', defaultName: 'siteId' },
);
