import type React from 'react';
import { cn } from '../../../shadcn/utils';
import { Typography } from '../Typography';

export interface DetailHeaderProps {
  /** The record's title/name */
  title: React.ReactNode;
  /** Inline badges shown next to the title (code, status, role, …) — pass your own <Badge> elements */
  badges?: React.ReactNode;
  /** Optional muted description under the title */
  description?: React.ReactNode;
  /** Right-aligned action buttons */
  actions?: React.ReactNode;
  className?: string;
}

// Standard detail-view header: title + inline badges on the left, action buttons on the right.
// Pair with <DetailSection> on detail panels/pages so every record header shares one layout.
export const DetailHeader: React.FC<DetailHeaderProps> = ({ title, badges, description, actions, className }) => (
  <div className={cn('flex items-start justify-between gap-4', className)}>
    <div className="min-w-0 space-y-1">
      <div className="flex flex-wrap items-center gap-3">
        <Typography variant="h4">{title}</Typography>
        {badges}
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

DetailHeader.displayName = 'DetailHeader';
