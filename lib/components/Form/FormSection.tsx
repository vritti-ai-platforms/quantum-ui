import type React from 'react';
import { cn } from '../../../shadcn/utils';

export interface FormSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
}: FormSectionProps) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className={cn('space-y-1', headerClassName)}>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className={cn(contentClassName)}>{children}</div>
    </section>
  );
}

FormSection.displayName = 'FormSection';
