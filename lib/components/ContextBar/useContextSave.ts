import { useCallback, useEffect, useRef, useState } from 'react';
import { putContextState } from '../../services/context-states.service';
import type { FilterCondition } from '../../types/conditions';

const SAVE_DELAY_MS = 150;

export interface ContextSave {
  slug: string;
  context: FilterCondition[];
}

interface NumberedSave extends ContextSave {
  // Counts up with every save, so a save can tell whether a newer one has replaced it
  number: number;
}

interface UseContextSaveOptions {
  // Called when the latest save has reached the server
  onSaved: (save: ContextSave) => unknown;
  // Called when the latest save could not be stored
  onFailed: () => unknown;
}

// Saves a view's context to the server, 150 ms after the last change:
// - saves reach the server in the order they were made, each one after the previous one finished
// - only the latest save reports back, so an older one finishing late changes nothing
// - a change still waiting when the view goes away (or switches to another slug) is saved straight away
export function useContextSave({ onSaved, onFailed }: UseContextSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const latestNumber = useRef(0);
  const waiting = useRef<NumberedSave | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousRequest = useRef<Promise<boolean>>(Promise.resolve(true));
  const callbacks = useRef({ onSaved, onFailed });
  callbacks.current = { onSaved, onFailed };

  // Sends one save once the previous one has finished. Resolves whether it reached the server; it never rejects, so one
  // failed save doesn't stop the ones after it.
  const send = useCallback((save: ContextSave): Promise<boolean> => {
    const request = previousRequest.current.then(() =>
      putContextState(save.slug, save.context).then(
        () => true,
        () => false,
      ),
    );
    previousRequest.current = request;
    return request;
  }, []);

  // Sends the waiting save, then reports back unless a newer save has replaced it
  const sendWaiting = useCallback(async () => {
    const save = waiting.current;
    if (!save) return;
    waiting.current = null;

    const reachedServer = await send(save);
    const isLatest = save.number === latestNumber.current;
    if (!isLatest) return;

    if (reachedServer) await callbacks.current.onSaved(save);
    else await callbacks.current.onFailed();
    setIsSaving(false);
  }, [send]);

  const save = useCallback(
    (slug: string, context: FilterCondition[]) => {
      const previous = waiting.current;
      if (previous && previous.slug !== slug) void send(previous);

      latestNumber.current += 1;
      waiting.current = { slug, context, number: latestNumber.current };
      setIsSaving(true);

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(sendWaiting, SAVE_DELAY_MS);
    },
    [send, sendWaiting],
  );

  // Leaving the view saves a change that is still waiting
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (waiting.current) void send(waiting.current);
    },
    [send],
  );

  return { save, isSaving };
}
