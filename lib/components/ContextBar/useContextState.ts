import { useQuery, useQueryClient } from '@tanstack/react-query';
import { deepEqual } from 'fast-equals';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getContextState } from '../../services/context-states.service';
import type { FilterCondition } from '../../types/conditions';
import { readValue, readValues, withChange, withDefaults } from '../../utils/conditions';
import type { AnySelectOption } from '../Select/types';
import { toast } from '../Sonner/toast';
import { type ContextSave, useContextSave } from './useContextSave';
import { useSettlingFields } from './useSettlingFields';

interface UseContextStateOptions {
  /** Where the context is saved; without one the context lives only in memory */
  slug?: string;
  /** Values the context always has — filled whenever a field is missing */
  defaultContext?: FilterCondition[];
  /** Values an in-memory context (no slug) starts with, which can still be changed or cleared */
  initialContext?: FilterCondition[];
  /** Fields whose default replaces the saved value every time the view opens */
  resetOnOpen?: string[];
  /** Fields cleared when another field changes, e.g. `{ site: ['supplierIds'] }` */
  resets?: Record<string, string[]>;
  /** Called after a change is saved — the view refetches its data here */
  onStatePush?: () => unknown;
  /** Called with each field a change sets or clears, as the change is shown */
  onChange?: (field: string, condition: FilterCondition | null) => void;
}

export interface ContextStateInstance<TOption extends AnySelectOption = AnySelectOption> {
  context: FilterCondition[];
  contextValue: (field: string) => string | undefined;
  contextValues: (field: string) => string[];
  setContext: (field: string, condition: FilterCondition | null) => void;
  required: ReadonlySet<string>;
  isLoaded: boolean;
  isSaving: boolean;
  /** The context isn't final yet: it is loading, a change is saving, or a control is still settling its value (picking
   * a first option, checking a held one). A view holds its data request until it settles. */
  isSettling: boolean;
  markFieldSettling: (field: string, settling: boolean) => void;
  /** The options a Select given this context holds, in the order of its value — picked, looked up, or looked up again
   * under new filters; in memory only, never saved */
  selectedOptions: TOption[];
  /** The first of them, for a single select */
  selectedOption: TOption | null;
  setSelectedOptions: (options: TOption[]) => void;
}

// The context a Select reports its options to: any context whose options the select's options are — a page may keep a
// narrower view of them (the fields it reads) than the select's own
export type SelectContextInstance<TOption extends AnySelectOption> = Omit<
  ContextStateInstance,
  'selectedOptions' | 'selectedOption' | 'setSelectedOptions'
> & {
  selectedOptions: readonly AnySelectOption[];
  setSelectedOptions: (options: TOption[]) => void;
};

const NO_CONDITIONS: FilterCondition[] = [];
const NO_OPTIONS: AnySelectOption[] = [];
const NO_FIELDS: string[] = [];
const NO_RESETS: Record<string, string[]> = {};

function contextQueryKey(slug: string | undefined) {
  return ['context-state', slug ?? ''] as const;
}

// A view's context bar: the saved conditions for this visit, with defaults filled in. Every change is shown at once
// and saved in the background. TOption types the options the context's Select holds (selectedOptions)
export function useContextState<TOption extends AnySelectOption = AnySelectOption>({
  slug,
  defaultContext,
  initialContext,
  resetOnOpen = NO_FIELDS,
  resets = NO_RESETS,
  onStatePush,
  onChange,
}: UseContextStateOptions): ContextStateInstance<TOption> {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => contextQueryKey(slug), [slug]);

  // Read when the view opens (and after a failed save) — never in the background, where a read landing mid-save would
  // bring the old context back
  const {
    data: stored,
    isError: readFailed,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => getContextState(slug ?? ''),
    enabled: slug != null,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // The defaults, kept stable while their contents don't change
  const nextDefaults = defaultContext ?? NO_CONDITIONS;
  const [defaults, setDefaults] = useState(nextDefaults);
  if (!deepEqual(defaults, nextDefaults)) setDefaults(nextDefaults);

  // The context on screen, held per slug so switching views never shows another view's context
  const [held, setHeld] = useState<{ slug: string | undefined; context: FilterCondition[] } | null>(null);
  const hasHeld = held != null && held.slug === slug;
  const context = hasHeld ? held.context : NO_CONDITIONS;

  const onStatePushRef = useRef(onStatePush);
  onStatePushRef.current = onStatePush;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Read once, as the context starts
  const initialRef = useRef(initialContext ?? NO_CONDITIONS);

  const { save, isSaving } = useContextSave({
    onSaved: ({ slug: savedSlug, context: savedContext }: ContextSave) => {
      queryClient.setQueryData(contextQueryKey(savedSlug), savedContext);
      return onStatePushRef.current?.();
    },
    onFailed: () => {
      toast.error("Couldn't save the change", { description: 'The view keeps what was saved before.' });
      return refetch();
    },
  });

  // Saves a context: it becomes the cached read at once, so a read already on its way can't bring the old one back
  const persist = useCallback(
    (next: FilterCondition[]) => {
      if (slug == null) return;
      void queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, next);
      save(slug, next);
    },
    [slug, queryClient, queryKey, save],
  );

  // Shows a context and saves it
  const showAndPersist = useCallback(
    (next: FilterCondition[]) => {
      setHeld({ slug, context: next });
      persist(next);
    },
    [slug, persist],
  );

  // 1. Nothing to read (no slug, or the read failed): start from the initial values and the defaults, so the view still
  // answers
  useLayoutEffect(() => {
    const canRead = slug != null && !readFailed;
    if (hasHeld || canRead) return;
    setHeld({ slug, context: withDefaults(initialRef.current, defaults, { isOpening: true, resetOnOpen }) });
  }, [hasHeld, slug, readFailed, defaults, resetOnOpen]);

  // 2. The saved context arrives: show it with its defaults filled, and save it if filling changed it
  useLayoutEffect(() => {
    if (hasHeld || !stored) return;
    const next = withDefaults(stored, defaults, { isOpening: true, resetOnOpen });
    setHeld({ slug, context: next });
    if (!deepEqual(next, stored)) persist(next);
  }, [hasHeld, stored, defaults, resetOnOpen, slug, persist]);

  // 3. The saved context was read again (after a failed save): show it, unless a change of ours is still saving
  useLayoutEffect(() => {
    if (!hasHeld || isSaving || !stored) return;
    const next = withDefaults(stored, defaults);
    if (deepEqual(next, held.context)) return;
    setHeld({ slug, context: next });
    if (!deepEqual(next, stored)) persist(next);
  }, [hasHeld, isSaving, stored, held, defaults, slug, persist]);

  // 4. A default that becomes known after the context loaded is filled in
  useLayoutEffect(() => {
    if (!hasHeld) return;
    const next = withDefaults(held.context, defaults);
    if (next !== held.context) showAndPersist(next);
  }, [hasHeld, held, defaults, showAndPersist]);

  const setContext = useCallback(
    (field: string, condition: FilterCondition | null) => {
      if (!hasHeld) return;
      const current = held.context.find((existing) => existing.field === field) ?? null;
      if (deepEqual(current, condition)) return;
      const cleared = resets[field] ?? NO_FIELDS;
      const next = withDefaults(withChange(held.context, field, condition, cleared), defaults);
      showAndPersist(next);
      onChangeRef.current?.(field, condition);
      // The fields the change cleared are reported too, as they now stand: gone, or back on their default
      for (const reset of cleared) {
        const before = held.context.find((existing) => existing.field === reset) ?? null;
        const after = next.find((existing) => existing.field === reset) ?? null;
        if (!deepEqual(before, after)) onChangeRef.current?.(reset, after);
      }
    },
    [hasHeld, held, resets, defaults, showAndPersist],
  );

  const contextValue = useCallback((field: string) => readValue(context, field), [context]);
  const contextValues = useCallback((field: string) => readValues(context, field), [context]);
  const required = useMemo(() => new Set(defaults.map((condition) => condition.field)), [defaults]);
  const { hasSettlingFields, markFieldSettling } = useSettlingFields();
  const [selectedOptions, setHeldOptions] = useState<TOption[]>(NO_OPTIONS as TOption[]);
  // The same options again leave the held ones in place, so the page does not render for nothing
  const setSelectedOptions = useCallback(
    (options: TOption[]) => setHeldOptions((current) => (deepEqual(current, options) ? current : options)),
    [],
  );

  const isLoaded = hasHeld;
  const isSettling = !isLoaded || isSaving || hasSettlingFields;

  return useMemo(
    () => ({
      context,
      contextValue,
      contextValues,
      setContext,
      required,
      isLoaded,
      isSaving,
      isSettling,
      markFieldSettling,
      selectedOptions,
      selectedOption: selectedOptions[0] ?? null,
      setSelectedOptions,
    }),
    [
      context,
      contextValue,
      contextValues,
      setContext,
      required,
      isLoaded,
      isSaving,
      isSettling,
      markFieldSettling,
      selectedOptions,
      setSelectedOptions,
    ],
  );
}
