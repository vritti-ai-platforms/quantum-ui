import { forwardRef } from 'react';
import { Select, type SelectProps } from '../../components/Select/Select';

export type ModifierGroupSelectorProps = Omit<SelectProps, 'optionsEndpoint'> & {
  catalogId: string;
};

const DEFAULT_FIELD_KEYS = { valueKey: 'id', labelKey: 'name' } as const;

// Pre-configured single-select for modifier groups within a catalog, with async search
export const ModifierGroupSelector = forwardRef<HTMLButtonElement, ModifierGroupSelectorProps>(
  ({ catalogId, fieldKeys, ...props }, ref) => (
    <Select
      ref={ref}
      label="Modifier group"
      placeholder="Select a modifier group"
      searchable
      clearable
      {...props}
      optionsEndpoint={`commerce-api/catalogs/${catalogId}/modifiers/select`}
      fieldKeys={{ ...DEFAULT_FIELD_KEYS, ...fieldKeys }}
    />
  ),
);
ModifierGroupSelector.displayName = 'ModifierGroupSelector';
