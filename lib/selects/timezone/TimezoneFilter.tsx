import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';
import { TIMEZONES } from './timezones';

export type TimezoneFilterProps = Omit<SelectFilterProps, 'options' | 'name'> & { name?: string };

// Pre-configured SelectFilter for timezone filtering with static local options
export const TimezoneFilter = Object.assign(
  forwardRef<HTMLButtonElement, TimezoneFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="timezone"
      label="Timezone"
      placeholder="Select timezone"
      options={TIMEZONES}
      {...props}
    />
  )),
  { displayName: 'TimezoneFilter', defaultLabel: 'Timezone' },
);
