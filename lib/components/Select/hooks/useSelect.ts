import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  loadingMore: boolean;
  hasMore: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sentinelRef: (node?: Element | null) => void;
}

const NOOP_REF = () => {};

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
  const { data: resolvedSelected } = useQuery({
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

  // Query 2: Paginated search results, excluding selected IDs
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['select-search', optionsEndpoint, debouncedSearch, stableStringify(fieldKeys), stableStringify(params)],
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
  });

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

  const fetchedGroups = data?.pages[0]?.groups ?? staticGroups ?? [];
  const hasSearchResultsData = (data?.pages.length ?? 0) > 0;

  // IntersectionObserver sentinel for infinite scroll
  const { ref: sentinelRef, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Static mode
  if (!isAsync) {
    return {
      options: staticOptions ?? [],
      groups: staticGroups ?? [],
      loading: false,
      loadingMore: false,
      hasMore: false,
      searchQuery,
      setSearchQuery,
      sentinelRef: NOOP_REF,
    };
  }

  return {
    options: fetchedOptions,
    groups: fetchedGroups,
    loading: isFetching && !isFetchingNextPage && !hasSearchResultsData,
    loadingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    searchQuery,
    setSearchQuery,
    sentinelRef,
  };
}
