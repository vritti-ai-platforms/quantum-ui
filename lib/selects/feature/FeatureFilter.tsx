import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type FeatureFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for feature filtering with async search
export const FeatureFilter = Object.assign(
  forwardRef<HTMLButtonElement, FeatureFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="featureId"
      label="Feature"
      placeholder="Select feature"
      optionsEndpoint="select-api/features"
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      {...props}
    />
  )),
  { displayName: 'FeatureFilter', defaultLabel: 'Feature' },
);
