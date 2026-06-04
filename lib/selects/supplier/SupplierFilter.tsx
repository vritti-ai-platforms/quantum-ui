import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type SupplierFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for supplier filtering with async search
export const SupplierFilter = Object.assign(
  forwardRef<HTMLButtonElement, SupplierFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="supplierId"
      label="Supplier"
      placeholder="Select supplier"
      optionsEndpoint="commerce-api/suppliers/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'SupplierFilter', defaultLabel: 'Supplier', defaultName: 'supplierId' },
);
