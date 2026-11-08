import { useEffect, useRef } from 'react';
import { pushTableState } from '../../../services/table-views.service';
import { useDataTableStore } from '../store/store';

// Saves the table's live state to Redis 150 ms after the user's last change (a filter, sort, page, column or view
// switch), then lets the page refetch. Loading from the server never asks for a save, and nothing is saved before the
// stored state is shown — a change made earlier (an earlier visit's, or one to the empty starting state) is dropped.
export function useAutoUpsert(slug: string, isReady: boolean, onStatePush: (() => unknown) | undefined) {
  const onStatePushRef = useRef(onStatePush);
  onStatePushRef.current = onStatePush;

  const saveRequest = useDataTableStore((s) => s.tables[slug]?.saveRequest ?? 0);
  const handledRef = useRef({ slug, saveRequest });

  useEffect(() => {
    const handled = handledRef.current;
    handledRef.current = { slug, saveRequest };
    if (!isReady || handled.slug !== slug || handled.saveRequest === saveRequest) return;

    const timer = setTimeout(() => {
      const table = useDataTableStore.getState().tables[slug];
      if (!table) return;
      pushTableState(slug, table.activeState, table.activeViewId).then(() => onStatePushRef.current?.());
    }, 150);

    return () => clearTimeout(timer);
  }, [slug, saveRequest, isReady]);
}
