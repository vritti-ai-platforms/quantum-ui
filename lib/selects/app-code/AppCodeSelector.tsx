import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type AppCodeSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for app code selection with async search
export const AppCodeSelector = forwardRef<HTMLButtonElement, AppCodeSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="App Code"
    placeholder="Select app code"
    searchable
    optionsEndpoint="select-api/app-codes"
    fieldKeys={{ valueKey: 'code', labelKey: 'name', descriptionKey: 'code' }}
    {...props}
  />
));
AppCodeSelector.displayName = 'AppCodeSelector';
