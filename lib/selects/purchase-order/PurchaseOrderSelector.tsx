import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type PurchaseOrderSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for purchase order selection with async search. Default `additionalKeys`
// expose the PO's currency + locked-rate fields so consumers (e.g. GR creation dialog) can decide
// whether to ask the user for an exchange rate at GR creation time.
const DEFAULT_FIELD_KEYS = {
  valueKey: 'id',
  labelKey: 'poNumber',
  additionalKeys: 'currencyCode,exchangeRate,exchangeRateType',
} as const;

export const PurchaseOrderSelector = forwardRef<HTMLButtonElement, PurchaseOrderSelectorProps>(
  ({ fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      label="Purchase Order"
      placeholder="Select purchase order"
      searchable
      clearable
      optionsEndpoint="commerce-api/purchase-orders/select"
      {...props}
      fieldKeys={{ ...DEFAULT_FIELD_KEYS, ...fieldKeys }}
    />
  ),
);
PurchaseOrderSelector.displayName = 'PurchaseOrderSelector';
