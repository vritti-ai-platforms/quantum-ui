import { forwardRef } from 'react';
import { Select, type SelectProps, type SelectSingleProps } from '../../components/Select/Select';

export interface DeploymentSelectorProps extends Omit<SelectSingleProps, 'optionsEndpoint'> {}

// Pre-configured Select for deployment selection with async search
export const DeploymentSelector = forwardRef<HTMLButtonElement, DeploymentSelectorProps>(
  ({ label = 'Deployment', placeholder = 'Select deployment', searchable = true, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      {...({
        label,
        placeholder,
        searchable,
        optionsEndpoint: 'admin-api/deployments/select',
        fieldKeys: fieldKeys ?? { valueKey: 'id', labelKey: 'name' },
        ...props,
      } as SelectProps)}
    />
  ),
);
DeploymentSelector.displayName = 'DeploymentSelector';
