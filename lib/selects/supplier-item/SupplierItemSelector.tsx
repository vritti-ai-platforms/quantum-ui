import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';
import type { SelectOption } from '../../components/Select/types';
import { formatCurrency } from '../../utils/money';

export type SupplierItemSelectorParams = {
  supplierId?: string;
  // Excludes supplier items whose (inventoryItemId, uomId) is already on this PO. Used by the PO add-line dialog.
  excludeOnPurchaseOrderId?: string;
  // Excludes supplier items whose (inventoryItemId, uomId) is already on this goods receipt.
  // Used by the GR add-item dialog when the receipt has no linked PO.
  excludeOnGoodsReceiptId?: string;
};

export type SupplierItemSelectorProps = Omit<SelectProps, 'optionsEndpoint' | 'params'> & {
  params?: SupplierItemSelectorParams;
};

// Pre-configured Select for inventory items offered by suppliers.
// Hits GET /commerce-api/supplier-items/select.
// Pass supplierId via `params` to scope results to a single supplier; otherwise
// results span all suppliers and each option includes a `description` with the
// supplier name.
const DEFAULT_FIELD_KEYS = {
  valueKey: 'id',
  labelKey: 'name',
  descriptionKey: 'tracking',
  groupIdKey: 'categoryId',
  additionalKeys: 'symbol,unitPrice,currencyCode,allowDecimal,inventoryItemId,uomId',
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

// Humanises the `inventory_items.tracking` enum (`quantity` / `lot` / `serial` / `lot_serial`)
// that the backend serves as the option description.
function defaultTransformDescription(value: string): string {
  switch (value) {
    case 'quantity':
      return 'Quantity';
    case 'lot':
      return 'Lot';
    case 'serial':
      return 'Serial';
    case 'lot_serial':
      return 'Lot + Serial';
    default:
      return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export const SupplierItemSelector = forwardRef<HTMLButtonElement, SupplierItemSelectorProps>(
  ({ fieldKeys, params, ...props }, ref) => (
    <Select
      ref={ref}
      label="Supplier Item"
      placeholder="Select supplier item"
      searchable
      optionsEndpoint="commerce-api/supplier-items/select"
      params={params}
      transformLabel={defaultTransformLabel}
      transformDescription={defaultTransformDescription}
      {...props}
      fieldKeys={{ ...DEFAULT_FIELD_KEYS, ...fieldKeys }}
    />
  ),
);
SupplierItemSelector.displayName = 'SupplierItemSelector';
