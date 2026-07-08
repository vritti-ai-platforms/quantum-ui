import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

export type LayoutMode = 'padded' | 'full';

interface LayoutModeContextValue {
  mode: LayoutMode;
  setMode: (mode: LayoutMode) => void;
}

const LayoutModeContext = createContext<LayoutModeContextValue>({
  mode: 'padded',
  setMode: () => {},
});

export const LayoutModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<LayoutMode>('padded');
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <LayoutModeContext.Provider value={value}>{children}</LayoutModeContext.Provider>;
};

// Returns current layout mode and a setter; MF pages set 'full' on mount and reset to 'padded' on unmount.
export function useLayoutMode(): LayoutModeContextValue {
  return useContext(LayoutModeContext);
}
