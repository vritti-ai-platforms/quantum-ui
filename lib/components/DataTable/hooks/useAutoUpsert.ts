import { useEffect, useRef } from 'react';
import { pushTableState } from '../../../services/table-views.service';
import type { TableViewState } from '../../../types/table-filter';

// Watches activeState and debounces a POST to /table-states (Redis) on every change
export function useAutoUpsert(
  slug: string,
  activeState: TableViewState,
  activeViewId: string | null,
  onStateApplied: (() => void) | undefined,
  consumeSkipUpsert: () => boolean,
) {
  const onStateAppliedRef = useRef(onStateApplied);
  onStateAppliedRef.current = onStateApplied;

  const prevActiveStateRef = useRef<TableViewState>(activeState);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Skip initial render
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevActiveStateRef.current = activeState;
      return;
    }

    // Skip if same reference (no change)
    if (prevActiveStateRef.current === activeState) return;
    prevActiveStateRef.current = activeState;

    // Skip upsert when state was loaded from server (loadViewState sets this flag)
    if (consumeSkipUpsert()) return;

    const timer = setTimeout(() => {
      pushTableState(slug, activeState, activeViewId).then(() => onStateAppliedRef.current?.());
    }, 150);

    return () => clearTimeout(timer);
  }, [activeState, activeViewId, slug, consumeSkipUpsert]);
}
