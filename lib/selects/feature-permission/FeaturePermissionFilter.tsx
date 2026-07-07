import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type FeaturePermissionFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for a feature's permissions — scope with params={{ versionId, featureId }}
export const FeaturePermissionFilter = Object.assign(
  forwardRef<HTMLButtonElement, FeaturePermissionFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="permissionId"
      label="Permission"
      placeholder="Select permission"
      optionsEndpoint="select-api/feature-permissions"
      fieldKeys={{ valueKey: 'id', labelKey: 'label' }}
      {...props}
    />
  )),
  { displayName: 'FeaturePermissionFilter', defaultLabel: 'Permission', defaultName: 'permissionId' },
);
