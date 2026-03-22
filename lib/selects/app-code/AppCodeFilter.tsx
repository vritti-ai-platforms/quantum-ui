import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export interface AppCodeFilterProps extends Omit<SelectFilterProps, 'optionsEndpoint'> {}

// Pre-configured SelectFilter for app code filtering with async search
export const AppCodeFilter = Object.assign(
  forwardRef<HTMLButtonElement, AppCodeFilterProps>(
    ({ field = 'appCode', label = 'App Code', placeholder = 'Select app code', name, fieldKeys, ...props }, ref) => (
      <SelectFilter
        ref={ref}
        {...({
          field,
          name: name ?? field,
          label,
          placeholder,
          optionsEndpoint: 'admin-api/apps/codes/select',
          fieldKeys: fieldKeys ?? { valueKey: 'code', labelKey: 'name', descriptionKey: 'code' },
          ...props,
        } as SelectFilterProps)}
      />
    ),
  ),
  { displayName: 'AppCodeFilter', defaultLabel: 'App Code' },
);
