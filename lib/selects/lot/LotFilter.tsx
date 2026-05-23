import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type LotFilterParams = { inventoryItemId?: string };

export type LotFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name' | 'params'> & {
  name?: string;
  params?: LotFilterParams;
};

// Pre-configured SelectFilter for inventory item lot filtering
export const LotFilter = Object.assign(
  forwardRef<HTMLButtonElement, LotFilterProps>(({ params, ...props }, ref) => (
    <SelectFilter
      ref={ref}
      name="lotId"
      label="Lot"
      placeholder="Select lot"
      optionsEndpoint="commerce-api/inventory-item-lots/select"
      params={params}
      fieldKeys={{ valueKey: 'id', labelKey: 'lotNumber' }}
      {...props}
    />
  )),
  { displayName: 'LotFilter', defaultLabel: 'Lot', defaultName: 'lotId' },
);
