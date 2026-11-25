import { type InfiniteData, keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { axios } from '../../../utils/axios';
import type { SelectFieldKeys, SelectGroup, SelectOption, SelectOptionsResponse, SelectValue } from '../types';

export interface UseSelectProps {
  options?: SelectOption[];
  groups?: SelectGroup[];
  optionsEndpoint?: string;
  searchDebounceMs?: number;
  limit?: number;
  fieldKeys?: SelectFieldKeys;
  params?: Record<string, string | number | boolean>;
  selectedValues?: SelectValue[];
  enabled?: boolean;
  open?: boolean;
}

export interface UseSelectReturn {
  options: SelectOption[];
  groups: SelectGroup[];
  loading: boolean;
  resolving: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  searchQuery: string;
  searching: boolean;
  /** Held values the server no longer has — deleted, or no longer offered for these params */
  missingValues: SelectValue[];
  /** The lookup of the held values hasn't answered yet, so whether they still exist isn't known */
  checkingValues: boolean;
  /** The held values as the server returns them under the current params, once that lookup has settled */
  heldOptions?: SelectOption[];
  /** The current params, serialized, so a caller can tell the held values were looked up again under new ones */
  paramsKey: string;
  setSearchQuery: (q: string) => void;
  sentinelRef: (node?: Element | null) => void;
}

const NOOP_REF = () => {};
const NO_VALUES: SelectValue[] = [];

// Stable JSON serialization for query keys (order-independent)
export function stableStringify(obj: object | undefined): string {
  if (!obj) return '';
  return JSON.stringify(obj, Object.keys(obj).sort());
}

// Manages async option fetching with debounced search, sentinel-based infinite scroll, and selected value resolution
export function useSelect({
  options: staticOptions,
  groups: staticGroups,
  optionsEndpoint,
  searchDebounceMs = 300,
  limit = 20,
  fieldKeys,
  params,
  selectedValues,
  enabled,
  open,
}: UseSelectProps): UseSelectReturn {
  const isAsync = !!optionsEndpoint;
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (!isAsync) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery === '') {
      setDebouncedSearch('');
      return;
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, searchDebounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, searchDebounceMs, isAsync]);

  // Serialize selected values to a comma-separated string of IDs (filters out booleans)
  const serializedValues = useMemo(
    () =>
      selectedValues && selectedValues.length > 0
        ? selectedValues.filter((v): v is string | number => typeof v !== 'boolean').join(',')
        : undefined,
    [selectedValues],
  );

  // Latest selection in a ref so the freeze effect can read it without depending on the (per-render) array identity
  const selectedValuesRef = useRef(selectedValues);
  selectedValuesRef.current = selectedValues;

  // Selection used to resolve + order options, snapshotted on open and frozen for the session, re-captured on next open
  const [resolveValues, setResolveValues] = useState(selectedValues);
  useEffect(() => {
    if (open) setResolveValues(selectedValuesRef.current);
  }, [open]);

  // While closed, track the bound value so a programmatic change (autofill / async reset) resolves its display
  // label. Keyed on the serialized (stable) value — NOT the array identity — to avoid a render loop.
  useEffect(() => {
    if (!open) setResolveValues(selectedValuesRef.current);
  }, [serializedValues, open]);

  const serializedResolveValues = useMemo(
    () =>
      resolveValues && resolveValues.length > 0
        ? resolveValues.filter((v): v is string | number => typeof v !== 'boolean').join(',')
        : undefined,
    [resolveValues],
  );

  // Query 1: Resolve selected values to full option objects
  const {
    data: resolvedSelected,
    isSuccess: isResolveSuccess,
    isError: isResolveError,
    isFetching: isResolveFetching,
    isPlaceholderData: isResolvePlaceholder,
  } = useQuery({
    queryKey: [
      'select-resolve',
      optionsEndpoint,
      stableStringify(fieldKeys),
      stableStringify(params),
      JSON.stringify(resolveValues),
    ],
    queryFn: () =>
      axios
        .get<SelectOptionsResponse>(optionsEndpoint ?? '', {
          params: { values: serializedResolveValues, ...fieldKeys, ...params },
          showSuccessToast: false,
          showErrorToast: false,
        })
        .then((r) => r.data),
    enabled: isAsync && (resolveValues?.length ?? 0) > 0,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  // The lookup has answered for exactly the held values — found or not, or failed (a failed lookup drops nothing)
  const hasHeldValues = isAsync && (resolveValues?.length ?? 0) > 0;
  const hasAnswered = (isResolveSuccess || isResolveError) && !isResolveFetching && !isResolvePlaceholder;
  const checkingValues = hasHeldValues && !hasAnswered;

  // The held values the lookup above didn't return. Only counted once a lookup for exactly these values has succeeded, so
  // a failed, pending or earlier lookup never marks a value as gone.
  const missingValues = useMemo(() => {
    const hasSettledLookup = isResolveSuccess && !isResolveFetching && !isResolvePlaceholder;
    if (!hasSettledLookup || !resolveValues?.length) return NO_VALUES;
    const found = new Set((resolvedSelected?.options ?? []).map((option) => String(option.value)));
    return resolveValues.filter((value) => typeof value !== 'boolean' && !found.has(String(value)));
  }, [isResolveSuccess, isResolveFetching, isResolvePlaceholder, resolveValues, resolvedSelected]);

  // The search query's key, one builder for the live query and for trimming the unsearched list on close
  const fieldKeysKey = stableStringify(fieldKeys);
  const paramsKey = stableStringify(params);
  const searchQueryKey = useCallback(
    (search: string) => ['select-search', optionsEndpoint, search, fieldKeysKey, paramsKey],
    [optionsEndpoint, fieldKeysKey, paramsKey],
  );

  // Query 2: Paginated search results, excluding selected IDs
  // The last search's results stay listed while the next one is fetched, rather than the list blanking on every search —
  // only when the search text alone changed: under other params or another endpoint they are not options at all
  const { data, isFetching, isFetchingNextPage, isPlaceholderData, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: searchQueryKey(debouncedSearch),
    queryFn: ({ pageParam = 0 }) =>
      axios
        .get<SelectOptionsResponse>(optionsEndpoint ?? '', {
          params: {
            search: debouncedSearch || undefined,
            limit,
            offset: pageParam,
            excludeIds: serializedValues,
            ...fieldKeys,
            ...params,
          },
          showSuccessToast: false,
          showErrorToast: false,
        })
        .then((r) => r.data),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => (lastPage.hasMore ? lastPageParam + limit : undefined),
    initialPageParam: 0,
    enabled: isAsync && enabled !== false,
    staleTime: 0,
    refetchOnMount: 'always',
    placeholderData: (previous, previousQuery) => {
      const previousKey = previousQuery?.queryKey;
      const sameScope =
        previousKey?.[1] === optionsEndpoint && previousKey?.[3] === fieldKeysKey && previousKey?.[4] === paramsKey;
      return sameScope ? previous : undefined;
    },
  });

  // On close, the unsearched list keeps only its first page: a reopen then shows that page at once and refetches just it,
  // rather than refetching every page scrolled through one after another and mounting them all before the list shows
  const queryClient = useQueryClient();
  useEffect(() => {
    if (open || !isAsync) return;
    queryClient.setQueryData<InfiniteData<SelectOptionsResponse, number>>(searchQueryKey(''), (cached) =>
      cached && cached.pages.length > 1
        ? { pages: cached.pages.slice(0, 1), pageParams: cached.pageParams.slice(0, 1) }
        : cached,
    );
  }, [open, isAsync, queryClient, searchQueryKey]);

  // Merge options with value-based dedup; during active search show only live results, not previously selected options
  const fetchedOptions = useMemo(() => {
    const searchResults = data?.pages.flatMap((p) => p.options) ?? [];
    const selected = resolvedSelected?.options ?? [];
    const uniqueByValue = new Map<string, SelectOption>();
    const makeKey = (value: SelectValue) => `${typeof value}:${String(value)}`;

    if (debouncedSearch.trim().length === 0) {
      for (const option of selected) {
        if (resolveValues?.includes(option.value)) {
          uniqueByValue.set(makeKey(option.value), option);
        }
      }
    }
    for (const option of searchResults) {
      const key = makeKey(option.value);
      if (!uniqueByValue.has(key)) {
        uniqueByValue.set(key, option);
      }
    }

    return Array.from(uniqueByValue.values());
  }, [resolvedSelected, data, debouncedSearch, resolveValues]);

  const heldOptions = useMemo(() => {
    const hasSettledLookup = isResolveSuccess && !isResolveFetching && !isResolvePlaceholder;
    return hasSettledLookup ? (resolvedSelected?.options ?? []) : undefined;
  }, [isResolveSuccess, isResolveFetching, isResolvePlaceholder, resolvedSelected]);

  const fetchedGroups = data?.pages[0]?.groups ?? staticGroups ?? [];
  const hasSearchResultsData = (data?.pages.length ?? 0) > 0;

  // IntersectionObserver sentinel for infinite scroll; the last search's results shown meanwhile have no next page here
  const { ref: sentinelRef, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isPlaceholderData) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isPlaceholderData, fetchNextPage]);

  // Static mode
  if (!isAsync) {
    return {
      options: staticOptions ?? [],
      groups: staticGroups ?? [],
      loading: false,
      resolving: false,
      loadingMore: false,
      hasMore: false,
      searchQuery,
      searching: false,
      missingValues: NO_VALUES,
      checkingValues: false,
      paramsKey,
      setSearchQuery,
      sentinelRef: NOOP_REF,
    };
  }

  return {
    options: fetchedOptions,
    groups: fetchedGroups,
    loading: isFetching && !isFetchingNextPage && !hasSearchResultsData,
    resolving: isResolveFetching && (isResolvePlaceholder || resolvedSelected == null),
    loadingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    searchQuery,
    searching: searchQuery !== debouncedSearch || (isFetching && !isFetchingNextPage),
    missingValues,
    checkingValues,
    heldOptions,
    paramsKey,
    setSearchQuery,
    sentinelRef,
  };
}
