import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type BomSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for BOM selection with async search
export const BomSelector = forwardRef<HTMLButtonElement, BomSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Bill of Materials"
    placeholder="Select BOM"
    searchable
    optionsEndpoint="commerce-api/bom/select"
    fieldKeys={{ valueKey: 'id', labelKey: 'name' }}
    {...props}
  />
));
BomSelector.displayName = 'BomSelector';
