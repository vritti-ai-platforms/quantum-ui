import { forwardRef } from 'react';
import { Select } from '../../components/Select/Select';
import type { SelectOption, SelectValue } from '../../components/Select/types';

export interface DeploymentSelectorProps {
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
}

// Pre-configured Select for deployment selection with async search
export const DeploymentSelector = forwardRef<HTMLButtonElement, DeploymentSelectorProps>(
  ({ label = 'Deployment', placeholder = 'Select deployment', ...props }, ref) => (
    <Select
      ref={ref}
      label={label}
      placeholder={placeholder}
      searchable
      optionsEndpoint="admin-api/deployments/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  ),
);
DeploymentSelector.displayName = 'DeploymentSelector';
