import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type PurchaseOrderFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for purchase order filtering with async search
export const PurchaseOrderFilter = forwardRef<HTMLButtonElement, PurchaseOrderFilterProps>((props, ref) => (
  <SelectFilter
    ref={ref}
    name={props.name || 'purchaseOrderId'}
    label={props.label || 'Purchase Order'}
    optionsEndpoint="commerce-api/purchase-orders/select"
    fieldKeys={{ valueKey: 'id', labelKey: 'poNumber' }}
    {...props}
  />
));
PurchaseOrderFilter.displayName = 'PurchaseOrderFilter';
