import { deepEqual } from 'fast-equals';
import type { FilterCondition } from '../types/conditions';

// Fills every default the context is missing. When the view is opening, a reset-on-open default also replaces whatever
// value was saved for its field.
export function withDefaults(
  context: FilterCondition[],
  defaults: FilterCondition[],
  { isOpening = false, resetOnOpen = [] }: { isOpening?: boolean; resetOnOpen?: string[] } = {},
): FilterCondition[] {
  let next = context;
  for (const defaultCondition of defaults) {
    const current = next.find((condition) => condition.field === defaultCondition.field);
    const isMissing = !current;
    const resetsOnOpen =
      isOpening && resetOnOpen.includes(defaultCondition.field) && !deepEqual(current, defaultCondition);
    if (isMissing || resetsOnOpen) {
      next = [...next.filter((condition) => condition.field !== defaultCondition.field), defaultCondition];
    }
  }
  return next;
}

// Sets (or clears, with null) one field, and clears the fields that depend on it
export function withChange(
  context: FilterCondition[],
  field: string,
  condition: FilterCondition | null,
  dependentFields: string[],
): FilterCondition[] {
  const cleared = new Set([field, ...dependentFields]);
  const kept = context.filter((existing) => !cleared.has(existing.field));
  return condition ? [...kept, condition] : kept;
}

// The single value set on a field; undefined when the field is absent or holds a list
export function readValue(context: FilterCondition[], field: string): string | undefined {
  const value = context.find((condition) => condition.field === field)?.value;
  return typeof value === 'string' ? value : undefined;
}

// Every value set on a field: a list as it is, a single value as a list of one, an absent field as none
export function readValues(context: FilterCondition[], field: string): string[] {
  const value = context.find((condition) => condition.field === field)?.value;
  if (Array.isArray(value)) return value.map(String);
  return typeof value === 'string' && value ? [value] : [];
}

// Whether a context has a value for every default's field
export function hasEveryDefault(context: FilterCondition[], defaults: FilterCondition[]): boolean {
  return defaults.every((defaultCondition) => context.some((condition) => condition.field === defaultCondition.field));
}

// Whether a context holds exactly the default on every reset-on-open field
export function holdsResetDefaults(
  context: FilterCondition[],
  defaults: FilterCondition[],
  resetOnOpen: string[],
): boolean {
  return defaults
    .filter((defaultCondition) => resetOnOpen.includes(defaultCondition.field))
    .every((defaultCondition) =>
      deepEqual(
        context.find((condition) => condition.field === defaultCondition.field),
        defaultCondition,
      ),
    );
}
