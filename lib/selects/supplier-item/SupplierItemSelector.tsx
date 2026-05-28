import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';
import type { SelectOption } from '../../components/Select/types';
import { formatCurrency } from '../../utils/money';

export type SupplierItemSelectorParams = {
  supplierId?: string;
  // Restricts to supplier items whose (inventoryItemId, uomId) matches a line on this PO. Used by GR
  // and shared with any SupplierItem filter component for symmetry.
  purchaseOrderId?: string;
  // Excludes supplier items whose (inventoryItemId, uomId) is already on this PO. Used by the PO add-line dialog.
  excludeOnPurchaseOrderId?: string;
  // Excludes supplier items whose (inventoryItemId, uomId) is already on this goods receipt.
  excludeOnGoodsReceiptId?: string;
};

export type SupplierItemSelectorProps = Omit<SelectProps, 'optionsEndpoint' | 'params'> & {
  params?: SupplierItemSelectorParams;
};

// Pre-configured Select for inventory items offered by suppliers.
// Hits GET /commerce-api/inventory-items/supplier-items/select.
// Pass supplierId via `params` to scope results to a single supplier; otherwise
// results span all suppliers and each option includes a `description` with the
// supplier name. Pass purchaseOrderId via `params` to exclude items whose
// every supplier UOM is already on that PO.
const DEFAULT_FIELD_KEYS = {
  valueKey: 'id',
  labelKey: 'name',
  groupIdKey: 'categoryId',
  additionalKeys: 'symbol,unitPrice,currencyCode,allowDecimal',
} as const;

function defaultTransformLabel(label: string, option: SelectOption): string {
  const baseLabel = label.replace(/\s-\s[^-]+$/, '');
  const uom = typeof option.additionals?.symbol === 'string' ? option.additionals.symbol.trim() : '';
  const rawPrice = option.additionals?.unitPrice;
  const currencyCode =
    typeof option.additionals?.currencyCode === 'string' ? option.additionals.currencyCode : null;
  const unitPrice =
    rawPrice != null && currencyCode != null ? formatCurrency(String(rawPrice), currencyCode) : null;
  if (unitPrice && uom) return `${baseLabel} - ${unitPrice}/${uom}`;
  if (unitPrice) return `${baseLabel} - ${unitPrice}`;
  if (uom) return `${baseLabel} (${uom})`;
  return baseLabel;
}

export const SupplierItemSelector = forwardRef<HTMLButtonElement, SupplierItemSelectorProps>(
  ({ fieldKeys, params, ...props }, ref) => (
    <Select
      ref={ref}
      label="Supplier Item"
      placeholder="Select supplier item"
      searchable
      optionsEndpoint="commerce-api/inventory-items/supplier-items/select"
      params={params}
      transformLabel={defaultTransformLabel}
      {...props}
      fieldKeys={{ ...DEFAULT_FIELD_KEYS, ...fieldKeys }}
    />
  ),
);
SupplierItemSelector.displayName = 'SupplierItemSelector';
