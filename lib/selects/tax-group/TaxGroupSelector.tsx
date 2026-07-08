import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type TaxGroupSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for tax-group selection (id → name); BU-scoped server-side via RLS
export const TaxGroupSelector = forwardRef<HTMLButtonElement, TaxGroupSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Tax Group"
    placeholder="Select tax group"
    searchable
    optionsEndpoint="commerce-api/select-api/tax-groups"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
TaxGroupSelector.displayName = 'TaxGroupSelector';
