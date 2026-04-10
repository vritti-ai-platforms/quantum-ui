import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type SupplierSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for supplier selection with async search
export const SupplierSelector = forwardRef<HTMLButtonElement, SupplierSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Supplier"
    placeholder="Select supplier"
    searchable
    optionsEndpoint="commerce-api/suppliers/select"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
SupplierSelector.displayName = 'SupplierSelector';
