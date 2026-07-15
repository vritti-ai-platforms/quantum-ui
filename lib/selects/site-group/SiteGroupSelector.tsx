import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type SiteGroupSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for site group selection with async search (supports single and multi-select)
export const SiteGroupSelector = forwardRef<HTMLButtonElement, SiteGroupSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Site Group"
    placeholder="Select site group"
    searchable
    optionsEndpoint="select-api/site-groups"
    fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
    {...props}
  />
));
SiteGroupSelector.displayName = 'SiteGroupSelector';
