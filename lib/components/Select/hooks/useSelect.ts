import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
}: UseSelectProps): UseSelectReturn {
  const isAsync = !!optionsEndpoint;
  const instanceId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (!isAsync) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, searchDebounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, searchDebounceMs, isAsync]);

  // Query 1: Resolve selected values to full option objects
  const { data: resolvedSelected } = useQuery({
    queryKey: ['select-resolve', instanceId, optionsEndpoint, JSON.stringify(selectedValues)],
    queryFn: () =>
      axios
        .get<SelectOptionsResponse>(optionsEndpoint ?? '', {
          params: { values: selectedValues?.join(','), ...fieldKeys, ...params },
          showSuccessToast: false,
          showErrorToast: false,
        })
        .then((r) => r.data),
    enabled: isAsync && (selectedValues?.length ?? 0) > 0,
    staleTime: 5 * 60_000,
  });

  // Query 2: Paginated search results, excluding selected IDs
  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: [
      'select-search',
      instanceId,
      optionsEndpoint,
      debouncedSearch,
      JSON.stringify(fieldKeys),
      JSON.stringify(params),
    ],
    queryFn: ({ pageParam = 0 }) =>
      axios
        .get<SelectOptionsResponse>(optionsEndpoint ?? '', {
          params: {
            search: debouncedSearch || undefined,
            limit,
            offset: pageParam,
            excludeIds: selectedValues?.join(',') || undefined,
            ...fieldKeys,
            ...params,
          },
          showSuccessToast: false,
          showErrorToast: false,
        })
        .then((r) => r.data),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + limit : undefined,
    initialPageParam: 0,
    enabled: isAsync,
  });

  // Merge: resolved selected first, then search results (Set-based dedup)
  const fetchedOptions = useMemo(() => {
    const searchResults = data?.pages.flatMap((p) => p.options) ?? [];
    const selected = resolvedSelected?.options ?? [];
    if (selected.length === 0) return searchResults;

    const selectedIdSet = new Set(selected.map((o) => o.value));
    const dedupedSearch = searchResults.filter((o) => !selectedIdSet.has(o.value));
    return [...selected, ...dedupedSearch];
  }, [resolvedSelected, data]);

  const fetchedGroups = data?.pages[0]?.groups ?? staticGroups ?? [];

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
    loading: isFetching && !isFetchingNextPage,
    loadingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    searchQuery,
    setSearchQuery,
    sentinelRef,
  };
}
