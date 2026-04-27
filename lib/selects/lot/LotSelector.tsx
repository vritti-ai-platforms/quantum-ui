import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type LotSelectorProps = Omit<SelectProps, 'optionsEndpoint' | 'params'> & {
  inventoryItemId: string;
};

// Pre-configured Select for inventory item lot selection (scoped to a single item)
export const LotSelector = forwardRef<HTMLButtonElement, LotSelectorProps>(({ inventoryItemId, ...props }, ref) => (
  <Select
    ref={ref}
    label="Lot"
    placeholder="Select or type a lot number"
    searchable
    optionsEndpoint="commerce-api/inventory-item-lots/select"
    params={{ inventoryItemId }}
    fieldKeys={{ valueKey: 'id', labelKey: 'lotNumber' }}
    {...props}
  />
));
LotSelector.displayName = 'LotSelector';
