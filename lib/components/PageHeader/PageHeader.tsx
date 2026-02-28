import * as React from 'react';
import { cn } from '../../../shadcn/utils';
import { Typography } from '../Typography';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, actions, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-start justify-between gap-4', className)} {...props}>
        <div className="space-y-1">
          <Typography variant="h3">{title}</Typography>
          {description && (
            <Typography variant="body2" intent="muted">
              {description}
            </Typography>
          )}
        </div>
        {actions}
      </div>
    );
  },
);

PageHeader.displayName = 'PageHeader';
