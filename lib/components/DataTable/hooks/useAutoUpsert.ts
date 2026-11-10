import { useEffect, useRef, useState } from 'react';
import { putTableState } from '../../../services/table-views.service';
import { toast } from '../../Sonner/toast';
import { useDataTableStore } from '../store/store';

const SAVE_DELAY_MS = 150;

interface SaveRequest {
  slug: string;
  saveRequest: number;
}

// Saves a table's live state and lets the page refetch; a failed save says so. It never rejects.
async function saveTableState(slug: string, onStatePush: (() => unknown) | undefined): Promise<void> {
  const table = useDataTableStore.getState().tables[slug];
  if (!table) return;
  const saved = await putTableState(slug, table.activeState, table.activeViewId).then(
    () => true,
    () => false,
  );
  if (saved) await onStatePush?.();
  else toast.error("Couldn't apply the change", { description: 'The table still shows the earlier results.' });
}

// Saves the table's live state 150 ms after the user's last change (a filter, sort, page, column or view switch), then
// lets the page refetch. Loading from the server never asks for a save, and nothing is saved before the stored state is
// shown — a change made earlier (an earlier visit's, or one to the empty starting state) is dropped.
// Returns whether the latest change is still on its way: waiting out the delay, saving, or refetching.
export function useAutoUpsert(slug: string, isReady: boolean, onStatePush: (() => unknown) | undefined): boolean {
  const onStatePushRef = useRef(onStatePush);
  onStatePushRef.current = onStatePush;

  // Every change bumps the table's save request; the last one seen tells a new change from a re-render
  const saveRequest = useDataTableStore((s) => s.tables[slug]?.saveRequest ?? 0);
  const lastSeen = useRef<SaveRequest>({ slug, saveRequest });
  // The change being saved, until the page's refetch for it lands
  const [inFlight, setInFlight] = useState<SaveRequest | null>(null);

  useEffect(() => {
    const seen = lastSeen.current;
    lastSeen.current = { slug, saveRequest };
    const isNewChange = seen.slug === slug && seen.saveRequest !== saveRequest;
    if (!isReady || !isNewChange) return;

    const request: SaveRequest = { slug, saveRequest };
    const finish = () =>
      setInFlight((current) =>
        current?.slug === request.slug && current.saveRequest === request.saveRequest ? null : current,
      );
    setInFlight(request);

    let started = false;
    const timer = setTimeout(async () => {
      started = true;
      await saveTableState(slug, onStatePushRef.current);
      finish();
    }, SAVE_DELAY_MS);

    // A newer change (or leaving the table) cancels this one if it hasn't started yet
    return () => {
      clearTimeout(timer);
      if (!started) finish();
    };
  }, [slug, saveRequest, isReady]);

  return inFlight?.slug === slug;
}
