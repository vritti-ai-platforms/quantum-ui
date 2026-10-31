import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';
import type { DistributiveOmit } from '../../types/utility';
import { LOCALES } from './locales';

export type LocaleFilterProps = DistributiveOmit<SelectFilterProps, 'options' | 'name'> & { name?: string };

// Pre-configured SelectFilter for locale filtering with static local options
export const LocaleFilter = Object.assign(
  forwardRef<HTMLButtonElement, LocaleFilterProps>((props, ref) => (
    <SelectFilter ref={ref} name="locale" label="Language" placeholder="Select language" options={LOCALES} {...props} />
  )),
  { displayName: 'LocaleFilter', defaultLabel: 'Language', defaultName: 'locale' },
);
