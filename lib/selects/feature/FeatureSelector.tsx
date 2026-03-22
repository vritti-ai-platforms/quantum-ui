import { forwardRef } from 'react';
import { Select, type SelectProps, type SelectSingleProps } from '../../components/Select/Select';

export type FeatureSelectorProps = SelectProps;

// Pre-configured Select for feature selection with async search
export const FeatureSelector = forwardRef<HTMLButtonElement, FeatureSelectorProps>(
  (props, ref) => {
    const {
      label = 'Feature',
      placeholder = 'Select feature',
      searchable = true,
      fieldKeys,
      optionsEndpoint,
      ...rest
    } = props as SelectProps & { fieldKeys?: any; optionsEndpoint?: string };

    return (
      <Select
        ref={ref}
        {...({
          label,
          placeholder,
          searchable,
          optionsEndpoint: optionsEndpoint ?? 'admin-api/features/select',
          fieldKeys: fieldKeys ?? { valueKey: 'id', labelKey: 'name', descriptionKey: 'code' },
          ...rest,
        } as SelectProps)}
      />
    );
  },
);
FeatureSelector.displayName = 'FeatureSelector';
