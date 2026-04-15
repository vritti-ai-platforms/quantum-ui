import type React from 'react';
import { cn } from '../../../shadcn/utils';

export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface PageContentPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  children?: React.ReactNode;
  header?: React.ReactNode;
  options?: React.ReactNode;
  content?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

export interface PageContentDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** A bordered container that fills available viewport height, used for split-panel layouts. */
export function PageContent({ children, className, ...props }: PageContentProps) {
  return (
    <div
      className={cn('flex overflow-hidden rounded-xl border bg-background', className)}
      style={{ height: 'calc(100vh - 220px)' }}
      {...props}
    >
      {children}
    </div>
  );
}

/** Left panel region inside PageContent. Supports standard header/options/content layout. */
export function PageContentPanel({
  children,
  className,
  header,
  options,
  content,
  headerClassName,
  contentClassName,
  ...props
}: PageContentPanelProps) {
  const panelBody = content ?? children;
  const hasOptions = Boolean(options);

  return (
    <div className={cn('w-72 border-r flex flex-col shrink-0 overflow-hidden', className)} {...props}>
      {(header || options) && (
        <div
          className={cn(
            'border-b p-3',
            hasOptions ? 'flex items-center justify-between gap-2' : '',
            headerClassName,
          )}
        >
          <div className={cn('min-w-0', hasOptions ? 'flex-1' : '')}>
            {typeof header === 'string' ? <div className="text-sm font-medium">{header}</div> : header}
          </div>
          {options ? <div className="shrink-0">{options}</div> : null}
        </div>
      )}
      <div className={cn('flex-1 overflow-auto', contentClassName)}>{panelBody}</div>
    </div>
  );
}

/** Right details region inside PageContent. */
export function PageContentDetails({ children, className, ...props }: PageContentDetailsProps) {
  return (
    <div className={cn('flex-1 overflow-auto p-6 min-w-0', className)} {...props}>
      {children}
    </div>
  );
}
