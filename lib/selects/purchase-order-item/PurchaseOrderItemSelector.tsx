import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';
import type { SelectOption } from '../../components/Select/types';
import { formatCurrency } from '../../utils/money';

export type PurchaseOrderItemSelectorParams = {
  // The PO whose lines drive the select. Required.
  purchaseOrderId: string;
  // Excludes PO lines whose (inventoryItemId, uomId) is already on this goods receipt.
  excludeOnGoodsReceiptId?: string;
};

export type PurchaseOrderItemSelectorProps = Omit<SelectProps, 'optionsEndpoint' | 'params'> & {
  params: PurchaseOrderItemSelectorParams;
};

// Pre-configured Select for purchase-order line items. Hits GET /commerce-api/purchase-order-items/select.
// The option `additionals` carries (inventoryItemId, uomId, unitPrice, currencyCode, allowDecimal,
// symbol, orderedQuantity, receivedQuantity) so the consumer can submit a payload keyed on
// (inventoryItemId, uomId) directly without a lookup hop.
const DEFAULT_FIELD_KEYS = {
  valueKey: 'id',
  labelKey: 'name',
  descriptionKey: 'tracking',
  groupIdKey: 'categoryId',
  additionalKeys: 'symbol,inventoryItemId,uomId,unitPrice,currencyCode,allowDecimal,orderedQuantity,receivedQuantity',
} as const;

function defaultTransformLabel(label: string, option: SelectOption): string {
  const baseLabel = label.replace(/\s-\s[^-]+$/, '');
  const uom = typeof option.additionals?.symbol === 'string' ? option.additionals.symbol.trim() : '';
  const rawPrice = option.additionals?.unitPrice;
  const currencyCode = typeof option.additionals?.currencyCode === 'string' ? option.additionals.currencyCode : null;
  const unitPrice = rawPrice != null && currencyCode != null ? formatCurrency(String(rawPrice), currencyCode) : null;
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

export const PurchaseOrderItemSelector = forwardRef<HTMLButtonElement, PurchaseOrderItemSelectorProps>(
  ({ fieldKeys, params, ...props }, ref) => (
    <Select
      ref={ref}
      label="Purchase Order Item"
      placeholder="Select item from purchase order"
      searchable
      optionsEndpoint="commerce-api/purchase-order-items/select"
      params={params}
      transformLabel={defaultTransformLabel}
      transformDescription={defaultTransformDescription}
      {...props}
      fieldKeys={{ ...DEFAULT_FIELD_KEYS, ...fieldKeys }}
    />
  ),
);
PurchaseOrderItemSelector.displayName = 'PurchaseOrderItemSelector';
