import { cn } from '../../../shadcn/utils';

export interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** A bordered container that fills available viewport height, used for split-panel layouts. */
export function PageContent({ children, className, ...props }: PageContentProps) {
  return (
    <div
      className={cn('flex overflow-hidden rounded-xl border bg-card', className)}
      style={{ height: 'calc(100vh - 220px)' }}
      {...props}
    >
      {children}
    </div>
  );
}
