import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type DeploymentFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for deployment filtering with async search
export const DeploymentFilter = Object.assign(
  forwardRef<HTMLButtonElement, DeploymentFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="deploymentId"
      label="Deployment"
      placeholder="Select deployment"
      optionsEndpoint="select-api/deployments"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'DeploymentFilter', defaultLabel: 'Deployment', defaultName: 'deploymentId' },
);
