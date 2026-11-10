export type StringOperator = 'equals' | 'notEquals' | 'contains' | 'notContains';
export type NumberOperator = 'equals' | 'notEquals' | 'gt' | 'gte' | 'lt' | 'lte';
export type SelectOperator = 'equals' | 'notEquals';
export type MultiSelectOperator = 'isAnyOf' | 'isNotAnyOf';
// A range filter's value is a `[from, to]` pair, both ends inclusive
export type RangeOperator = 'between';
export type FilterOperator = StringOperator | NumberOperator | SelectOperator | MultiSelectOperator | RangeOperator;

// A money amount a filter matches on: the currency and a major-unit amount string
export interface FilterCurrencyValue {
  currency: string;
  value: string;
}

export type FilterValue = string | number | string[] | FilterCurrencyValue;

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
}

export interface SortCondition {
  field: string;
  direction: 'asc' | 'desc';
}

export type SearchState = { columnId: string; value: string } | null;
