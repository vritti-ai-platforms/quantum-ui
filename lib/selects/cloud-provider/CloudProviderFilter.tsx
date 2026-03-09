import { forwardRef } from 'react';
import { SelectFilter } from '../../components/Select/SelectFilter';
import type { FilterResult, SelectValue } from '../../components/Select/types';

export interface CloudProviderFilterProps {
  field?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: FilterResult | SelectValue;
  onChange?: (result: FilterResult | null | undefined) => void;
  operator?: string;
  onOperatorChange?: (operator: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

// Pre-configured SelectFilter for cloud provider filtering with async search
export const CloudProviderFilter = Object.assign(
  forwardRef<HTMLButtonElement, CloudProviderFilterProps>(
    ({ field = 'cloudProviderId', label = 'Cloud Provider', placeholder = 'Select provider', name, ...props }, ref) => (
      <SelectFilter
        ref={ref}
        field={field}
        name={name ?? field}
        label={label}
        placeholder={placeholder}
        optionsEndpoint="admin-api/cloud-providers/select"
        fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
        multiple={false}
        {...props}
      />
    ),
  ),
  { displayName: 'CloudProviderFilter', defaultLabel: 'Cloud Provider' },
);
