import { useCallback, useState } from 'react';

const NO_FIELDS: ReadonlySet<string> = new Set();

// The context fields whose control is still settling its value — picking its first option, or checking that its held
// value still exists
export function useSettlingFields() {
  const [fields, setFields] = useState(NO_FIELDS);

  const markFieldSettling = useCallback((field: string, settling: boolean) => {
    setFields((current) => {
      if (current.has(field) === settling) return current;
      const next = new Set(current);
      if (settling) next.add(field);
      else next.delete(field);
      return next;
    });
  }, []);

  return { hasSettlingFields: fields.size > 0, markFieldSettling };
}
