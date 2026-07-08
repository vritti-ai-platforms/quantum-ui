import type { UseMutationResult } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from '../utils/hotkeys';

const DEFAULT_MIN_LENGTH = 3;
const DEFAULT_MAX_INTERVAL_MS = 50;
const MAX_SCAN_DURATION_MS = 500;

export interface UseBarcodeScannerOptions<TData, TError, TVariables> {
  mutation: UseMutationResult<TData, TError, TVariables>;
  toVariables: (code: string) => TVariables;
  enabled?: boolean;
  toggleShortcut?: string;
  exitShortcut?: string;
  minLength?: number;
  maxIntervalMs?: number;
}

export interface UseBarcodeScannerResult {
  isActive: boolean;
  isPending: boolean;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  toggleShortcut: string;
  exitShortcut: string;
}

export function useBarcodeScanner<TData, TError, TVariables>({
  mutation,
  toVariables,
  enabled = true,
  toggleShortcut = 'alt+s',
  exitShortcut = 'escape',
  minLength = DEFAULT_MIN_LENGTH,
  maxIntervalMs = DEFAULT_MAX_INTERVAL_MS,
}: UseBarcodeScannerOptions<TData, TError, TVariables>): UseBarcodeScannerResult {
  const [isActive, setIsActive] = useState(false);

  const enable = () => setIsActive(true);
  const disable = () => setIsActive(false);
  const toggle = () => setIsActive((v) => !v);

  // Auto-disable when the gating condition turns false
  useEffect(() => {
    if (!enabled) setIsActive(false);
  }, [enabled]);

  // Cross-platform toggle shortcut
  useHotkeys(toggleShortcut, toggle, { enabled: enabled });
  // Escape exits only when active
  useHotkeys(exitShortcut, disable, { enabled: isActive });

  // Keyboard-wedge burst detector
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const scanStartTimeRef = useRef(0);
  const mutateRef = useRef(mutation.mutate);
  mutateRef.current = mutation.mutate;
  const toVariablesRef = useRef(toVariables);
  toVariablesRef.current = toVariables;

  useEffect(() => {
    if (!isActive || !enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as Element | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.hasAttribute('contenteditable')
      )
        return;

      const now = Date.now();
      const gap = now - lastKeyTimeRef.current;

      if (event.key === 'Enter') {
        const elapsed = now - scanStartTimeRef.current;
        const code = bufferRef.current;
        bufferRef.current = '';
        lastKeyTimeRef.current = 0;
        scanStartTimeRef.current = 0;
        if (code.length >= minLength && elapsed <= MAX_SCAN_DURATION_MS) {
          event.preventDefault();
          mutateRef.current(toVariablesRef.current(code));
        }
        return;
      }

      if (event.key.length !== 1) return;

      if (gap > maxIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = '';
        scanStartTimeRef.current = 0;
      }

      if (bufferRef.current.length === 0) scanStartTimeRef.current = now;

      bufferRef.current += event.key;
      lastKeyTimeRef.current = now;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      bufferRef.current = '';
      lastKeyTimeRef.current = 0;
      scanStartTimeRef.current = 0;
    };
  }, [isActive, enabled, minLength, maxIntervalMs]);

  return {
    isActive,
    isPending: mutation.isPending,
    enable,
    disable,
    toggle,
    toggleShortcut,
    exitShortcut,
  };
}
