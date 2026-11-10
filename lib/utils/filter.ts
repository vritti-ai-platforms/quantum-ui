import type { FilterCurrencyValue, FilterOperator, FilterValue } from '../types/conditions';

type Comparable = string | number | FilterCurrencyValue;
export type Condition<O extends FilterOperator, V extends FilterValue> = { field: string; operator: O; value: V };

function condition<O extends FilterOperator, V extends FilterValue>(
  field: string,
  operator: O,
  value: V,
): Condition<O, V> {
  return { field, operator, value };
}

// Builds one FilterCondition for a field — one method per operator, named like the operator
export function filter(field: string) {
  return {
    equals: (value: Comparable) => condition(field, 'equals', value),
    notEquals: (value: Comparable) => condition(field, 'notEquals', value),
    contains: (value: string) => condition(field, 'contains', value),
    notContains: (value: string) => condition(field, 'notContains', value),
    gt: (value: Comparable) => condition(field, 'gt', value),
    gte: (value: Comparable) => condition(field, 'gte', value),
    lt: (value: Comparable) => condition(field, 'lt', value),
    lte: (value: Comparable) => condition(field, 'lte', value),
    isAnyOf: (values: string[]) => condition(field, 'isAnyOf', values),
    isNotAnyOf: (values: string[]) => condition(field, 'isNotAnyOf', values),
    between: (from: string, to: string) => condition(field, 'between', [from, to] as [string, string]),
  };
}
