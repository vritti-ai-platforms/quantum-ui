import { forwardRef } from 'react';
import { Select, type SelectProps, type SelectSingleProps } from '../../components/Select/Select';

export interface AppSelectorProps extends Omit<SelectSingleProps, 'optionsEndpoint'> {}

// Pre-configured Select for app selection with async search
export const AppSelector = forwardRef<HTMLButtonElement, AppSelectorProps>(
  ({ label = 'App', placeholder = 'Select app', searchable = true, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      {...({
        label,
        placeholder,
        searchable,
        optionsEndpoint: 'admin-api/apps/select',
        fieldKeys: fieldKeys ?? { valueKey: 'id', labelKey: 'name', descriptionKey: 'code' },
        ...props,
      } as SelectProps)}
    />
  ),
);
AppSelector.displayName = 'AppSelector';
