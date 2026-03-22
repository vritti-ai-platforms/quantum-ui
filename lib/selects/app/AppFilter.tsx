import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export interface AppFilterProps extends Omit<SelectFilterProps, 'optionsEndpoint'> {}

// Pre-configured SelectFilter for app filtering with async search
export const AppFilter = Object.assign(
  forwardRef<HTMLButtonElement, AppFilterProps>(
    ({ field = 'appId', label = 'App', placeholder = 'Select app', name, fieldKeys, ...props }, ref) => (
      <SelectFilter
        ref={ref}
        {...({
          field,
          name: name ?? field,
          label,
          placeholder,
          optionsEndpoint: 'admin-api/apps/select',
          fieldKeys: fieldKeys ?? { valueKey: 'id', labelKey: 'name', descriptionKey: 'code' },
          ...props,
        } as SelectFilterProps)}
      />
    ),
  ),
  { displayName: 'AppFilter', defaultLabel: 'App' },
);
