import { forwardRef } from 'react';
import { SelectFilter } from '../../components/Select/SelectFilter';
import type { FilterResult, SelectValue } from '../../components/Select/types';

export interface DeploymentFilterProps {
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

// Pre-configured SelectFilter for deployment filtering with async search
export const DeploymentFilter = Object.assign(
  forwardRef<HTMLButtonElement, DeploymentFilterProps>(
    ({ field = 'deploymentId', label = 'Deployment', placeholder = 'Select deployment', name, ...props }, ref) => (
      <SelectFilter
        ref={ref}
        field={field}
        name={name ?? field}
        label={label}
        placeholder={placeholder}
        optionsEndpoint="admin-api/deployments/select"
        fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
        multiple={false}
        {...props}
      />
    ),
  ),
  { displayName: 'DeploymentFilter', defaultLabel: 'Deployment' },
);
