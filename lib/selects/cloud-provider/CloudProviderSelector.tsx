import { forwardRef } from 'react';
import { Select, type SelectProps, type SelectSingleProps } from '../../components/Select/Select';

export interface CloudProviderSelectorProps extends Omit<SelectSingleProps, 'optionsEndpoint'> {}

// Pre-configured Select for cloud provider selection with async search
export const CloudProviderSelector = forwardRef<HTMLButtonElement, CloudProviderSelectorProps>(
  ({ label = 'Cloud Provider', placeholder = 'Select provider', searchable = true, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      {...({
        label,
        placeholder,
        searchable,
        optionsEndpoint: 'admin-api/cloud-providers/select',
        fieldKeys: fieldKeys ?? { valueKey: 'id', labelKey: 'name' },
        ...props,
      } as SelectProps)}
    />
  ),
);
CloudProviderSelector.displayName = 'CloudProviderSelector';
