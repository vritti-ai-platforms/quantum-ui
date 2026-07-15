import * as React from 'react';
import { cn } from '../../../shadcn/utils';
import { Typography } from '../Typography';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  titleSlot?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, titleSlot, description, actions, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4 animate-in fade-in slide-in-from-bottom-1 duration-300',
          className,
        )}
        {...props}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Typography variant="h3">{title}</Typography>
            {titleSlot}
          </div>
          {description && (
            <Typography variant="body2" intent="muted">
              {description}
            </Typography>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2 self-center">{actions}</div>}
      </div>
    );
  },
);

PageHeader.displayName = 'PageHeader';
