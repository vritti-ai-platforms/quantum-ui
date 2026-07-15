import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type LegalEntitySelectorProps = Omit<SelectProps, 'optionsEndpoint'>;

// Pre-configured Select for legal entity selection with async search (supports single and multi-select)
export const LegalEntitySelector = forwardRef<HTMLButtonElement, LegalEntitySelectorProps>((props, ref) => (
  <Select
    ref={ref}
    label="Legal Entity"
    placeholder="Select legal entity"
    searchable
    optionsEndpoint="select-api/legal-entities"
    fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
    {...props}
  />
));
LegalEntitySelector.displayName = 'LegalEntitySelector';
