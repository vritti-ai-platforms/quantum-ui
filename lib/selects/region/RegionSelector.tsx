import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type RegionSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for region selection with async search
export const RegionSelector = forwardRef<HTMLButtonElement, RegionSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Region"
    placeholder="Select region"
    searchable
    optionsEndpoint="select-api/regions"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
RegionSelector.displayName = 'RegionSelector';
