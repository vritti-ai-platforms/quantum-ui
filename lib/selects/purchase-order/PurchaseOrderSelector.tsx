import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type PurchaseOrderSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for purchase order selection with async search
export const PurchaseOrderSelector = forwardRef<HTMLButtonElement, PurchaseOrderSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Purchase Order"
    placeholder="Select purchase order"
    searchable
    clearable
    optionsEndpoint="commerce-api/purchase-orders/select"
    fieldKeys={{ valueKey: 'id', labelKey: 'poNumber' }}
    {...props}
  />
));
PurchaseOrderSelector.displayName = 'PurchaseOrderSelector';
