import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type CloudProviderSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for cloud provider selection with async search
export const CloudProviderSelector = forwardRef<HTMLButtonElement, CloudProviderSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Cloud Provider"
    placeholder="Select provider"
    searchable
    optionsEndpoint="select-api/cloud-providers"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
CloudProviderSelector.displayName = 'CloudProviderSelector';
