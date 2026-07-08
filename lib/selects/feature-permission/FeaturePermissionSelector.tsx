import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type FeaturePermissionSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for a feature's permissions; scope with params={{ versionId, featureId, excludeId }}.
export const FeaturePermissionSelector = forwardRef<HTMLButtonElement, FeaturePermissionSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Permissions"
    placeholder="Select permissions"
    searchable
    optionsEndpoint="select-api/feature-permissions"
    fieldKeys={{ valueKey: 'id', labelKey: 'label', descriptionKey: 'code' }}
    {...props}
  />
));
FeaturePermissionSelector.displayName = 'FeaturePermissionSelector';
