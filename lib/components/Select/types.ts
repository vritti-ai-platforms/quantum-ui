export type SelectValue = string | number | boolean | null;

export type SelectAdditionalValue = SelectValue | object;

export interface SelectOption {
  value: SelectValue;
  label: string;
  description?: string;
  additionals?: Record<string, SelectAdditionalValue>;
  disabled?: boolean;
  groupId?: string | number;
}

export interface SelectGroup {
  id: string | number;
  name: string;
}

export interface SelectOptionsResponse {
  options: SelectOption[];
  groups?: SelectGroup[];
  hasMore: boolean;
}

export interface AsyncSelectState {
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  searchQuery: string;
  /** The options don't answer the typed search yet — it waits out the debounce or is being fetched */
  searching: boolean;
  setSearchQuery: (q: string) => void;
  sentinelRef: (node?: Element | null) => void;
}

export type FilterOperator = string;

export interface FilterResult {
  field: string;
  operator: FilterOperator;
  value: string | number | string[];
}

export interface SelectFieldKeys {
  valueKey?: string;
  labelKey?: string;
  descriptionKey?: string;
  additionalKeys?: string;
  groupIdKey?: string;
}
