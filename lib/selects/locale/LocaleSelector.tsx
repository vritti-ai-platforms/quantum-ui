import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';
import { LOCALES } from './locales';

export type LocaleSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for locale selection with local searchable options
export const LocaleSelector = forwardRef<HTMLButtonElement, LocaleSelectorProps>((props, ref) => (
  <Select ref={ref} label="Language" placeholder="Select language" searchable options={LOCALES} {...props} />
));
LocaleSelector.displayName = 'LocaleSelector';
