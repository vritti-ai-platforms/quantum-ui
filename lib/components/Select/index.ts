export type { SelectProps } from './Select';
export { Select } from './Select';

export type { SingleSelectProps } from './components/SingleSelect/SingleSelect';
export { SingleSelect } from './components/SingleSelect/SingleSelect';

export type { SingleSelectFilterProps } from './components/SingleSelect/SingleSelectFilter';
export { SingleSelectFilter } from './components/SingleSelect/SingleSelectFilter';

export type { MultiSelectProps } from './components/MultiSelect/MultiSelect';
export { MultiSelect } from './components/MultiSelect/MultiSelect';

export type { MultiSelectFilterProps } from './components/MultiSelect/MultiSelectFilter';
export { MultiSelectFilter } from './components/MultiSelect/MultiSelectFilter';

export type { AsyncSelectState, SelectFieldKeys, SelectGroup, SelectOption, SelectOptionsResponse, SelectValue, SelectVariant } from './types';

export { useSelect } from './hooks/useSelect';
export type { UseSelectProps, UseSelectReturn } from './hooks/useSelect';

// Compound primitives for custom multi-select layouts
import {
  MultiSelectActions as ShadcnMultiSelectActions,
  MultiSelectContent as ShadcnMultiSelectContent,
  MultiSelectEmpty as ShadcnMultiSelectEmpty,
  MultiSelectGroup as ShadcnMultiSelectGroup,
  MultiSelectGroupLabel as ShadcnMultiSelectGroupLabel,
  MultiSelectList as ShadcnMultiSelectList,
  MultiSelectRoot as ShadcnMultiSelectRoot,
  MultiSelectRow as ShadcnMultiSelectRow,
  MultiSelectSearch as ShadcnMultiSelectSearch,
  MultiSelectTrigger as ShadcnMultiSelectTrigger,
} from '../../../shadcn/shadcnMultiSelect';

export const MultiSelectRoot = ShadcnMultiSelectRoot;
export const MultiSelectTrigger = ShadcnMultiSelectTrigger;
export const MultiSelectContent = ShadcnMultiSelectContent;
export const MultiSelectSearch = ShadcnMultiSelectSearch;
export const MultiSelectActions = ShadcnMultiSelectActions;
export const MultiSelectGroup = ShadcnMultiSelectGroup;
export const MultiSelectGroupLabel = ShadcnMultiSelectGroupLabel;
export const MultiSelectList = ShadcnMultiSelectList;
export const MultiSelectRow = ShadcnMultiSelectRow;
export const MultiSelectEmpty = ShadcnMultiSelectEmpty;

export type {
  MultiSelectActionsProps,
  MultiSelectContentProps,
  MultiSelectEmptyProps,
  MultiSelectGroupLabelProps,
  MultiSelectGroupProps,
  MultiSelectListProps,
  MultiSelectRootProps,
  MultiSelectRowProps,
  MultiSelectSearchProps,
  MultiSelectTriggerProps,
} from '../../../shadcn/shadcnMultiSelect';

// Compound primitives for custom single-select layouts
import {
  SingleSelectClear as ShadcnSingleSelectClear,
  SingleSelectContent as ShadcnSingleSelectContent,
  SingleSelectEmpty as ShadcnSingleSelectEmpty,
  SingleSelectGroup as ShadcnSingleSelectGroup,
  SingleSelectGroupLabel as ShadcnSingleSelectGroupLabel,
  SingleSelectList as ShadcnSingleSelectList,
  SingleSelectRoot as ShadcnSingleSelectRoot,
  SingleSelectRow as ShadcnSingleSelectRow,
  SingleSelectSearch as ShadcnSingleSelectSearch,
  SingleSelectTrigger as ShadcnSingleSelectTrigger,
} from '../../../shadcn/shadcnSingleSelect';

export const SingleSelectRoot = ShadcnSingleSelectRoot;
export const SingleSelectTrigger = ShadcnSingleSelectTrigger;
export const SingleSelectContent = ShadcnSingleSelectContent;
export const SingleSelectSearch = ShadcnSingleSelectSearch;
export const SingleSelectClear = ShadcnSingleSelectClear;
export const SingleSelectGroup = ShadcnSingleSelectGroup;
export const SingleSelectGroupLabel = ShadcnSingleSelectGroupLabel;
export const SingleSelectList = ShadcnSingleSelectList;
export const SingleSelectRow = ShadcnSingleSelectRow;
export const SingleSelectEmpty = ShadcnSingleSelectEmpty;

export type {
  SingleSelectClearProps,
  SingleSelectContentProps,
  SingleSelectEmptyProps,
  SingleSelectGroupLabelProps,
  SingleSelectGroupProps,
  SingleSelectListProps,
  SingleSelectRootProps,
  SingleSelectRowProps,
  SingleSelectSearchProps,
  SingleSelectTriggerProps,
} from '../../../shadcn/shadcnSingleSelect';
