import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type InventoryItemFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for inventory item filtering with async search
export const InventoryItemFilter = Object.assign(
  forwardRef<HTMLButtonElement, InventoryItemFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="inventoryItemId"
      label="Inventory Item"
      placeholder="Select inventory item"
      optionsEndpoint="commerce-api/inventory-items/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'InventoryItemFilter', defaultLabel: 'Inventory Item', defaultName: 'inventoryItemId' },
);
