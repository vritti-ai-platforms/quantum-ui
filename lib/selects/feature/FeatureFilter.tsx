import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export interface FeatureFilterProps extends Omit<SelectFilterProps, 'optionsEndpoint'> {}

// Pre-configured SelectFilter for feature filtering with async search
export const FeatureFilter = Object.assign(
  forwardRef<HTMLButtonElement, FeatureFilterProps>(
    ({ field = 'featureId', label = 'Feature', placeholder = 'Select feature', name, fieldKeys, ...props }, ref) => (
      <SelectFilter
        ref={ref}
        {...({
          field,
          name: name ?? field,
          label,
          placeholder,
          optionsEndpoint: 'admin-api/features/select',
          fieldKeys: fieldKeys ?? { valueKey: 'id', labelKey: 'name', descriptionKey: 'code' },
          ...props,
        } as SelectFilterProps)}
      />
    ),
  ),
  { displayName: 'FeatureFilter', defaultLabel: 'Feature' },
);
