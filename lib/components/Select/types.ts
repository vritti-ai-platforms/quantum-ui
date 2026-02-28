export type SelectValue = string | number | boolean;

export interface SelectOption {
  value: SelectValue;
  label: string;
  description?: string;
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
  setSearchQuery: (q: string) => void;
  sentinelRef: (node?: Element | null) => void;
}

export type SelectVariant = 'default' | 'filter';

export interface SelectFieldKeys {
  valueKey?: string;
  labelKey?: string;
  descriptionKey?: string;
  groupIdKey?: string;
}
