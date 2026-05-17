import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type UomSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for unit of measure selection with async search
export const UomSelector = forwardRef<HTMLButtonElement, UomSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Unit of Measure"
    placeholder="Select unit"
    searchable
    optionsEndpoint="commerce-api/uom/select"
    fieldKeys={{ valueKey: 'id', labelKey: 'name', additionalKeys: 'allowDecimal' }}
    {...props}
  />
));
UomSelector.displayName = 'UomSelector';
