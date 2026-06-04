import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type FeatureSelectorProps = SelectProps;

// Pre-configured Select for feature selection with async search
export const FeatureSelector = forwardRef<HTMLButtonElement, FeatureSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Feature"
    placeholder="Select feature"
    searchable
    optionsEndpoint="select-api/features"
    fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
    {...props}
  />
));
FeatureSelector.displayName = 'FeatureSelector';
