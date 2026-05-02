import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type VersionFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for version filtering with async search
export const VersionFilter = Object.assign(
  forwardRef<HTMLButtonElement, VersionFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="version"
      label="Version"
      placeholder="Select version"
      optionsEndpoint="select-api/versions"
      fieldKeys={{ valueKey: 'version', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'VersionFilter', defaultLabel: 'Version' },
);
