import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type TaxGroupFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for tax-group filtering with async search
export const TaxGroupFilter = Object.assign(
  forwardRef<HTMLButtonElement, TaxGroupFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="taxGroupId"
      label="Tax Group"
      placeholder="Select tax group"
      optionsEndpoint="commerce-api/tax-groups/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'TaxGroupFilter', defaultLabel: 'Tax Group', defaultName: 'taxGroupId' },
);
