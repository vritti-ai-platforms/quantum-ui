import { useState } from 'react';

export interface DialogHandle {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

// Controls a dialog's open/close state
export function useDialog(): DialogHandle {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
