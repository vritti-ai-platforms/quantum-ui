import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type BomFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for BOM filtering with async search
export const BomFilter = Object.assign(
  forwardRef<HTMLButtonElement, BomFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="bomId"
      label="Bill of Materials"
      placeholder="Select BOM"
      optionsEndpoint="commerce-api/bom/select"
      fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
      {...props}
    />
  )),
  { displayName: 'BomFilter', defaultLabel: 'Bill of Materials' },
);
