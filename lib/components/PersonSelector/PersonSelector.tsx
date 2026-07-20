import { forwardRef } from 'react';
import { Select, type SelectProps } from '../Select/Select';

export type PersonSelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for person selection with async search
export const PersonSelector = forwardRef<HTMLButtonElement, PersonSelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Person"
    placeholder="Search people by name"
    searchable
    optionsEndpoint="commerce-api/select-api/people"
    fieldKeys={{ valueKey: 'id', labelKey: 'displayName' }}
    {...props}
  />
));
PersonSelector.displayName = 'PersonSelector';
