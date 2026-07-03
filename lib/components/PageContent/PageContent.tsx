import type React from 'react';
import { cn } from '../../../shadcn/utils';

export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface SidePanelListItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export interface PageContentPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  children?: React.ReactNode;
  header?: React.ReactNode;
  actions?: React.ReactNode;
  content?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  isLoading?: boolean;
  loadingContent?: React.ReactNode;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
}

export interface PageContentDetailsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  children?: React.ReactNode;
  content?: React.ReactNode;
  isLoading?: boolean;
  loadingContent?: React.ReactNode;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
}

export function PanelSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: <static list of skeletons, not dynamic>
          key={`panel-skeleton-${i}`}
          className="rounded-md border p-3 space-y-2"
        >
          <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/** Reusable selectable row button for side-panel lists. */
export function SidePanelListItem({ active = false, className, type = 'button', ...props }: SidePanelListItemProps) {
  return (
    <button
      type={type}
      className={cn(
        'w-full rounded-md border px-3 py-2 text-left transition-colors',
        active ? 'bg-accent border-accent' : 'hover:bg-accent/40',
        className,
      )}
      {...props}
    />
  );
}

/** A bordered container that fills available viewport height, used for split-panel layouts. */
export function PageContent({ children, className, ...props }: PageContentProps) {
  return (
    <div
      className={cn('flex w-full overflow-hidden rounded-xl border bg-background', className)}
      style={{ height: 'calc(100vh - 220px)' }}
      {...props}
    >
      {children}
    </div>
  );
}

/** Left panel region inside PageContent. Supports standard header/actions/content layout. */
export function PageContentPanel({
  children,
  className,
  header,
  actions,
  content,
  headerClassName,
  contentClassName,
  isLoading,
  loadingContent,
  isEmpty,
  emptyState,
  ...props
}: PageContentPanelProps) {
  const panelBody = content ?? children;
  const hasActions = Boolean(actions);

  const showEmpty = !isLoading && isEmpty;

  const resolvedBody = isLoading ? (loadingContent ?? <PanelSkeleton />) : showEmpty ? emptyState : panelBody;

  const resolvedContentClassName = showEmpty
    ? cn('flex-1 overflow-auto flex items-center justify-center', contentClassName)
    : cn('flex-1 overflow-auto', contentClassName);

  return (
    <div className={cn('w-72 border-r flex flex-col shrink-0 overflow-hidden', className)} {...props}>
      {(header || actions) && (
        <div
          className={cn('border-b p-3', hasActions ? 'flex items-center justify-between gap-2' : '', headerClassName)}
        >
          <div className={cn('min-w-0', hasActions ? 'flex-1' : '')}>
            {typeof header === 'string' ? <div className="text-sm font-medium">{header}</div> : header}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      <div className={resolvedContentClassName}>{resolvedBody}</div>
    </div>
  );
}

/**
 * Right details region inside PageContent.
 *
 * State precedence: isLoading → loadingContent (or PanelSkeleton fallback)
 *                   isEmpty   → emptyState (centered)
 *                   else      → content || children
 *
 * Mirrors PageContentPanel's loading/empty API so callers can declaratively express
 * all three states without inline ternaries.
 */
export function PageContentDetails({
  children,
  className,
  content,
  isLoading,
  loadingContent,
  isEmpty,
  emptyState,
  ...props
}: PageContentDetailsProps) {
  const body = content ?? children;
  const showEmpty = !isLoading && isEmpty;

  const resolved = isLoading ? (loadingContent ?? <PanelSkeleton />) : showEmpty ? emptyState : body;

  const layoutClass = showEmpty
    ? 'flex-1 overflow-auto p-6 min-w-0 flex items-center justify-center'
    : 'flex-1 overflow-auto p-6 min-w-0';

  return (
    <div className={cn(layoutClass, className)} {...props}>
      {resolved}
    </div>
  );
}
