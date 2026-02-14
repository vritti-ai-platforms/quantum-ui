export type { SelectProps } from './Select';
export { Select } from './Select';

export type { SingleSelectProps } from './components/SingleSelect/SingleSelect';
export { SingleSelect } from './components/SingleSelect/SingleSelect';

export type { MultiSelectProps } from './components/MultiSelect/MultiSelect';
export { MultiSelect } from './components/MultiSelect/MultiSelect';

export type { SelectOption } from './types';

// Compound primitives for custom multi-select layouts
import {
  MultiSelectActions as ShadcnMultiSelectActions,
  MultiSelectContent as ShadcnMultiSelectContent,
  MultiSelectEmpty as ShadcnMultiSelectEmpty,
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
export const MultiSelectList = ShadcnMultiSelectList;
export const MultiSelectRow = ShadcnMultiSelectRow;
export const MultiSelectEmpty = ShadcnMultiSelectEmpty;

export type {
  MultiSelectActionsProps,
  MultiSelectContentProps,
  MultiSelectEmptyProps,
  MultiSelectListProps,
  MultiSelectRootProps,
  MultiSelectRowProps,
  MultiSelectSearchProps,
  MultiSelectTriggerProps,
} from '../../../shadcn/shadcnMultiSelect';
