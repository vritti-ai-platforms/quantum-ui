import { forwardRef } from 'react';
import { Select, type SelectProps, type SelectSingleProps } from '../../components/Select/Select';

export interface RegionSelectorProps extends Omit<SelectSingleProps, 'optionsEndpoint'> {}

// Pre-configured Select for region selection with async search
export const RegionSelector = forwardRef<HTMLButtonElement, RegionSelectorProps>(
  ({ label = 'Region', placeholder = 'Select region', searchable = true, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      {...({
        label,
        placeholder,
        searchable,
        optionsEndpoint: 'admin-api/regions/select',
        fieldKeys: fieldKeys ?? { valueKey: 'id', labelKey: 'name' },
        ...props,
      } as SelectProps)}
    />
  ),
);
RegionSelector.displayName = 'RegionSelector';
