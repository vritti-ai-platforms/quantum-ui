import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type DeploymentSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for deployment selection with async search
export const DeploymentSelector = forwardRef<HTMLButtonElement, DeploymentSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Deployment"
    placeholder="Select deployment"
    searchable
    optionsEndpoint="select-api/deployments"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
DeploymentSelector.displayName = 'DeploymentSelector';
