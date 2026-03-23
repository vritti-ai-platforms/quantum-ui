import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type AppCodeFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for app code filtering with async search
export const AppCodeFilter = Object.assign(
  forwardRef<HTMLButtonElement, AppCodeFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="appCode"
      label="App Code"
      placeholder="Select app code"
      optionsEndpoint="select-api/app-codes"
      fieldKeys={{ valueKey: 'code', labelKey: 'name', descriptionKey: 'code' }}
      {...props}
    />
  )),
  { displayName: 'AppCodeFilter', defaultLabel: 'App Code' },
);
