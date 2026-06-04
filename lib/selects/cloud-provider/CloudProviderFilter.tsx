import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type CloudProviderFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for cloud provider filtering with async search
export const CloudProviderFilter = Object.assign(
  forwardRef<HTMLButtonElement, CloudProviderFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="cloudProviderId"
      label="Cloud Provider"
      placeholder="Select provider"
      optionsEndpoint="select-api/cloud-providers"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'CloudProviderFilter', defaultLabel: 'Cloud Provider', defaultName: 'cloudProviderId' },
);
