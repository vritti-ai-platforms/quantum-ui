import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from '../../../shadcn/shadcnDialog';
import { cn } from '../../../shadcn/utils';
import type { DialogHandle } from '../../hooks/useDialog';

export interface DialogActionsProps {
  children: React.ReactNode;
  className?: string;
}

// Standard dialog/form action bar — a top divider with right-aligned buttons that stack on mobile.
// Use to wrap a form's submit/cancel buttons so every dialog shares the same footer layout.
export function DialogActions({ children, className }: DialogActionsProps) {
  return (
    <div className={cn('flex flex-col-reverse gap-2 border-t px-6 pt-4 pb-6 sm:flex-row sm:justify-end', className)}>
      {children}
    </div>
  );
}

DialogActions.displayName = 'DialogActions';

const OPEN_DIALOG_SELECTOR = '[data-state="open"][role="dialog"], [data-state="open"][role="alertdialog"]';

function ensurePointerEventsWatchdog() {
  const g = globalThis as { __quantumUiPointerWatchdog?: boolean };
  if (g.__quantumUiPointerWatchdog || typeof document === 'undefined') return;
  g.__quantumUiPointerWatchdog = true;
  const fix = () => {
    if (document.body.style.pointerEvents === 'none' && !document.querySelector(OPEN_DIALOG_SELECTOR)) {
      document.body.style.pointerEvents = '';
    }
  };
  new MutationObserver(fix).observe(document.body, { attributes: true, attributeFilter: ['style'] });
}

function isTopmostDialog(el: HTMLElement | null) {
  if (!el || typeof document === 'undefined') return true;
  const open = document.querySelectorAll(OPEN_DIALOG_SELECTOR);
  return open.length === 0 || open[open.length - 1] === el;
}

function ensureEscapeManager() {
  const g = globalThis as { __quantumUiEscapeMgr?: boolean };
  if (g.__quantumUiEscapeMgr || typeof document === 'undefined') return;
  g.__quantumUiEscapeMgr = true;
  document.addEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Escape') return;
      const confirmStore = (globalThis as { __quantumUiConfirmStore?: { getSnapshot: () => { open: boolean }; cancel: () => void } })
        .__quantumUiConfirmStore;
      if (!confirmStore?.getSnapshot().open) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      confirmStore.cancel();
    },
    true,
  );
}

export interface DialogProps {
  // Handle from useDialog() — controls open state and cleanup
  handle: DialogHandle;
  // anchor — render prop that receives open(); button renders outside DialogTrigger
  anchor?: (open: () => void) => React.ReactNode;
  // content — render prop that receives close()
  content?: (close: () => void) => React.ReactNode;
  // trigger — legacy ReactNode trigger (wrapped in DialogTrigger automatically)
  trigger?: React.ReactNode;
  // Required header icon — rendered as a badge before the title to standardize dialog headers.
  icon: LucideIcon;
  // Colour of the header icon badge. Use 'destructive' for delete dialogs, 'warning' for cautions.
  iconVariant?: 'default' | 'destructive' | 'warning';
  title: React.ReactNode;
  description: React.ReactNode;
  // Optional badge-style slot rendered inline with the title in the header.
  // Use for short status indicators tied to the dialog's subject (e.g. "Draft", "Derived unit").
  badgeSlot?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

// Composite dialog — controlled by a useDialog() handle
export function Dialog({
  handle,
  anchor,
  content,
  trigger,
  icon: Icon,
  iconVariant = 'default',
  title,
  description,
  badgeSlot,
  children,
  className,
}: DialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensurePointerEventsWatchdog();
    ensureEscapeManager();
  }, []);

  return (
    <ShadcnDialog open={handle.isOpen} onOpenChange={handle.onOpenChange}>
      {anchor ? anchor(handle.open) : trigger && <ShadcnDialogTrigger asChild>{trigger}</ShadcnDialogTrigger>}
      <ShadcnDialogContent
        ref={contentRef}
        className={cn('flex max-h-[95vh] flex-col gap-0 p-0', className)}
        onInteractOutside={(e) => {
          if (!isTopmostDialog(contentRef.current)) e.preventDefault();
        }}
      >
        <ShadcnDialogHeader className="shrink-0 border-b px-6 pt-6 pb-4">
          <ShadcnDialogTitle>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  iconVariant === 'destructive' && 'bg-destructive/10 text-destructive',
                  iconVariant === 'warning' && 'bg-warning/10 text-warning',
                  (!iconVariant || iconVariant === 'default') && 'bg-primary/10 text-primary',
                )}
              >
                <Icon className="size-4" />
              </span>
              <span>{title}</span>
              {badgeSlot}
            </span>
          </ShadcnDialogTitle>
          <ShadcnDialogDescription>{description}</ShadcnDialogDescription>
        </ShadcnDialogHeader>
        {content ? (
          content(handle.close)
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">{children}</div>
        )}
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
}

Dialog.displayName = 'Dialog';
