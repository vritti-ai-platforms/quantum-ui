import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type SupplierItemSelectorProps = Omit<SelectProps, 'optionsEndpoint'> & {
  supplierId: string;
};

// Pre-configured Select for inventory items offered by a specific supplier.
// Hits GET /commerce-api/suppliers/:supplierId/items/select.
// Pass purchaseOrderId via `params` to exclude items whose every supplier UOM
// is already on that PO.
const DEFAULT_FIELD_KEYS = { valueKey: 'id', labelKey: 'name', groupIdKey: 'categoryId' } as const;

export const SupplierItemSelector = forwardRef<HTMLButtonElement, SupplierItemSelectorProps>(
  ({ supplierId, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      label="Supplier Item"
      placeholder="Select supplier item"
      searchable
      optionsEndpoint={`commerce-api/suppliers/${supplierId}/items/select`}
      {...props}
      fieldKeys={{ ...DEFAULT_FIELD_KEYS, ...fieldKeys }}
    />
  ),
);
SupplierItemSelector.displayName = 'SupplierItemSelector';
