import { forwardRef } from 'react';
import { SelectFilter, type SelectFilterProps } from '../../components/Select/SelectFilter';

export type LegalEntityFilterProps = Omit<SelectFilterProps, 'optionsEndpoint' | 'name'> & { name?: string };

// Pre-configured SelectFilter for legal entity filtering with async search
export const LegalEntityFilter = Object.assign(
  forwardRef<HTMLButtonElement, LegalEntityFilterProps>((props, ref) => (
    <SelectFilter
      ref={ref}
      name="legalEntityId"
      label="Legal Entity"
      placeholder="Select legal entity"
      optionsEndpoint="select-api/legal-entities"
      fieldKeys={{ valueKey: 'id', labelKey: 'name', descriptionKey: 'code' }}
      {...props}
    />
  )),
  { displayName: 'LegalEntityFilter', defaultLabel: 'Legal Entity', defaultName: 'legalEntityId' },
);
