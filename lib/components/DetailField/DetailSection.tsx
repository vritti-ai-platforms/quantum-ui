import type React from 'react';
import { cn } from '../../../shadcn/utils';

export interface DetailSectionProps {
  children: React.ReactNode;
  className?: string;
  wrap?: boolean;
}

export const DetailSection: React.FC<DetailSectionProps> = ({ children, className, wrap }) => (
  <div
    className={cn(
      'inline-flex items-stretch divide-x divide-border rounded-md border bg-muted/40 overflow-hidden',
      wrap && 'flex-wrap',
      className,
    )}
  >
    {children}
  </div>
);
