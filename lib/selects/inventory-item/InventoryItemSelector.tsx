import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type InventoryItemSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for inventory item selection with async search
export const InventoryItemSelector = forwardRef<HTMLButtonElement, InventoryItemSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Inventory Item"
    placeholder="Select inventory item"
    searchable
    optionsEndpoint="commerce-api/inventory-items/select"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
InventoryItemSelector.displayName = 'InventoryItemSelector';
