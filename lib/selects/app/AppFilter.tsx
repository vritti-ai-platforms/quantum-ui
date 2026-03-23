import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type AppFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for app filtering with async search
export const AppFilter = Object.assign(
  forwardRef<HTMLButtonElement, AppFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="appId"
      label="App"
      placeholder="Select app"
      optionsEndpoint="select-api/apps"
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      {...props}
    />
  )),
  { displayName: 'AppFilter', defaultLabel: 'App' },
);
