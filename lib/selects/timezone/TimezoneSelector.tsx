import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';
import { TIMEZONES } from './timezones';

export type TimezoneSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for timezone selection with runtime-supported IANA options
export const TimezoneSelector = forwardRef<HTMLButtonElement, TimezoneSelectorProps>((props, ref) => (
  <Select ref={ref} label="Timezone" placeholder="Select timezone" searchable options={TIMEZONES} {...props} />
));
TimezoneSelector.displayName = 'TimezoneSelector';
