import { forwardRef } from 'react';
import { Select } from '../../components/Select/Select';
import type { SelectOption, SelectValue } from '../../components/Select/types';

export interface CloudProviderSelectorProps {
  value?: SelectValue;
  onChange?: (value: SelectValue) => void;
  onOptionSelect?: (option: SelectOption | null) => void;
  onBlur?: () => void;
  name?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
  params?: Record<string, string | number | boolean>;
}

// Pre-configured Select for cloud provider selection with async search
export const CloudProviderSelector = forwardRef<HTMLButtonElement, CloudProviderSelectorProps>(
  ({ label = 'Cloud Provider', placeholder = 'Select provider', ...props }, ref) => (
    <Select
      ref={ref}
      label={label}
      placeholder={placeholder}
      searchable
      optionsEndpoint="admin-api/cloud-providers/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  ),
);
CloudProviderSelector.displayName = 'CloudProviderSelector';
