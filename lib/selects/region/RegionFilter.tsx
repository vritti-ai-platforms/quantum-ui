import { forwardRef } from 'react';
import { SelectFilter } from '../../components/Select/SelectFilter';
import type { FilterResult, SelectValue } from '../../components/Select/types';

export interface RegionFilterProps {
  field?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  value?: FilterResult | SelectValue;
  onChange?: (result: FilterResult | null | undefined) => void;
  operator?: string;
  onOperatorChange?: (operator: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

// Pre-configured SelectFilter for region filtering with async search
export const RegionFilter = Object.assign(
  forwardRef<HTMLButtonElement, RegionFilterProps>(
    ({ field = 'regionId', label = 'Region', placeholder = 'Select region', name, ...props }, ref) => (
      <SelectFilter
        ref={ref}
        field={field}
        name={name ?? field}
        label={label}
        placeholder={placeholder}
        optionsEndpoint="admin-api/regions/select"
        fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
        multiple={false}
        {...props}
      />
    ),
  ),
  { displayName: 'RegionFilter', defaultLabel: 'Region' },
);
