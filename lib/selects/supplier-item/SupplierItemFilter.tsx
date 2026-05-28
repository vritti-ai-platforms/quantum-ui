import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';
import type { SupplierItemSelectorParams } from './SupplierItemSelector';

export type SupplierItemFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name' | 'params'> & {
  name?: string;
  params?: SupplierItemSelectorParams;
};

// Pre-configured SelectFilter for supplier-item filtering. Shares the params shape with
// SupplierItemSelector so the same scoping rules (supplierId / purchaseOrderId / excludeOn*)
// apply identically in tables and forms.
export const SupplierItemFilter = Object.assign(
  forwardRef<HTMLButtonElement, SupplierItemFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="supplierItemId"
      label="Supplier Item"
      placeholder="Select supplier item"
      optionsEndpoint="commerce-api/inventory-items/supplier-items/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name', groupIdKey: 'categoryId' }}
      {...props}
    />
  )),
  { displayName: 'SupplierItemFilter', defaultLabel: 'Supplier Item', defaultName: 'supplierItemId' },
);
