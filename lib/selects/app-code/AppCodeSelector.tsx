import { forwardRef } from 'react';
import { Select, type SelectProps, type SelectSingleProps } from '../../components/Select/Select';

export interface AppCodeSelectorProps extends Omit<SelectSingleProps, 'optionsEndpoint'> {}

// Pre-configured Select for app code selection with async search
export const AppCodeSelector = forwardRef<HTMLButtonElement, AppCodeSelectorProps>(
  ({ label = 'App Code', placeholder = 'Select app code', searchable = true, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      {...({
        label,
        placeholder,
        searchable,
        optionsEndpoint: 'admin-api/apps/codes/select',
        fieldKeys: fieldKeys ?? { valueKey: 'code', labelKey: 'name', descriptionKey: 'code' },
        ...props,
      } as SelectProps)}
    />
  ),
);
AppCodeSelector.displayName = 'AppCodeSelector';
